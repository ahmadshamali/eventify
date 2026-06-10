"""add waitlist table

Revision ID: e2c4a6b8d0f1
Revises: 1a2b3c4d5e6f
Create Date: 2026-06-07 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e2c4a6b8d0f1"
down_revision: Union[str, None] = "1a2b3c4d5e6f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	op.create_table(
		"waitlist",
		sa.Column("id", sa.Integer(), nullable=False),
		sa.Column("event_id", sa.Integer(), nullable=False),
		sa.Column("student_id", sa.Integer(), nullable=False),
		sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
		sa.ForeignKeyConstraint(["event_id"], ["events.id"]),
		sa.ForeignKeyConstraint(["student_id"], ["users.user_id"]),
		sa.PrimaryKeyConstraint("id"),
		sa.UniqueConstraint("event_id", "student_id", name="uq_waitlist_event_student"),
	)
	op.create_index(op.f("ix_waitlist_id"), "waitlist", ["id"], unique=False)
	op.create_index(op.f("ix_waitlist_event_id"), "waitlist", ["event_id"], unique=False)
	op.create_index(op.f("ix_waitlist_student_id"), "waitlist", ["student_id"], unique=False)


def downgrade() -> None:
	op.drop_index(op.f("ix_waitlist_student_id"), table_name="waitlist")
	op.drop_index(op.f("ix_waitlist_event_id"), table_name="waitlist")
	op.drop_index(op.f("ix_waitlist_id"), table_name="waitlist")
	op.drop_table("waitlist")
