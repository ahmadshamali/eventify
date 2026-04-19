"""Merge migration heads

Revision ID: 9a7d1f2c4b6e
Revises: 8a1d4c2f9b7e, 5c3a6f9b2d4e
Create Date: 2026-04-19 02:10:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '9a7d1f2c4b6e'
down_revision: Union[str, Sequence[str], None] = ('8a1d4c2f9b7e', '5c3a6f9b2d4e')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
