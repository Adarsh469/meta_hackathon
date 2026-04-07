"""
server.py — FastAPI server for ClinicalTriage-Env
===================================================
Exposes the OpenEnv endpoints required by the competition spec:
  POST /reset  → initialise episode, return observation
  POST /step   → process one action, return observation + reward
  GET  /state  → return current internal state
  GET  /health → liveness probe for Hugging Face Spaces

Compatible with Hugging Face Spaces on port 7860.
"""

import os
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from env import ClinicalTriageEnv, TriageAction, ResetResult, StepResult

FRONTEND_DIR = Path(__file__).parent / "frontend"

app = FastAPI(
    title="ClinicalTriage-Env API",
    description=(
        "Emergency Department triage simulation environment. "
        "Implements the OpenEnv step()/reset()/state() interface."
    ),
    version="1.0.0",
)

# Allow cross-origin requests (required for HF Spaces)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# In-memory session store (single-process, single-user)
# ---------------------------------------------------------------------------

_sessions: Dict[str, ClinicalTriageEnv] = {}
_DEFAULT_TASK = os.getenv("DEFAULT_TASK", "task1_esi_assignment")


# ---------------------------------------------------------------------------
# Request / response helpers
# ---------------------------------------------------------------------------

class ResetRequest(BaseModel):
    task_id: Optional[str] = None
    seed: Optional[int] = None


class StepRequest(BaseModel):
    action_type: str
    esi_level: Optional[int] = None
    queue_order: Optional[list] = None
    question_topic: Optional[str] = None
    session_id: Optional[str] = "default"


class ResetRequestWithSession(ResetRequest):
    session_id: Optional[str] = "default"


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@app.get("/health")
def health() -> Dict[str, str]:
    """Liveness probe for Hugging Face Spaces."""
    return {"status": "ok", "env": "clinical-triage-env", "version": "1.0.0"}


@app.post("/reset")
def reset(request: ResetRequestWithSession = None) -> Dict[str, Any]:
    """
    Reset the environment.
    Body: { "task_id": "task1_esi_assignment" | "task2_queue_priority" | "task3_ambiguous_triage",
             "seed": <int|null>, "session_id": "default" }
    """
    if request is None:
        request = ResetRequestWithSession()

    task_id = request.task_id or _DEFAULT_TASK
    session_id = request.session_id or "default"

    valid_tasks = {
        "task1_esi_assignment",
        "task2_queue_priority",
        "task3_ambiguous_triage",
    }
    if task_id not in valid_tasks:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown task_id '{task_id}'. Valid: {sorted(valid_tasks)}",
        )

    env = ClinicalTriageEnv(task_id=task_id, seed=request.seed)
    _sessions[session_id] = env

    result: ResetResult = env.reset()
    return result.model_dump()


@app.post("/step")
def step(request: StepRequest) -> Dict[str, Any]:
    """
    Take one environment step.
    Body: { "action_type": "...", "esi_level": 3, "session_id": "default" }
    """
    session_id = request.session_id or "default"
    env = _sessions.get(session_id)
    if env is None:
        raise HTTPException(
            status_code=400,
            detail=f"No active session '{session_id}'. Call /reset first.",
        )

    try:
        action = TriageAction(
            action_type=request.action_type,
            esi_level=request.esi_level,
            queue_order=request.queue_order,
            question_topic=request.question_topic,
        )
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    try:
        result: StepResult = env.step(action)
    except RuntimeError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return result.model_dump()


@app.get("/state")
def state(session_id: str = "default") -> Dict[str, Any]:
    """Return current internal environment state."""
    env = _sessions.get(session_id)
    if env is None:
        raise HTTPException(
            status_code=400,
            detail=f"No active session '{session_id}'. Call /reset first.",
        )
    return env.state()


@app.get("/tasks")
def list_tasks() -> Dict[str, Any]:
    """List available tasks."""
    return {
        "tasks": [
            {
                "id": "task1_esi_assignment",
                "name": "Single Patient ESI Assignment",
                "difficulty": "easy",
                "description": "Assign ESI level (1-5) to a single patient.",
            },
            {
                "id": "task2_queue_priority",
                "name": "Patient Queue Prioritization",
                "difficulty": "medium",
                "description": "Order 5 patients from most to least urgent.",
            },
            {
                "id": "task3_ambiguous_triage",
                "name": "Ambiguous Triage with Hidden History",
                "difficulty": "hard",
                "description": (
                    "Uncover hidden medications/allergies via ask_question, "
                    "then assign ESI. Contraindication bonus available."
                ),
            },
        ]
    }


# ---------------------------------------------------------------------------
# Frontend static files  (must come AFTER all API routes)
# ---------------------------------------------------------------------------

@app.get("/", include_in_schema=False)
def serve_index():
    """Serve the frontend dashboard."""
    index = FRONTEND_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return JSONResponse({"status": "ok", "message": "ClinicalTriage-Env API — frontend not found"})

# Mount static assets (CSS, JS, images) under /static
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "7860"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)

