from fastapi import APIRouter

router = APIRouter()

@router.get("/projects")
def get_projects():
    return [{"id": 1, "name": "Portfolio Backend Refactor", "status": "in_progress"}]
