"""merge feedback heads

Revision ID: 0d1e2f3a4b5c
Revises: c7d1e4a2b9f0, f1b2c3d4e5f6
Create Date: 2026-04-29 12:30:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '0d1e2f3a4b5c'
down_revision: Union[str, Sequence[str], None] = ('c7d1e4a2b9f0', 'f1b2c3d4e5f6')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
