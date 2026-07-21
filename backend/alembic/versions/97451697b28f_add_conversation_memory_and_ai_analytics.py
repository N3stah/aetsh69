"""add_conversation_memory_and_ai_analytics

Revision ID: 97451697b28f
Revises: 614daa381089
Create Date: 2026-07-07

"""
from typing import Sequence, Union
from alembic import op

revision: str = '97451697b28f'
down_revision: Union[str, None] = '614daa381089'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS conversation_messages (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            conversation_id UUID NOT NULL,
            role VARCHAR(20) NOT NULL,
            content TEXT NOT NULL,
            user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_conv_messages_cid ON conversation_messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_conv_messages_created ON conversation_messages(created_at DESC);

        CREATE TABLE IF NOT EXISTS ai_analytics (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            question TEXT NOT NULL,
            context VARCHAR(100),
            provider VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_ai_analytics_created ON ai_analytics(created_at DESC);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS conversation_messages;")
    op.execute("DROP TABLE IF EXISTS ai_analytics;")
