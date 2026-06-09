"""merge event feedback heads

Revision ID: 1a2b3c4d5e6f
Revises: 0d1e2f3a4b5c, d4c6f3a1b8e2
Create Date: 2026-04-29 12:40:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = '1a2b3c4d5e6f'
down_revision: Union[str, Sequence[str], None] = ('0d1e2f3a4b5c', 'd4c6f3a1b8e2')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
