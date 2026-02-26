from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import os
import time
import uuid
import threading

app = FastAPI(title="Chatbot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.environ["GROQ_API_KEY"])

SYSTEM_PROMPT = (
    "Tu es un assistant immobilier expert. Tu aides les utilisateurs à comprendre "
    "le marché immobilier, les simulations de prêt, et les décisions d'investissement. "
    "Réponds en français, de manière concise et professionnelle."
)

# Stockage en mémoire des tâches
# { task_id: { status, result, error, created_at, latency_ms, tokens_used } }
tasks: dict = {}


class PromptRequest(BaseModel):
    prompt: str
    model: str = "groq/compound"


# ------------------------------------------------------------------
# Architecture 1 — REST Synchrone (inchangé)
# ------------------------------------------------------------------
@app.post("/api/chat")
def chat(req: PromptRequest):
    start = time.time()
    try:
        completion = client.chat.completions.create(
            model=req.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": req.prompt},
            ],
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

    elapsed = round(time.time() - start, 3)
    return {
        "response": completion.choices[0].message.content,
        "latency_ms": round(elapsed * 1000),
        "tokens_used": completion.usage.total_tokens,
        "model": req.model,
    }


# ------------------------------------------------------------------
# Architecture 2 — REST Asynchrone avec Polling
# ------------------------------------------------------------------

def _process_task(task_id: str, prompt: str, model: str) -> None:
    """Exécuté dans un thread daemon — appel Groq en arrière-plan."""
    tasks[task_id]["status"] = "processing"
    start = time.time()
    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt},
            ],
        )
        tasks[task_id].update(
            {
                "status": "done",
                "result": completion.choices[0].message.content,
                "tokens_used": completion.usage.total_tokens,
                "latency_ms": round((time.time() - start) * 1000),
            }
        )
    except Exception as e:
        tasks[task_id].update({"status": "error", "error": str(e)})


@app.post("/api/chat/async", status_code=202)
def chat_async(req: PromptRequest):
    task_id = str(uuid.uuid4())
    tasks[task_id] = {
        "status": "pending",
        "result": None,
        "error": None,
        "created_at": time.time(),
        "latency_ms": None,
        "tokens_used": None,
    }
    threading.Thread(
        target=_process_task,
        args=(task_id, req.prompt, req.model),
        daemon=True,
    ).start()
    return {"task_id": task_id, "status": "pending"}


@app.get("/api/tasks/{task_id}")
def get_task(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Tâche introuvable")
    task = tasks[task_id]
    response: dict = {"task_id": task_id, "status": task["status"]}
    if task["status"] == "done":
        response.update(
            {
                "result": task["result"],
                "latency_ms": task["latency_ms"],
                "tokens_used": task["tokens_used"],
            }
        )
    elif task["status"] == "error":
        response["error"] = task["error"]
    return response


@app.get("/health")
def health():
    return {"status": "ok", "service": "chatbot", "tasks_in_memory": len(tasks)}
