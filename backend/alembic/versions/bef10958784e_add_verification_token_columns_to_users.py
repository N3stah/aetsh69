"""add_verification_token_columns_to_users

Revision ID: bef10958784e
Revises: b918eacc9209
Create Date: 2026-06-23

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'bef10958784e'
down_revision: Union[str, None] = 'b918eacc9209'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS verification_token VARCHAR(128) NULL,
        ADD COLUMN IF NOT EXISTS verification_token_expires TIMESTAMP WITH TIME ZONE NULL
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE users
        DROP COLUMN IF EXISTS verification_token,
        DROP COLUMN IF EXISTS verification_token_expires
    """)
