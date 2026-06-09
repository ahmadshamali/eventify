"""Seed default roles

Revision ID: 8a1d4c2f9b7e
Revises: 6f2a1e7c9b4a
Create Date: 2026-04-18 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8a1d4c2f9b7e'
down_revision: Union[str, None] = '6f2a1e7c9b4a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ROLES = (
    (1, "student"),
    (2, "organizer"),
    (3, "admin"),
)


def upgrade() -> None:
    conn = op.get_bind()

    for role_id, role_name in ROLES:
        conn.execute(
            sa.text(
                """
                INSERT INTO roles (role_id, role_name)
                SELECT :role_id, :role_name
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM roles
                    WHERE role_id = :role_id OR role_name = :role_name
                )
                """
            ),
            {"role_id": role_id, "role_name": role_name},
        )


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """
            DELETE FROM roles
            WHERE role_id IN (1, 2, 3)
              AND role_name IN ('student', 'organizer', 'admin')
            """
        )
    )
