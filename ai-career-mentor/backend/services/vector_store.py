"""
Vector Store Service — Powered by Endee.io
Replaces ChromaDB with Endee: High-Performance Open Source Vector Database
GitHub: https://github.com/endee-io/endee

Endee REST API endpoints used:
  POST   /api/v1/index/create          → create an index
  POST   /api/v1/index/{name}/insert   → insert vectors
  POST   /api/v1/index/{name}/search   → similarity search
  DELETE /api/v1/index/{name}          → delete an index
  GET    /api/v1/index/list            → list all indexes
"""

import os
import uuid
import requests
from typing import List, Dict


class SearchResult:
    def __init__(self, text: str, metadata: Dict, score: float):
        self.text = text
        self.metadata = metadata
        self.score = score


class EndeeVectorStore:
    """
    Vector store using Endee as the backend.
    Endee runs locally via Docker on port 8080.

    To start Endee (run this once before starting the app):
        docker run -d -p 8080:8080 endeeio/endee-server:latest

    Or with authentication:
        docker run -d -p 8080:8080 -e NDD_AUTH_TOKEN=your_token endeeio/endee-server:latest
    """

    def __init__(self):
        self.base_url = os.getenv("ENDEE_URL", "http://localhost:8080")
        self.auth_token = os.getenv("ENDEE_AUTH_TOKEN", "")  # optional
        self.dimension = int(os.getenv("EMBEDDING_DIM", "1536"))
        self._created_indexes = set()

        print(f"[EndeeVectorStore] Connected to Endee at {self.base_url}")
        self._verify_connection()

    def _headers(self) -> Dict:
        h = {"Content-Type": "application/json"}
        if self.auth_token:
            h["Authorization"] = self.auth_token
        return h

    def _verify_connection(self):
        """Check that Endee is running."""
        try:
            resp = requests.get(
                f"{self.base_url}/api/v1/index/list",
                headers=self._headers(),
                timeout=5,
            )
            resp.raise_for_status()
            print("[EndeeVectorStore] ✅ Endee is running and reachable.")
        except requests.exceptions.ConnectionError:
            raise ConnectionError(
                "\n\n❌ Cannot connect to Endee. Please start it with Docker:\n"
                "   docker run -d -p 8080:8080 endeeio/endee-server:latest\n"
                "Then restart this application.\n"
            )

    def _index_name(self, session_id: str) -> str:
        """Each session gets its own Endee index for isolation."""
        return f"career_mentor_{session_id.replace('-', '_')}"

    def _ensure_index(self, session_id: str):
        """Create the Endee index for this session if it doesn't exist."""
        name = self._index_name(session_id)
        if name in self._created_indexes:
            return name

        resp = requests.post(
            f"{self.base_url}/api/v1/index/create",
            headers=self._headers(),
            json={
                "name": name,
                "dimension": self.dimension,
                "metric": "cosine",       # cosine similarity
                "index_type": "hnsw",     # HNSW index for fast ANN search
            },
        )

        # 409 = already exists, that's fine
        if resp.status_code not in (200, 201, 409):
            raise RuntimeError(f"Failed to create Endee index: {resp.text}")

        self._created_indexes.add(name)
        print(f"[EndeeVectorStore] Index '{name}' ready.")
        return name

    # ── Public API ────────────────────────────────────────────────────────

    def upsert(
        self,
        texts: List[str],
        embeddings: List[List[float]],
        metadatas: List[Dict],
        session_id: str,
    ) -> int:
        """Insert text chunks + embeddings into Endee."""
        index_name = self._ensure_index(session_id)

        vectors = []
        for text, emb, meta in zip(texts, embeddings, metadatas):
            vectors.append({
                "id": str(uuid.uuid4()),
                "values": emb,                        # the embedding vector
                "metadata": {**meta, "text": text},   # store original text in metadata
            })

        resp = requests.post(
            f"{self.base_url}/api/v1/index/{index_name}/insert",
            headers=self._headers(),
            json={"vectors": vectors},
        )

        if resp.status_code not in (200, 201):
            raise RuntimeError(f"Endee insert failed: {resp.text}")

        print(f"[EndeeVectorStore] Inserted {len(vectors)} vectors into '{index_name}'")
        return len(vectors)

    def search(
        self,
        query_embedding: List[float],
        session_id: str,
        top_k: int = 6,
    ) -> List[SearchResult]:
        """Find top-k most similar vectors using Endee's similarity search."""
        index_name = self._index_name(session_id)

        resp = requests.post(
            f"{self.base_url}/api/v1/index/{index_name}/search",
            headers=self._headers(),
            json={
                "vector": query_embedding,
                "top_k": top_k,
                "include_metadata": True,
            },
        )

        if resp.status_code != 200:
            raise RuntimeError(f"Endee search failed: {resp.text}")

        data = resp.json()
        results = []

        # Endee returns: { "results": [{ "id", "score", "metadata" }] }
        for match in data.get("results", []):
            meta = match.get("metadata", {})
            text = meta.pop("text", "")   # extract text we stored in metadata
            score = match.get("score", 0.0)
            results.append(SearchResult(text=text, metadata=meta, score=score))

        return results

    def delete_session(self, session_id: str):
        """Delete the Endee index for this session."""
        index_name = self._index_name(session_id)
        resp = requests.delete(
            f"{self.base_url}/api/v1/index/{index_name}",
            headers=self._headers(),
        )
        self._created_indexes.discard(index_name)
        print(f"[EndeeVectorStore] Deleted index '{index_name}'")

    def list_indexes(self) -> List[str]:
        """List all Endee indexes."""
        resp = requests.get(
            f"{self.base_url}/api/v1/index/list",
            headers=self._headers(),
        )
        resp.raise_for_status()
        return resp.json().get("indexes", [])


# ── Backwards-compatible alias ─────────────────────────────────────────────
# The rest of the codebase uses VectorStore — this makes the swap transparent
VectorStore = EndeeVectorStore
