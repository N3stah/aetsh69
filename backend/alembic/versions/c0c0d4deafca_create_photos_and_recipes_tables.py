"""create photos and recipes tables

Revision ID: c0c0d4deafca
Revises: 614daa381089
Create Date: 2026-07-15 20:25:00.000000

"""
from alembic import op

# revision identifiers, used by Alembic.
revision = 'c0c0d4deafca'
down_revision = '614daa381089'
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.execute("""
        CREATE TABLE IF NOT EXISTS photos (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            image_url TEXT NOT NULL,
            location VARCHAR(255),
            description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)
    
    op.execute("""
        CREATE TABLE IF NOT EXISTS recipes (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            ingredients JSONB NOT NULL DEFAULT '[]',
            steps JSONB NOT NULL DEFAULT '[]',
            prep_time VARCHAR(50),
            cook_time VARCHAR(50),
            tags JSONB NOT NULL DEFAULT '[]',
            difficulty VARCHAR(50),
            image_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
    """)

def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS recipes;")
    op.execute("DROP TABLE IF EXISTS photos;")
