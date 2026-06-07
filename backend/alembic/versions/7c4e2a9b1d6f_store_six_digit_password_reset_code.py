"""Store six-digit password reset code

Revision ID: 7c4e2a9b1d6f
Revises: 2f7a9c1d8e5b
Create Date: 2026-06-07 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "7c4e2a9b1d6f"
down_revision: Union[str, None] = "2f7a9c1d8e5b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("users", "reset_password_code_hash")
    op.add_column("users", sa.Column("reset_password_code", sa.String(length=6), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "reset_password_code")
    op.add_column("users", sa.Column("reset_password_code_hash", sa.String(length=255), nullable=True))
