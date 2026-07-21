"""create_payments_table

Revision ID: 614daa381089
Revises: 3dc8260fe908
Create Date: 2026-06-25

"""
from typing import Sequence, Union
from alembic import op

revision: str = '614daa381089'
down_revision: Union[str, None] = '3dc8260fe908'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("COMMIT")
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE payment_provider AS ENUM ('mpesa', 'stripe');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        DO $$ BEGIN
            CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'cancelled');
        EXCEPTION WHEN duplicate_object THEN null;
        END $$;
    """)
    op.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            amount_kes NUMERIC(10,2) NOT NULL,
            currency VARCHAR(3) NOT NULL DEFAULT 'KES',
            provider payment_provider NOT NULL,
            status payment_status NOT NULL DEFAULT 'pending',
            provider_ref VARCHAR(255) NULL,
            merchant_request_id VARCHAR(255) NULL,
            checkout_request_id VARCHAR(255) NULL,
            metadata JSONB NULL,
            tier_unlocked VARCHAR(50) NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
        CREATE INDEX IF NOT EXISTS idx_payments_provider_ref ON payments(provider_ref);
    """)


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS payments;")
    op.execute("DROP TYPE IF EXISTS payment_status;")
    op.execute("DROP TYPE IF EXISTS payment_provider;")
