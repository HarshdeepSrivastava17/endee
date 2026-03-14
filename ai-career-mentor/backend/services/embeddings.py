"""Embedding Service — OpenAI or local sentence-transformers"""

import os
from typing import List


class EmbeddingService:
    def __init__(self):
        self.provider = os.getenv("EMBEDDING_PROVIDER", "openai")
        if self.provider == "openai":
            from openai import AsyncOpenAI
            self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            self.model = "text-embedding-3-small"
            self.dimension = 1536
        else:
            from sentence_transformers import SentenceTransformer
            self.model_st = SentenceTransformer("all-MiniLM-L6-v2")
            self.dimension = 384
        print(f"[EmbeddingService] Provider: {self.provider}, dim={self.dimension}")

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if self.provider == "openai":
            resp = await self.client.embeddings.create(
                model=self.model,
                input=[t.replace("\n", " ") for t in texts]
            )
            return [item.embedding for item in resp.data]
        else:
            return self.model_st.encode(texts, convert_to_numpy=True).tolist()

    async def embed_query(self, query: str) -> List[float]:
        return (await self.embed_texts([query]))[0]
