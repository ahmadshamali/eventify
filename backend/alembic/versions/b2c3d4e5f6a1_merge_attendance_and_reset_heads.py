"""merge attendance and password reset heads

Revision ID: b2c3d4e5f6a1
Revises: 7c4e2a9b1d6f, a1b2c3d4e5f7
Create Date: 2026-06-08 01:00:00.000000

"""
from typing import Sequence, Union

revision: str = "b2c3d4e5f6a1"
down_revision: Union[str, Sequence[str], None] = ("7c4e2a9b1d6f", "a1b2c3d4e5f7")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
