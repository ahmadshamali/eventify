"""add certificates table

Revision ID: c3d4e5f6a1b2
Revises: b2c3d4e5f6a1
Create Date: 2026-06-13 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql


# revision identifiers, used by Alembic.
revision: str = "c3d4e5f6a1b2"
down_revision: Union[str, Sequence[str], None] = "b2c3d4e5f6a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	op.create_table(
		"certificates",
		sa.Column("id", mysql.CHAR(36), nullable=False),
		sa.Column("event_id", sa.Integer(), nullable=False),
		sa.Column("registration_id", sa.Integer(), nullable=False),
		sa.Column("student_id", sa.Integer(), nullable=False),
		sa.Column("organizer_id", sa.Integer(), nullable=False),
		sa.Column("student_name", sa.String(length=255), nullable=False),
		sa.Column("organizer_name", sa.String(length=255), nullable=False),
		sa.Column("event_title", sa.String(length=255), nullable=False),
		sa.Column("issued_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
		sa.ForeignKeyConstraint(["event_id"], ["events.id"], ondelete="CASCADE"),
		sa.ForeignKeyConstraint(["registration_id"], ["registrations.id"], ondelete="CASCADE"),
		sa.ForeignKeyConstraint(["student_id"], ["users.user_id"], ondelete="CASCADE"),
		sa.ForeignKeyConstraint(["organizer_id"], ["users.user_id"], ondelete="CASCADE"),
		sa.PrimaryKeyConstraint("id"),
		sa.UniqueConstraint("registration_id", name="uq_certificate_registration"),
	)
	op.create_index(op.f("ix_certificates_id"), "certificates", ["id"], unique=False)
	op.create_index(op.f("ix_certificates_event_id"), "certificates", ["event_id"], unique=False)
	op.create_index(op.f("ix_certificates_registration_id"), "certificates", ["registration_id"], unique=True)
	op.create_index(op.f("ix_certificates_student_id"), "certificates", ["student_id"], unique=False)
	op.create_index(op.f("ix_certificates_organizer_id"), "certificates", ["organizer_id"], unique=False)


def downgrade() -> None:
	op.drop_index(op.f("ix_certificates_organizer_id"), table_name="certificates")
	op.drop_index(op.f("ix_certificates_student_id"), table_name="certificates")
	op.drop_index(op.f("ix_certificates_registration_id"), table_name="certificates")
	op.drop_index(op.f("ix_certificates_event_id"), table_name="certificates")
	op.drop_index(op.f("ix_certificates_id"), table_name="certificates")
	op.drop_table("certificates")