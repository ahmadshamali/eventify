# This file registers all SQLAlchemy models so that:
#   1. Alembic can detect all tables and generate migrations automatically
#   2. All models are loaded in one place — no need to import them individually
#      anywhere else
#
# HOW TO USE:
#   Every time you create a new model file in app/models/,
#   add its import here following the same pattern below.
#
# EXAMPLE:
#   from app.models.your_model import YourModelClass
#
# DO NOT leave a model out — if it's missing here, Alembic won't
# create its table in the database.
# =============================================================================

from app.models.event import Event

# Add new models below as you create them:
from app.models.user import User, Role, OrganizerProfile, StudentProfile
# from app.models.registration import Registration
# from app.models.attendance import Attendance
# from app.models.certificate import Certificate