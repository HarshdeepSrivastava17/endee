"""
AI Career Mentor for Developers
Main FastAPI Backend — Powered by Endee Vector Database
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
import uvicorn
import uuid

from services.document_processor import DocumentProcessor
from services.embeddings import EmbeddingService
from services.vector_store import VectorStore       # ← Endee
from services.rag_pipeline import RAGPipeline

app = FastAPI(title="AI Career Mentor API — Endee Edition", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

doc_processor  = DocumentProcessor()
embedding_svc  = EmbeddingService()
vector_store   = VectorStore()          # Endee vector store
rag            = RAGPipeline(embedding_svc, vector_store)


class QuestionRequest(BaseModel):
    question: str
    session_id: str

class UploadResponse(BaseModel):
    session_id: str
    message: str
    chunks_stored: int

class AdviceResponse(BaseModel):
    answer: str
    sources: list[str]
    session_id: str


@app.post("/upload", response_model=UploadResponse)
async def upload_documents(
    resume: UploadFile = File(...),
    job_description: UploadFile = File(...),
    session_id: Optional[str] = None,
):
    """Upload resume + JD → chunk → embed → store in Endee vector DB."""
    session_id = session_id or str(uuid.uuid4())
    try:
        resume_text = await doc_processor.extract_text(resume)
        jd_text     = await doc_processor.extract_text(job_description)

        resume_chunks = doc_processor.chunk_text(resume_text, doc_type="resume")
        jd_chunks     = doc_processor.chunk_text(jd_text,     doc_type="job_description")

        chunks_stored = await rag.ingest(resume_chunks + jd_chunks, session_id)

        return UploadResponse(
            session_id=session_id,
            message="Documents processed and stored in Endee vector DB.",
            chunks_stored=chunks_stored,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask", response_model=AdviceResponse)
async def ask(req: QuestionRequest):
    """Question → embed → Endee similarity search → RAG → career advice."""
    try:
        result = await rag.query(req.question, req.session_id)
        return AdviceResponse(
            answer=result["answer"],
            sources=result["sources"],
            session_id=req.session_id,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/ask/stream")
async def ask_stream(req: QuestionRequest):
    async def generate():
        async for token in rag.query_stream(req.question, req.session_id):
            yield f"data: {token}\n\n"
        yield "data: [DONE]\n\n"
    return StreamingResponse(generate(), media_type="text/event-stream")


@app.delete("/session/{session_id}")
async def clear_session(session_id: str):
    vector_store.delete_session(session_id)
    return {"message": f"Session {session_id} cleared from Endee."}


@app.get("/health")
async def health():
    indexes = vector_store.list_indexes()
    return {"status": "ok", "vector_db": "endee", "active_indexes": len(indexes)}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
