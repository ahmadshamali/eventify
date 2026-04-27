"""merge event time heads

Revision ID: c7d1e4a2b9f0
Revises: b1a4f2d8e7c9, a1f9b7c8d2e4
Create Date: 2026-04-25 00:00:00.000000

"""

from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "c7d1e4a2b9f0"
down_revision: Union[str, Sequence[str], None] = ("b1a4f2d8e7c9", "a1f9b7c8d2e4")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	pass


def downgrade() -> None:
	pass