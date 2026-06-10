"""add event end datetime

Revision ID: a1f9b7c8d2e4
Revises: dfa5d3aa3df3
Create Date: 2026-04-25 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision: str = "a1f9b7c8d2e4"
down_revision: Union[str, None] = "b1a4f2d8e7c9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	inspector = inspect(op.get_bind())
	existing_columns = {column["name"] for column in inspector.get_columns("events")}
	if "end_datetime" not in existing_columns:
		op.add_column("events", sa.Column("end_datetime", sa.DateTime(), nullable=True))
	op.execute("UPDATE events SET end_datetime = DATE_ADD(start_datetime, INTERVAL 1 HOUR) WHERE end_datetime IS NULL")
	op.alter_column("events", "end_datetime", existing_type=sa.DateTime(), nullable=False)


def downgrade() -> None:
	op.drop_column("events", "end_datetime")