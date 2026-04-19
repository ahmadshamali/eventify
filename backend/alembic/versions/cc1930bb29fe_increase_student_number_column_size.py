"""increase_student_number_column_size

Revision ID: cc1930bb29fe
Revises: 9a7d1f2c4b6e
Create Date: 2026-04-19 00:59:31.014626

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'cc1930bb29fe'
down_revision: Union[str, None] = '9a7d1f2c4b6e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Modify student_number column from varchar(20) to varchar(255)
    op.alter_column('student_profiles', 'student_number', existing_type=sa.String(length=20), type_=sa.String(length=255))


def downgrade() -> None:
    # Revert student_number column from varchar(255) back to varchar(20)
    op.alter_column('student_profiles', 'student_number', existing_type=sa.String(length=255), type_=sa.String(length=20))
