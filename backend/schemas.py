from pydantic import BaseModel
from typing import Optional, List, Any

class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None
    state_id: Optional[int] = None
    department_id: Optional[int] = None

class User(BaseModel):
    id: int
    name: str
    email: str
    role: str
    state_id: Optional[int] = None
    department_id: Optional[int] = None

    class Config:
        from_attributes = True

class ProjectUpdate(BaseModel):
    progress: Optional[int] = None
    status: Optional[str] = None
    expected_completion: Optional[str] = None
    spent: Optional[float] = None
    reason: Optional[str] = None

class AssetUpdate(BaseModel):
    health_score: Optional[int] = None
    status: Optional[str] = None
    next_inspection: Optional[str] = None
    reason: Optional[str] = None
