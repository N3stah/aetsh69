"""merge_photos_recipes_and_ai_analytics

Revision ID: 171f0c9e9175
Revises: c0c0d4deafca, 97451697b28f
Create Date: 2026-07-21 12:28:52.929969

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '171f0c9e9175'
down_revision: Union[str, Sequence[str], None] = ('c0c0d4deafca', '97451697b28f')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
