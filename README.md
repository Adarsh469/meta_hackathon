---
title: ClinicalTriage-Env
emoji: 🏥
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
license: mit
---

# ClinicalTriage-Env 🏥

An Emergency Department triage simulator for AI agent evaluation.

---

## Hugging Face Docker Space Deployment

### 1. Create a new HF Space
- Go to https://huggingface.co/spaces → **Create new Space**
- **SDK:** Docker  ← important, not Gradio
- **Hardware:** CPU Basic (free tier is fine)

### 2. Add the Space as a git remote & push
```bash
git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/YOUR_SPACE_NAME
git push hf main
```
HF will automatically detect the `Dockerfile` and build the image.

### 3. Set secrets (optional — only needed for LLM calls)
- Space → **Settings → Variables and secrets**
- Add: `HF_TOKEN` = `hf_xxxx...`

The Gradio app will be live on port 7860 once the build finishes (~3–5 min).

---

## Run Locally

### With Docker (recommended)
```bash
HF_TOKEN=hf_xxxx docker compose up --build
# Frontend → http://localhost:3000  (Next.js dashboard)
# Backend  → http://localhost:7860  (FastAPI API)
```

### Gradio interface only (mirrors HF Space locally)
```bash
pip install -r requirements.txt
python app.py
# → http://localhost:7860
```

### Dev servers
```bash
# Terminal 1 — backend
./run.sh

# Terminal 2 — frontend
cd frontend && npm run dev
# → http://localhost:3000
```

---

## Tasks

| Task | Difficulty | Description |
|------|-----------|-------------|
| Task 1 — ESI Assignment | 🟢 Easy | Assign ESI 1–5 to a single patient |
| Task 2 — Queue Prioritization | 🟡 Medium | Order 5 patients by urgency (Kendall-Tau graded) |
| Task 3 — Ambiguous Triage | 🔴 Hard | Uncover hidden history via `ask_question`, then assign ESI |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/reset` | Start new episode |
| POST | `/step` | Take an action |
| GET | `/state` | Inspect session state |
| GET | `/health` | Liveness probe |
| GET | `/tasks` | List available tasks |
| GET | `/explain` | Clinical reasoning for last episode |
| POST | `/feedback` | Submit human decision for learning |
| GET | `/learned_heuristics` | View accumulated learning stats |

Full docs: `/docs` (Swagger UI)

## Recent Updates
- Redesigned dashboard with a light-mode medical/doctor theme
- Added Pulse AI logo (clickable, links to home) on all dashboard pages
- Removed MetaHackathon/OpenEnv references
- Improved Clinical Reasoning section UI
- Removed AI Agent Log section
- Added animated transitions to queue priority reordering

Commands:-
git clone https://github.com/Adarsh469/pulse.ai.git
cd pulse.ai
git checkout dashboard-redesign

Terminal 1:-
cd frontend
npm install
npm run dev


Terminal 2:-
pip install -r requirements.txt  
python app.py