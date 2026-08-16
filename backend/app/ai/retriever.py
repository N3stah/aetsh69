"""
Scikit-Learn TF-IDF Knowledge Retriever for AETSH-69 AI.
Trains on markdown knowledge base files and retrieves the most relevant
context for a given user query using cosine similarity.
"""
import os
import glob
import logging
import numpy as np
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

class KnowledgeRetriever:
    def __init__(self, knowledge_dir: str = "knowledge"):
        self.knowledge_dir = knowledge_dir
        self.documents: List[str] = []
        self.doc_metadata: List[Dict] = []
        self.vectorizer = None
        self.tfidf_matrix = None
        self._fitted = False

    def _load_documents(self):
        """Load all markdown files from the knowledge directory."""
        self.documents = []
        self.doc_metadata = []
        
        md_files = sorted(glob.glob(os.path.join(self.knowledge_dir, "*.md")))
        if not md_files:
            logger.warning("No knowledge base files found in %s", self.knowledge_dir)
            return

        for filepath in md_files:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                filename = os.path.basename(filepath)
                self.documents.append(content)
                self.doc_metadata.append({
                    'filename': filename,
                    'title': filename.replace('.md', '').replace('_', ' ').title(),
                    'path': filepath
                })
            except Exception as e:
                logger.error("Failed to load knowledge file %s: %s", filepath, e)

        logger.info("Loaded %d knowledge base documents", len(self.documents))

    def fit(self):
        """Train the TF-IDF vectorizer on all knowledge base documents."""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
        except ImportError:
            logger.error("scikit-learn not installed. Retriever disabled.")
            return False

        self._load_documents()
        if not self.documents:
            return False

        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 2),
            min_df=1,
            max_df=0.95,
            sublinear_tf=True
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(self.documents)
        self._fitted = True
        logger.info("TF-IDF retriever trained on %d documents (vocab size: %d)",
                     len(self.documents), len(self.vectorizer.vocabulary_))
        return True

    def retrieve(self, query: str, top_k: int = 3) -> List[Dict]:
        """Retrieve top-K most relevant documents for a query."""
        if not self._fitted:
            if not self.fit():
                return []

        try:
            from sklearn.metrics.pairwise import cosine_similarity
        except ImportError:
            return []

        if not self.vectorizer or self.tfidf_matrix is None:
            return []

        query_vec = self.vectorizer.transform([query])
        similarities = cosine_similarity(query_vec, self.tfidf_matrix).flatten()

        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            if similarities[idx] > 0.03:
                results.append({
                    'content': self.documents[idx],
                    'metadata': self.doc_metadata[idx],
                    'score': float(similarities[idx])
                })

        return results

    def get_context_for_query(self, query: str, top_k: int = 3) -> str:
        """Get formatted context string for a query, ready to inject into LLM prompt."""
        results = self.retrieve(query, top_k)
        if not results:
            return ""

        context_parts = ["\n\nRELEVANT KNOWLEDGE BASE CONTEXT (TF-IDF Retrieved):"]
        for result in results:
            context_parts.append(f"\n--- {result['metadata']['title']} (Relevance: {result['score']:.2f}) ---")
            # Truncate very long documents to save tokens
            content = result['content']
            if len(content) > 2000:
                content = content[:2000] + "..."
            context_parts.append(content)

        return "\n".join(context_parts)

    def get_stats(self) -> Dict:
        """Return training statistics for monitoring."""
        return {
            'document_count': len(self.documents),
            'vocabulary_size': len(self.vectorizer.vocabulary_) if self.vectorizer else 0,
            'is_fitted': self._fitted,
            'documents': [m['title'] for m in self.doc_metadata]
        }

    def refit(self):
        """Retrain the vectorizer (useful after knowledge base updates)."""
        self._fitted = False
        return self.fit()


# Global singleton instance
_retriever_instance: Optional[KnowledgeRetriever] = None

def get_retriever(knowledge_dir: str = "knowledge") -> KnowledgeRetriever:
    """Get or create the global retriever instance."""
    global _retriever_instance
    if _retriever_instance is None:
        _retriever_instance = KnowledgeRetriever(knowledge_dir)
        _retriever_instance.fit()
    return _retriever_instance
