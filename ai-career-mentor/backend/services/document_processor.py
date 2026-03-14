"""Document Processor — Text extraction + chunking"""

import re, io
from typing import List, Dict
from fastapi import UploadFile

try:
    import pdfplumber
    PDF_OK = True
except ImportError:
    PDF_OK = False

try:
    from docx import Document as DocxDoc
    DOCX_OK = True
except ImportError:
    DOCX_OK = False


class TextChunk:
    def __init__(self, text: str, metadata: Dict):
        self.text = text
        self.metadata = metadata


class DocumentProcessor:
    def __init__(self, chunk_size=500, overlap=60):
        self.chunk_size = chunk_size
        self.overlap = overlap

    async def extract_text(self, file: UploadFile) -> str:
        content = await file.read()
        name = file.filename.lower()
        if name.endswith(".pdf"):
            if not PDF_OK:
                raise ImportError("Run: pip install pdfplumber")
            pages = []
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                for p in pdf.pages:
                    t = p.extract_text()
                    if t: pages.append(t)
            return "\n\n".join(pages)
        elif name.endswith(".docx"):
            if not DOCX_OK:
                raise ImportError("Run: pip install python-docx")
            doc = DocxDoc(io.BytesIO(content))
            return "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        else:
            return content.decode("utf-8", errors="ignore")

    def chunk_text(self, text: str, doc_type: str) -> List[TextChunk]:
        text = re.sub(r'\s+', ' ', text).strip()
        words = text.split()
        chunks, i, idx = [], 0, 0
        while i < len(words):
            chunk_words = words[i:i + self.chunk_size]
            chunks.append(TextChunk(
                text=" ".join(chunk_words),
                metadata={"doc_type": doc_type, "chunk_index": idx}
            ))
            i += self.chunk_size - self.overlap
            idx += 1
        return chunks
