"""add_i18n_and_fix_updated_at

Revision ID: 5a0a524368da
Revises: d7f031231a93
Create Date: 2026-05-02 13:10:57.919859

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5a0a524368da'
down_revision: Union[str, Sequence[str], None] = 'd7f031231a93'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Fix updated_at server_default on all portfolio tables
    op.alter_column('experiences', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=sa.text('now()'),
               existing_nullable=True)
    op.alter_column('projects', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=sa.text('now()'),
               existing_nullable=True)
    op.alter_column('skill_categories', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=sa.text('now()'),
               existing_nullable=True)
    op.alter_column('skills', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=sa.text('now()'),
               existing_nullable=True)

    # Drop unique index on skill_categories.name BEFORE altering type
    op.drop_index(op.f('ix_skill_categories_name'), table_name='skill_categories')

    # Convert text columns to JSON for i18n support
    op.execute("""
        ALTER TABLE experiences
        ALTER COLUMN title TYPE JSON
        USING jsonb_build_object('en', title, 'es', title)::json
    """)

    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN title TYPE JSON
        USING jsonb_build_object('en', title, 'es', title)::json
    """)
    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN description TYPE JSON
        USING jsonb_build_object('en', description, 'es', description)::json
    """)

    op.execute("""
        ALTER TABLE skill_categories
        ALTER COLUMN name TYPE JSON
        USING jsonb_build_object('en', name, 'es', name)::json
    """)

    # Migrate existing responsibilities from list[str] to list[Translation]
    import json
    conn = op.get_bind()
    experiences = conn.execute(sa.text("SELECT id, responsibilities FROM experiences")).fetchall()
    for exp_id, responsibilities in experiences:
        if responsibilities is None:
            continue
        new_resp = [{"en": r, "es": r} for r in responsibilities]
        conn.execute(
            sa.text("UPDATE experiences SET responsibilities = :resp WHERE id = :id"),
            {"resp": json.dumps(new_resp), "id": exp_id}
        )


def downgrade() -> None:
    """Downgrade schema."""
    # Revert JSON columns back to text (best-effort: extracts 'en' value)
    op.execute("""
        ALTER TABLE skill_categories
        ALTER COLUMN name TYPE VARCHAR
        USING name->>'en'
    """)
    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN description TYPE TEXT
        USING description->>'en'
    """)
    op.execute("""
        ALTER TABLE projects
        ALTER COLUMN title TYPE VARCHAR
        USING title->>'en'
    """)
    op.execute("""
        ALTER TABLE experiences
        ALTER COLUMN title TYPE VARCHAR
        USING title->>'en'
    """)

    # Re-create unique index
    op.create_index(op.f('ix_skill_categories_name'), 'skill_categories', ['name'], unique=True)

    # Remove server_default from updated_at
    op.alter_column('skills', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=None,
               existing_nullable=True)
    op.alter_column('skill_categories', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=None,
               existing_nullable=True)
    op.alter_column('projects', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=None,
               existing_nullable=True)
    op.alter_column('experiences', 'updated_at',
               existing_type=sa.DateTime(timezone=True),
               server_default=None,
               existing_nullable=True)
