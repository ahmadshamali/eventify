import json
from urllib import error, request

from fastapi import HTTPException

from app.core.config import settings


def _build_prompt(title: str, category: str, additional_details: str | None) -> str:
	cleaned_details = (additional_details or '').strip()
	details_block = cleaned_details if cleaned_details else 'No additional details provided.'
	return (
		f"Event title: {title.strip()}\n"
		f"Category: {category.strip()}\n"
		f"Organizer details: {details_block}\n\n"
		"Write one engaging event description between 20 and 100 words. "
		"Use plain text only. Do not invent specific logistics that are not provided."
	)


def generate_event_description(title: str, category: str, additional_details: str | None) -> str:
	if not settings.OPENAI_API_KEY:
		raise HTTPException(status_code=500, detail='OPENAI_API_KEY is not configured on the server.')

	payload = {
		'model': settings.OPENAI_MODEL,
		'messages': [
			{
				'role': 'system',
				'content': (
					'You are a professional event copywriter. Return concise, clear event descriptions for university audiences.'
				),
			},
			{
				'role': 'user',
				'content': _build_prompt(title=title, category=category, additional_details=additional_details),
			},
		],
		'temperature': 0.7,
		'max_tokens': 260,
	}

	req = request.Request(
		url='https://api.openai.com/v1/chat/completions',
		data=json.dumps(payload).encode('utf-8'),
		headers={
			'Content-Type': 'application/json',
			'Authorization': f'Bearer {settings.OPENAI_API_KEY}',
		},
		method='POST',
	)

	try:
		with request.urlopen(req, timeout=20) as response:
			response_data = json.loads(response.read().decode('utf-8'))
	except error.HTTPError as exc:
		body = exc.read().decode('utf-8', errors='ignore')
		raise HTTPException(status_code=502, detail=f'AI provider error: {body[:300]}') from exc
	except error.URLError as exc:
		raise HTTPException(status_code=502, detail='Unable to reach AI provider.') from exc
	except TimeoutError as exc:
		raise HTTPException(status_code=504, detail='AI generation timed out.') from exc

	choices = response_data.get('choices') or []
	if not choices:
		raise HTTPException(status_code=502, detail='AI provider returned no choices.')

	description = (choices[0].get('message') or {}).get('content', '').strip()
	if not description:
		raise HTTPException(status_code=502, detail='AI provider returned an empty description.')

	return description
