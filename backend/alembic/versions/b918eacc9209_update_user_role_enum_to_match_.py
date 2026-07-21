"""update_user_role_enum_to_match_membership_tiers

Revision ID: b918eacc9209
Revises: c30bcc9c4636
Create Date: 2026-06-23

"""
from typing import Sequence, Union
from alembic import op

revision: str = 'b918eacc9209'
down_revision: Union[str, None] = 'c30bcc9c4636'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Must commit enum additions before using them — use COMMIT explicitly
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'builder'")
    op.execute("ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'enterprise'")
    # Commit the enum changes first
    op.execute("COMMIT")
    # Now safe to use the new values
    op.execute("UPDATE users SET role='builder' WHERE role='pro'")
    op.execute("UPDATE users SET role='enterprise' WHERE role='vip'")


def downgrade() -> None:
    pass
