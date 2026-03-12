# 🎯 AI Career Mentor for Developers

Personalized AI-powered career guidance using RAG pipelines and Endee vector database.

## 📌 Project Overview

AI Career Mentor is a full-stack AI app that gives personalized career advice to developers. Upload your resume and job description — the RAG pipeline backed by Endee vector database finds relevant context and generates tailored advice.

### Problem Statement
- Developers don't know which skills they're missing for a role
- Generic resume advice ignores the actual job description  
- No personalized interview prep or salary guidance

## 🏗️ System Architecture
Resume + Job Description
↓
Document Processor (chunking 500 tokens)
↓
Embedding Service (OpenAI text-embedding-3-small)
↓
ENDEE VECTOR DATABASE (HNSW index, cosine similarity)
↓
User Question → Query Embedding
↓
Endee Similarity Search (top-6 chunks)
↓
LLM Generation (GPT-4o-mini)
↓
Personalized Career Advice

## 🔌 How Endee is Used

Endee is the core vector database via REST API:
- POST /api/v1/index/create — HNSW index per session
- POST /api/v1/index/{name}/insert — store embeddings
- POST /api/v1/index/{name}/search — cosine similarity search
- DELETE /api/v1/index/{name} — clear session

## 🚀 Setup

### Start Endee
docker run -d -p 8080:8080 endeeio/endee-server:latest

### Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python main.py

### Frontend
cd frontend
npm install
npm run dev

Open http://localhost:5173

## 📁 Project Structure
ai-career-mentor/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── services/
│       ├── vector_store.py
│       ├── document_processor.py
│       ├── embeddings.py
│       └── rag_pipeline.py
├── frontend/
│   └── src/App.jsx
└── README.md

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Vector Database | Endee (endee-io/endee) |
| Backend | FastAPI Python |
| Embeddings | OpenAI text-embedding-3-small |
| LLM | GPT-4o-mini |
| Frontend | React + Vite |

## 👤 About

Built for Endee.io Campus Recruitment Drive 2026 — Galgotias University, 2027 Batch.
