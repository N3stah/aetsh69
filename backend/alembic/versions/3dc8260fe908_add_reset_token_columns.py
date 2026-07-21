"""add_reset_token_columns

Revision ID: 3dc8260fe908
Revises: 412b0dc6a3d4
Create Date: 2026-06-24 19:33:50.578468

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3dc8260fe908'
down_revision: Union[str, Sequence[str], None] = 'bef10958784e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
