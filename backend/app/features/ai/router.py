from fastapi import APIRouter, Depends

from app.features.ai.schemas import GenerateEventDescriptionRequest, GenerateEventDescriptionResponse
from app.features.ai.service import generate_event_description
from app.features.auth.dependencies import require_organizer_or_admin
from app.models.user import User

router = APIRouter()


@router.post('/generate-event-description', response_model=GenerateEventDescriptionResponse)
def generate_description(
	payload: GenerateEventDescriptionRequest,
	_: User = Depends(require_organizer_or_admin),
):
	description = generate_event_description(
		title=payload.title,
		category=payload.category,
		additional_details=payload.additional_details,
	)
	return {'description': description}
