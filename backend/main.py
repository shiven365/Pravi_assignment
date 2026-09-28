from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import engine, get_db
import models
import schemas
import auth
from typing import List
import datetime

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Demo Data
def init_demo_data(db: Session):
    if not db.query(models.State).first():
        gujarat = models.State(name="Gujarat")
        maharashtra = models.State(name="Maharashtra")
        db.add_all([gujarat, maharashtra])
        db.commit()
        
        water = models.Department(name="Water Resources", state_id=gujarat.id)
        roads = models.Department(name="Roads & Buildings", state_id=gujarat.id)
        db.add_all([water, roads])
        db.commit()
        
        users = [
            models.User(name="Central Infrastructure Administrator", email="central.admin@govinfra.demo", password_hash=auth.get_password_hash("password"), role="CENTRAL_ADMIN"),
            models.User(name="Gujarat Infrastructure Administrator", email="gujarat.admin@govinfra.demo", password_hash=auth.get_password_hash("password"), role="STATE_ADMIN", state_id=gujarat.id),
            models.User(name="Maharashtra Infrastructure Administrator", email="maharashtra.admin@govinfra.demo", password_hash=auth.get_password_hash("password"), role="STATE_ADMIN", state_id=maharashtra.id),
            models.User(name="Gujarat Water Authority", email="gujarat.water@govinfra.demo", password_hash=auth.get_password_hash("password"), role="DEPARTMENT_ADMIN", state_id=gujarat.id, department_id=water.id)
        ]
        db.add_all(users)
        
        # Add mock projects & assets
        prj1 = models.Project(id="PRJ-2024-01", name="Coastal Highway Phase 1", sector="Transportation", state_id=maharashtra.id, budget=15000, spent=12500, progress=60, status="Delayed", start_date="2020-01-10", expected_completion="2024-12-30")
        prj2 = models.Project(id="PRJ-2024-02", name="Kutch Solar Expansion", sector="Energy", state_id=gujarat.id, budget=500, spent=400, progress=85, status="On Track", start_date="2023-05-01", expected_completion="2024-08-15")
        prj3 = models.Project(id="PRJ-2024-03", name="Narmada Canal Extension", sector="Water", state_id=gujarat.id, department_id=water.id, budget=2000, spent=100, progress=5, status="New", start_date="2024-02-20", expected_completion="2027-12-31")
        
        ast1 = models.Asset(id="AST-2024-001", name="Mumbai Coastal Road", type="Highway", sector="Transportation", state_id=maharashtra.id, project_id="PRJ-2024-01", cost="12721", health_score=92, status="Commissioned")
        ast2 = models.Asset(id="AST-2024-042", name="Narmada Pump", type="Water Pump", sector="Water", state_id=gujarat.id, department_id=water.id, health_score=45, status="Maintenance Required")
        
        db.add_all([prj1, prj2, prj3, ast1, ast2])
        db.commit()

@app.on_event("startup")
def on_startup():
    db = next(get_db())
    init_demo_data(db)

@app.post("/api/auth/login", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(
        data={"user_id": user.id, "role": user.role, "state_id": user.state_id, "department_id": user.department_id}
    )
    user_data = {"id": user.id, "name": user.name, "email": user.email, "role": user.role, "state_id": user.state_id, "department_id": user.department_id}
    return {"access_token": access_token, "token_type": "bearer", "user": user_data}

@app.get("/api/admin/projects")
def get_projects(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.Project)
    if current_user.role == "STATE_ADMIN":
        query = query.filter(models.Project.state_id == current_user.state_id)
    elif current_user.role == "DEPARTMENT_ADMIN":
        query = query.filter(models.Project.state_id == current_user.state_id, models.Project.department_id == current_user.department_id)
    return query.all()

@app.put("/api/admin/projects/{project_id}")
def update_project(project_id: str, update: schemas.ProjectUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Authorization verification
    if current_user.role != "CENTRAL_ADMIN":
        if project.state_id != current_user.state_id:
            raise HTTPException(status_code=403, detail="You do not have permission to modify resources outside your assigned state.")
        if current_user.role == "DEPARTMENT_ADMIN" and project.department_id != current_user.department_id:
            raise HTTPException(status_code=403, detail="You do not have permission to modify resources outside your assigned department.")
            
    old_data = f"Progress: {project.progress}, Status: {project.status}, Spent: {project.spent}"
            
    if update.progress is not None: project.progress = update.progress
    if update.status is not None: project.status = update.status
    if update.expected_completion is not None: project.expected_completion = update.expected_completion
    if update.spent is not None: project.spent = update.spent
    
    new_data = f"Progress: {project.progress}, Status: {project.status}, Spent: {project.spent}"
    
    audit_log = models.AuditLog(
        user_id=current_user.id,
        user_name_snapshot=current_user.name,
        user_role=current_user.role,
        state_id=current_user.state_id,
        department_id=current_user.department_id,
        action="PROJECT_UPDATED",
        entity_type="Project",
        entity_id=project.id,
        old_data=old_data,
        new_data=new_data,
        reason=update.reason
    )
    db.add(audit_log)
    db.commit()
    
    return project

@app.get("/api/admin/audit-logs")
def get_audit_logs(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    query = db.query(models.AuditLog).order_by(models.AuditLog.created_at.desc())
    if current_user.role == "STATE_ADMIN":
        query = query.filter(models.AuditLog.state_id == current_user.state_id)
    elif current_user.role == "DEPARTMENT_ADMIN":
        query = query.filter(models.AuditLog.state_id == current_user.state_id, models.AuditLog.department_id == current_user.department_id)
    return query.all()
