from datetime import datetime, timedelta, timezone


def normalize_datetime(value: datetime) -> datetime:
	if value.tzinfo is None:
		return value
	return value.astimezone(timezone.utc).replace(tzinfo=None)


def build_end_datetime(start_datetime: datetime, duration_minutes: int) -> datetime:
	return normalize_datetime(start_datetime) + timedelta(minutes=duration_minutes)


def resolve_event_end_datetime(start_datetime: datetime, end_datetime: datetime | None, fallback_minutes: int = 60) -> datetime:
	if end_datetime is not None:
		return normalize_datetime(end_datetime)
	return build_end_datetime(start_datetime, fallback_minutes)


def is_public_event_visible(end_datetime: datetime | None, current_time: datetime | None = None) -> bool:
	if end_datetime is None:
		return True
	now = current_time or datetime.utcnow()
	return now <= end_datetime + timedelta(hours=24)