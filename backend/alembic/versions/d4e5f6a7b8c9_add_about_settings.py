"""add_about_settings

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-08-04 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'c3d4e5f6a7b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'about_settings',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('text', postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column('image_url', sa.String(), nullable=True, server_default=''),
        sa.Column('layout', sa.String(), nullable=False, server_default='text-left'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_about_settings_id', 'about_settings', ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index('ix_about_settings_id', table_name='about_settings')
    op.drop_table('about_settings')
