"""RAG Pipeline — Core engine connecting Endee search with LLM"""

import os
from typing import Dict, List, AsyncIterator
from services.embeddings import EmbeddingService
from services.vector_store import VectorStore

SYSTEM_PROMPT = """You are an expert AI Career Mentor for software developers.
You have analyzed the user's resume and the target job description.
Give HIGHLY PERSONALIZED, SPECIFIC, ACTIONABLE career advice.
Mention real skills, technologies, and experiences from their documents.
Identify skill gaps. Be honest, encouraging, and concrete."""

PROMPT_TEMPLATE = """CONTEXT FROM RESUME & JOB DESCRIPTION (retrieved via Endee vector search):
{context}

---
USER QUESTION: {question}

Give personalized career advice based on the above context."""


class RAGPipeline:
    def __init__(self, embeddings: EmbeddingService, vector_store: VectorStore):
        self.embeddings = embeddings
        self.vector_store = vector_store
        self.provider = os.getenv("LLM_PROVIDER", "openai")
        self._init_llm()

    def _init_llm(self):
        if self.provider == "openai":
            from openai import AsyncOpenAI
            self.llm = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            self.model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
        elif self.provider == "anthropic":
            import anthropic
            self.llm = anthropic.AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            self.model = os.getenv("ANTHROPIC_MODEL", "claude-3-5-haiku-20241022")

    async def ingest(self, chunks, session_id: str) -> int:
        texts = [c.text for c in chunks]
        metas = [c.metadata for c in chunks]
        embeddings = await self.embeddings.embed_texts(texts)
        return self.vector_store.upsert(texts, embeddings, metas, session_id)

    async def query(self, question: str, session_id: str) -> Dict:
        q_emb = await self.embeddings.embed_query(question)
        results = self.vector_store.search(q_emb, session_id, top_k=6)
        context = self._build_context(results)
        sources = list({r.metadata.get("doc_type", "unknown") for r in results})
        prompt = PROMPT_TEMPLATE.format(context=context, question=question)
        answer = await self._generate(prompt)
        return {"answer": answer, "sources": sources}

    async def query_stream(self, question: str, session_id: str) -> AsyncIterator[str]:
        q_emb = await self.embeddings.embed_query(question)
        results = self.vector_store.search(q_emb, session_id, top_k=6)
        context = self._build_context(results)
        prompt = PROMPT_TEMPLATE.format(context=context, question=question)
        async for token in self._generate_stream(prompt):
            yield token

    def _build_context(self, results) -> str:
        resume_parts = [r.text for r in results if r.metadata.get("doc_type") == "resume"]
        jd_parts     = [r.text for r in results if r.metadata.get("doc_type") == "job_description"]
        parts = []
        if resume_parts: parts.append("=== RESUME ===\n" + "\n\n".join(resume_parts))
        if jd_parts:     parts.append("=== JOB DESCRIPTION ===\n" + "\n\n".join(jd_parts))
        return "\n\n".join(parts)

    async def _generate(self, prompt: str) -> str:
        if self.provider == "openai":
            r = await self.llm.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": SYSTEM_PROMPT},
                          {"role": "user",   "content": prompt}],
                max_tokens=1200, temperature=0.7,
            )
            return r.choices[0].message.content
        elif self.provider == "anthropic":
            r = await self.llm.messages.create(
                model=self.model, system=SYSTEM_PROMPT,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1200,
            )
            return r.content[0].text

    async def _generate_stream(self, prompt: str) -> AsyncIterator[str]:
        if self.provider == "openai":
            stream = await self.llm.chat.completions.create(
                model=self.model,
                messages=[{"role": "system", "content": SYSTEM_PROMPT},
                          {"role": "user",   "content": prompt}],
                max_tokens=1200, stream=True,
            )
            async for chunk in stream:
                delta = chunk.choices[0].delta.content
                if delta: yield delta
