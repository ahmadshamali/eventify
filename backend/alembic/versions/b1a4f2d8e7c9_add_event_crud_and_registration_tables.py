"""Add event CRUD fields and registration table

Revision ID: b1a4f2d8e7c9
Revises: cc1930bb29fe
Create Date: 2026-04-22 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1a4f2d8e7c9"
down_revision: Union[str, None] = "cc1930bb29fe"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("events", sa.Column("start_datetime", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False))
    op.add_column("events", sa.Column("location", sa.String(length=255), server_default="", nullable=False))
    op.add_column("events", sa.Column("category", sa.String(length=100), server_default="Technology", nullable=False))
    op.add_column("events", sa.Column("status", sa.Enum("Available", "Full", "Canceled", name="event_status_enum"), server_default="Available", nullable=False))
    op.add_column("events", sa.Column("organizer_id", sa.Integer(), nullable=True))

    op.alter_column("events", "title", existing_type=sa.String(length=255), type_=sa.String(length=100), existing_nullable=False)
    op.alter_column("events", "subtitle", existing_type=sa.String(length=255), nullable=True, server_default="")

    op.execute("UPDATE events SET capacity = 1 WHERE capacity IS NULL OR capacity <= 0")
    op.alter_column("events", "capacity", existing_type=sa.Integer(), nullable=False, server_default="1")

    op.create_index(op.f("ix_events_organizer_id"), "events", ["organizer_id"], unique=False)
    op.create_foreign_key("fk_events_organizer_id_users", "events", "users", ["organizer_id"], ["user_id"])

    op.create_table(
        "registrations",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("event_id", sa.Integer(), nullable=False),
        sa.Column("student_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.ForeignKeyConstraint(["event_id"], ["events.id"]),
        sa.ForeignKeyConstraint(["student_id"], ["users.user_id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("event_id", "student_id", name="uq_registration_event_student"),
    )
    op.create_index(op.f("ix_registrations_id"), "registrations", ["id"], unique=False)
    op.create_index(op.f("ix_registrations_event_id"), "registrations", ["event_id"], unique=False)
    op.create_index(op.f("ix_registrations_student_id"), "registrations", ["student_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_registrations_student_id"), table_name="registrations")
    op.drop_index(op.f("ix_registrations_event_id"), table_name="registrations")
    op.drop_index(op.f("ix_registrations_id"), table_name="registrations")
    op.drop_table("registrations")

    op.drop_constraint("fk_events_organizer_id_users", "events", type_="foreignkey")
    op.drop_index(op.f("ix_events_organizer_id"), table_name="events")

    op.alter_column("events", "capacity", existing_type=sa.Integer(), nullable=True, server_default=None)
    op.alter_column("events", "subtitle", existing_type=sa.String(length=255), nullable=False, server_default=None)
    op.alter_column("events", "title", existing_type=sa.String(length=100), type_=sa.String(length=255), existing_nullable=False)

    op.drop_column("events", "organizer_id")
    op.drop_column("events", "status")
    op.drop_column("events", "category")
    op.drop_column("events", "location")
    op.drop_column("events", "start_datetime")

    event_status_enum = sa.Enum("Available", "Full", "Canceled", name="event_status_enum")
    event_status_enum.drop(op.get_bind(), checkfirst=True)
