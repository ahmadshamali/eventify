"""Add unique constraint to users.email

Revision ID: 6f2a1e7c9b4a
Revises: d00f8c05b7af
Create Date: 2026-04-16 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6f2a1e7c9b4a'
down_revision: Union[str, None] = 'd00f8c05b7af'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index('uq_users_email', 'users', ['email'], unique=True)


def downgrade() -> None:
    op.drop_index('uq_users_email', table_name='users')
