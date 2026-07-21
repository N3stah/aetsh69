from app.celery import celery_app
import logging

logger = logging.getLogger(__name__)

@celery_app.task
def process_knowledge_ingestion(document_id: str, content: str):
    """Background task to chunk and embed documents into pgvector."""
    logger.info(f"Ingesting document {document_id}")
    # TODO: wire to your RAG pipeline
    # from app.ai.embeddings import chunk_and_embed
    # chunk_and_embed(document_id, content)
    return {"status": "ingested", "document_id": document_id}
