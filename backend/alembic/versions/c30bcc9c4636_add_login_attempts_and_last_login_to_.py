"""add_login_attempts_and_last_login_to_users

Revision ID: c30bcc9c4636
Revises: 
Create Date: 2026-06-18

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = 'c30bcc9c4636'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("""
        ALTER TABLE users 
        ADD COLUMN IF NOT EXISTS login_attempts INTEGER NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE NULL,
        ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE NULL,
        ADD COLUMN IF NOT EXISTS last_login_ip VARCHAR(45) NULL
    """)


def downgrade() -> None:
    op.execute("""
        ALTER TABLE users
        DROP COLUMN IF EXISTS login_attempts,
        DROP COLUMN IF EXISTS locked_until,
        DROP COLUMN IF EXISTS last_login_at,
        DROP COLUMN IF EXISTS last_login_ip
    """)
