"""add certificate issued timestamp to attendance

Revision ID: 4d1b8a9f22cc
Revises: b2c3d4e5f6a1
Create Date: 2026-07-12 00:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4d1b8a9f22cc"
down_revision: Union[str, None] = "b2c3d4e5f6a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	op.add_column("attendance", sa.Column("certificate_issued_at", sa.DateTime(timezone=True), nullable=True))
	op.create_index(op.f("ix_attendance_certificate_issued_at"), "attendance", ["certificate_issued_at"], unique=False)


def downgrade() -> None:
	op.drop_index(op.f("ix_attendance_certificate_issued_at"), table_name="attendance")
	op.drop_column("attendance", "certificate_issued_at")