"""add event image and link

Revision ID: d4c6f3a1b8e2
Revises: c7d1e4a2b9f0
Create Date: 2026-04-25 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "d4c6f3a1b8e2"
down_revision: Union[str, None] = "c7d1e4a2b9f0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	op.add_column("events", sa.Column("image_url", sa.String(length=500), nullable=True))
	op.add_column("events", sa.Column("event_link", sa.String(length=500), nullable=True))


def downgrade() -> None:
	op.drop_column("events", "event_link")
	op.drop_column("events", "image_url")