"""add_contact_email_subject_to_notification_settings

Revision ID: a1b2c3d4e5f6
Revises: b0ecb01341ec
Create Date: 2026-08-03 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = 'b0ecb01341ec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        'notification_settings',
        sa.Column(
            'contact_email_subject',
            sa.String(),
            server_default='Contact form from wallydev.dev',
            nullable=True,
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('notification_settings', 'contact_email_subject')
