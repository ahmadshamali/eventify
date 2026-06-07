"""Add password reset fields

Revision ID: 2f7a9c1d8e5b
Revises: e2c4a6b8d0f1
Create Date: 2026-06-07 21:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "2f7a9c1d8e5b"
down_revision: Union[str, None] = "e2c4a6b8d0f1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("reset_password_code_hash", sa.String(length=255), nullable=True))
    op.add_column("users", sa.Column("reset_password_expires_at", sa.DateTime(), nullable=True))
    op.add_column("users", sa.Column("reset_password_attempts", sa.Integer(), nullable=False, server_default="0"))


def downgrade() -> None:
    op.drop_column("users", "reset_password_attempts")
    op.drop_column("users", "reset_password_expires_at")
    op.drop_column("users", "reset_password_code_hash")
