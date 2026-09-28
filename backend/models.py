from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from database import Base
import datetime

class State(Base):
    __tablename__ = "states"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Department(Base):
    __tablename__ = "departments"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    state_id = Column(Integer, ForeignKey("states.id"))

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String) # CENTRAL_ADMIN, STATE_ADMIN, DEPARTMENT_ADMIN, PUBLIC
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, nullable=True)

class Project(Base):
    __tablename__ = "projects"
    id = Column(String, primary_key=True, index=True) # PRJ-2024-01
    name = Column(String)
    sector = Column(String)
    state_id = Column(Integer, ForeignKey("states.id"))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    budget = Column(Float)
    spent = Column(Float, default=0)
    progress = Column(Integer, default=0)
    status = Column(String) # New, On Track, Delayed, Completed
    start_date = Column(String)
    expected_completion = Column(String)
    
class Asset(Base):
    __tablename__ = "assets"
    id = Column(String, primary_key=True, index=True) # AST-2024-001
    name = Column(String)
    type = Column(String)
    sector = Column(String)
    state_id = Column(Integer, ForeignKey("states.id"))
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=True)
    cost = Column(String)
    installation_date = Column(String)
    expected_life = Column(String)
    health_score = Column(Integer)
    status = Column(String)
    next_inspection = Column(String)
    last_maintenance = Column(String)

class LifecycleEvent(Base):
    __tablename__ = "lifecycle_events"
    id = Column(Integer, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    stage = Column(String)
    date = Column(String)
    status = Column(String) # completed, upcoming, pending
    description = Column(String)
    cost = Column(String, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    user_name_snapshot = Column(String)
    user_role = Column(String)
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    action = Column(String)
    entity_type = Column(String) # Project, Asset, Inspection
    entity_id = Column(String)
    old_data = Column(Text, nullable=True)
    new_data = Column(Text, nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(Integer, primary_key=True, index=True)
    audience = Column(String) # ADMIN, PUBLIC
    state_id = Column(Integer, ForeignKey("states.id"), nullable=True)
    department_id = Column(Integer, ForeignKey("departments.id"), nullable=True)
    title = Column(String)
    message = Column(Text)
    severity = Column(String) # info, warning, error
    entity_type = Column(String, nullable=True)
    entity_id = Column(String, nullable=True)
    created_by = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_read = Column(Boolean, default=False)
