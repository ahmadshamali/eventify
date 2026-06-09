from __future__ import annotations

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"


def ensure_upload_dir() -> Path:
	UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
	return UPLOAD_DIR


async def save_image_upload(file: UploadFile) -> str:
	ensure_upload_dir()
	suffix = Path(file.filename or "").suffix.lower()
	allowed_suffixes = {".png", ".jpg", ".jpeg", ".webp", ".gif"}
	if suffix not in allowed_suffixes:
		raise ValueError("Only png, jpg, jpeg, webp, and gif images are allowed.")

	file_name = f"{uuid4().hex}{suffix}"
	file_path = UPLOAD_DIR / file_name
	content = await file.read()
	if not content:
		raise ValueError("Uploaded file is empty.")

	if len(content) > 5 * 1024 * 1024:
		raise ValueError("Image must be 5 MB or smaller.")

	file_path.write_bytes(content)
	return f"/uploads/{file_name}"

