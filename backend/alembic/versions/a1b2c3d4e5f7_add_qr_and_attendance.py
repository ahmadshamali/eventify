"""add qr_token to registrations and attendance table

Revision ID: a1b2c3d4e5f7
Revises: e2c4a6b8d0f1
Create Date: 2026-06-08 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

revision: str = "a1b2c3d4e5f7"
down_revision: Union[str, None] = "e2c4a6b8d0f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	# Add qr_token to registrations (nullable first so existing rows are OK)
	op.add_column(
		"registrations",
		sa.Column("qr_token", mysql.CHAR(36), nullable=True),
	)
	# Populate existing rows with a UUID
	op.execute("UPDATE registrations SET qr_token = UUID() WHERE qr_token IS NULL")
	# Create unique index
	op.create_index("ix_registrations_qr_token", "registrations", ["qr_token"], unique=True)

	# Create attendance table
	op.create_table(
		"attendance",
		sa.Column("id", sa.Integer(), nullable=False, autoincrement=True),
		sa.Column("registration_id", sa.Integer(), nullable=False),
		sa.Column("event_id", sa.Integer(), nullable=False),
		sa.Column("student_id", sa.Integer(), nullable=False),
		sa.Column("scanned_by", sa.Integer(), nullable=False),
		sa.Column(
			"attended_at",
			sa.DateTime(timezone=True),
			server_default=sa.text("CURRENT_TIMESTAMP"),
			nullable=False,
		),
		sa.ForeignKeyConstraint(["registration_id"], ["registrations.id"], ondelete="CASCADE"),
		sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
		sa.ForeignKeyConstraint(["student_id"], ["users.user_id"], ondelete="CASCADE"),
		sa.ForeignKeyConstraint(["scanned_by"], ["users.user_id"], ondelete="CASCADE"),
		sa.PrimaryKeyConstraint("id"),
		sa.UniqueConstraint("registration_id", name="uq_attendance_registration"),
	)
	op.create_index(op.f("ix_attendance_id"), "attendance", ["id"], unique=False)
	op.create_index(op.f("ix_attendance_event_id"), "attendance", ["event_id"], unique=False)
	op.create_index(op.f("ix_attendance_student_id"), "attendance", ["student_id"], unique=False)
	op.create_index(op.f("ix_attendance_registration_id"), "attendance", ["registration_id"], unique=False)


def downgrade() -> None:
	op.drop_index(op.f("ix_attendance_registration_id"), table_name="attendance")
	op.drop_index(op.f("ix_attendance_student_id"), table_name="attendance")
	op.drop_index(op.f("ix_attendance_event_id"), table_name="attendance")
	op.drop_index(op.f("ix_attendance_id"), table_name="attendance")
	op.drop_table("attendance")
	op.drop_index("ix_registrations_qr_token", table_name="registrations")
	op.drop_column("registrations", "qr_token")
