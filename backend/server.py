from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorGridFSBucket
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import os
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import asyncio
import resend
from bson import ObjectId
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]
fs = AsyncIOMotorGridFSBucket(db)

# JWT Config
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key')
JWT_ALGORITHM = "HS256"

# Resend Config
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ====================
# MODELS
# ====================

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str
    role: str
    employee_id: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    role: str

class User(BaseModel):
    user_id: str
    email: str
    name: str
    role: str
    employee_id: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    client_email: str
    location: str
    start_date: str
    end_date: str
    budget: float


class Project(BaseModel):
    project_id: str
    name: str

    client_email: str   # ✅ stored email
    client_name: str

    location: str
    start_date: str
    end_date: str
    budget: float

    status: str = "Planning"
    assigned_engineers: List[str] = []
    progress: float = 0.0
    created_at: str


class TeamCreate(BaseModel):
    name: str
    project_id: str
    engineer_ids: List[str]

class Team(BaseModel):
    team_id: str
    name: str
    project_id: str
    engineer_ids: List[str]
    created_at: str

class MaterialRequest(BaseModel):
    project_id: str
    name: str
    quantity: str
    required_date: str

class Material(BaseModel):
    material_id: str
    project_id: str
    engineer_id: str
    engineer_name: str
    name: str
    quantity: str
    required_date: str
    status: str = "Pending"
    admin_comments: Optional[str] = None
    created_at: str

class DrawingResponse(BaseModel):
    drawing_id: str
    project_id: str
    engineer_id: str
    engineer_name: str
    filename: str
    status: str
    admin_comments: Optional[str] = None
    upload_date: str
class ScheduleCreate(BaseModel):
    project_id: str
    phase_name: str
    start_date: str
    duration: int
    description: Optional[str] = None


class Schedule(BaseModel):
    schedule_id: str
    project_id: str
    phase_name: str
    start_date: str

    duration: Optional[int] = None   # ✅ FIX

    end_date: str
    description: Optional[str] = None
    progress: float = 0.0
    status: str = "Not Started"
    created_at: str

class HolidayCreate(BaseModel):
    name: str
    date: str


class Holiday(BaseModel):
    holiday_id: str
    name: str
    date: str
    created_at: str



class Notification(BaseModel):
    notification_id: str
    user_id: str
    type: str
    title: str
    message: str
    read: bool = False
    related_id: Optional[str] = None
    created_at: str

class ProgressUpdate(BaseModel):
    project_id: str
    progress: float
    notes: Optional[str] = None

class ApprovalAction(BaseModel):
    status: str
    comments: Optional[str] = None

# ====================
# AUTH HELPERS
# ====================

def create_token(user_id: str, role: str) -> str:
    payload = {
        "user_id": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(allowed_roles: List[str]):
    def role_checker(payload: dict = Depends(verify_token)):
        if payload["role"] not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return payload
    return role_checker

# ====================
# EMAIL SERVICE
# ====================

async def send_email_notification(recipient_email: str, subject: str, html_content: str):
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [recipient_email],
            "subject": subject,
            "html": html_content
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {recipient_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")

# ====================
# NOTIFICATION HELPER
# ====================

async def create_notification(user_id: str, type: str, title: str, message: str, related_id: str = None):
    notification = {
        "notification_id": str(ObjectId()),
        "user_id": user_id,
        "type": type,
        "title": title,
        "message": message,
        "read": False,
        "related_id": related_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    # Get user email for email notification
    user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
    if user:
        html = f"<h2>{title}</h2><p>{message}</p>"
        await send_email_notification(user["email"], title, html)

# ====================
# AUTH ROUTES
# ====================

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    password_hash = bcrypt.hashpw(user_data.password.encode(), bcrypt.gensalt()).decode()
    
    user = {
        "user_id": str(ObjectId()),
        "email": user_data.email,
        "password_hash": password_hash,
        "name": user_data.name,
        "role": user_data.role,
        "employee_id": user_data.employee_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user)
    token = create_token(user["user_id"], user["role"])
    
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "employee_id": user["employee_id"]
        }
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email, "role": credentials.role}, {"_id": 0})
    
    if not user or not bcrypt.checkpw(credentials.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user["user_id"], user["role"])
    
    return {
        "token": token,
        "user": {
            "user_id": user["user_id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "employee_id": user.get("employee_id")
        }
    }

@api_router.get("/auth/me")
async def get_current_user(payload: dict = Depends(verify_token)):
    user = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ====================
# PROJECT ROUTES
# ====================
# ============================
# ✅ CREATE PROJECT (EMAIL BASED)
# ============================

@api_router.post("/projects", response_model=Project)
async def create_project(
    project: ProjectCreate,
    payload: dict = Depends(require_role(["Admin"]))
):
    client_user = await db.users.find_one({"email": project.client_email})

    if not client_user:
        raise HTTPException(status_code=404, detail="Client not found")

    project_data = {
        "project_id": str(ObjectId()),
        "name": project.name,

        "client_email": project.client_email,
        "client_name": client_user["name"],

        "location": project.location,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "budget": project.budget,

        "status": "Planning",
        "assigned_engineers": [],
        "progress": 0.0,
        "created_at": datetime.now(timezone.utc).isoformat(),

        # ✅ IMPORTANT: Owner Admin ID
        "created_by_admin": payload["user_id"]
    }

    await db.projects.insert_one(project_data)

    return Project(**project_data)


# ============================
# ✅ GET PROJECTS
# ============================
@api_router.get("/projects", response_model=List[Project])
async def get_projects(payload: dict = Depends(verify_token)):

    role = payload["role"]
    user_id = payload["user_id"]

    # ✅ Admin gets ONLY self-created projects
    if role == "Admin":
        projects = await db.projects.find(
            {"created_by_admin": user_id},
            {"_id": 0}
        ).to_list(1000)

    elif role == "Engineer":
        projects = await db.projects.find(
            {"assigned_engineers": user_id},
            {"_id": 0}
        ).to_list(1000)

    else:
        client_user = await db.users.find_one({"user_id": user_id})

        if not client_user:
            raise HTTPException(status_code=404, detail="Client not found")

        projects = await db.projects.find(
            {"client_email": client_user["email"]},
            {"_id": 0}
        ).to_list(1000)

    return projects



# ============================
# ✅ GET SINGLE PROJECT
# ============================

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, payload: dict = Depends(verify_token)):

    project = await db.projects.find_one(
        {"project_id": project_id},
        {"_id": 0}
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # ✅ Admin access restriction
    if payload["role"] == "Admin":
        if project["created_by_admin"] != payload["user_id"]:
            raise HTTPException(status_code=403, detail="Not allowed")

    return Project(**project)


# ============================
# ✅ UPDATE PROJECT
# ============================

@api_router.put("/projects/{project_id}")
async def update_project(
    project_id: str,
    updates: dict,
    payload: dict = Depends(require_role(["Admin"]))
):

    result = await db.projects.update_one(
        {"project_id": project_id},
        {"$set": updates}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Project updated successfully"}


# ============================
# ✅ ASSIGN ENGINEERS
# ============================

@api_router.post("/projects/{project_id}/assign")
async def assign_engineers(
    project_id: str,
    engineer_ids: List[str],
    payload: dict = Depends(require_role(["Admin"]))
):

    result = await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {"assigned_engineers": engineer_ids}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Engineers assigned successfully"}


# ============================
# ✅ UPDATE PROGRESS
# ============================

@api_router.post("/projects/{project_id}/progress")
async def update_progress(
    project_id: str,
    update: ProgressUpdate,
    payload: dict = Depends(require_role(["Engineer"]))
):

    result = await db.projects.update_one(
        {"project_id": project_id},
        {"$set": {"progress": update.progress}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")

    return {"message": "Progress updated successfully"}

# ====================
# TEAM ROUTES
# ====================

@api_router.post("/teams", response_model=Team)
async def create_team(team: TeamCreate, payload: dict = Depends(require_role(["Admin"]))):
    team_data = {
        "team_id": str(ObjectId()),
        **team.model_dump(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.teams.insert_one(team_data)
    return Team(**team_data)

@api_router.get("/teams", response_model=List[Team])
async def get_teams(payload: dict = Depends(require_role(["Admin"]))):
    teams = await db.teams.find({}, {"_id": 0}).to_list(1000)
    return teams

@api_router.get("/users")
async def get_users(role: Optional[str] = None, payload: dict = Depends(require_role(["Admin"]))):
    query = {"role": role} if role else {}
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).to_list(1000)
    return users

# ====================
# DRAWING ROUTES
# ====================

@api_router.post("/drawings/upload")
async def upload_drawing(
    project_id: str = Form(...),
    file: UploadFile = File(...),
    payload: dict = Depends(require_role(["Engineer"]))
):
    # Validate file type
    if not file.content_type in ["application/pdf", "image/jpeg", "image/jpg", "image/png"]:
        raise HTTPException(status_code=400, detail="Only PDF and JPG files allowed")
    
    # Read file content
    content = await file.read()
    
    # Upload to GridFS
    file_id = await fs.upload_from_stream(
        file.filename,
        io.BytesIO(content),
        metadata={"content_type": file.content_type}
    )
    
    # Get engineer info
    engineer = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
    
    drawing = {
        "drawing_id": str(ObjectId()),
        "project_id": project_id,
        "engineer_id": payload["user_id"],
        "engineer_name": engineer["name"],
        "file_id": str(file_id),
        "filename": file.filename,
        "status": "Pending",
        "admin_comments": None,
        "upload_date": datetime.now(timezone.utc).isoformat()
    }
    
    await db.drawings.insert_one(drawing)
    
    # Notify all admins
    admins = await db.users.find({"role": "Admin"}, {"_id": 0}).to_list(100)
    for admin in admins:
        await create_notification(
            admin["user_id"],
            "drawing_upload",
            "New Drawing Uploaded",
            f"{engineer['name']} uploaded {file.filename}",
            drawing["drawing_id"]
        )
    
    return {"message": "Drawing uploaded successfully", "drawing_id": drawing["drawing_id"]}

@api_router.get("/drawings", response_model=List[DrawingResponse])
async def get_drawings(
    project_id: Optional[str] = None,
    payload: dict = Depends(verify_token)
):
    query = {}

    # ✅ Project Filter
    if project_id:
        query["project_id"] = project_id

    # ✅ Engineer can ONLY see own drawings
    if payload["role"] == "Engineer":
        query["engineer_id"] = payload["user_id"]

    # ✅ Client can ONLY see project drawings
    if payload["role"] == "Client":
        query["status"] = "Approved"

    drawings = await db.drawings.find(
        query,
        {"_id": 0, "file_id": 0}
    ).to_list(1000)

    return drawings



@api_router.get("/drawings/{drawing_id}/download")
async def download_drawing(
    drawing_id: str,
    payload: dict = Depends(verify_token)
):
    from fastapi.responses import StreamingResponse

    drawing = await db.drawings.find_one(
        {"drawing_id": drawing_id},
        {"_id": 0}
    )

    if not drawing:
        raise HTTPException(status_code=404, detail="Drawing not found")

    # ✅ Engineer restriction
    if payload["role"] == "Engineer":
        if drawing["engineer_id"] != payload["user_id"]:
            raise HTTPException(status_code=403, detail="Not Allowed")

    # ✅ Client restriction
    if payload["role"] == "Client":
        if drawing["status"] != "Approved":
            raise HTTPException(status_code=403, detail="Not Allowed")

    grid_out = await fs.open_download_stream(ObjectId(drawing["file_id"]))
    content = await grid_out.read()

    return StreamingResponse(
        io.BytesIO(content),
        media_type=grid_out.metadata.get("content_type"),
        headers={"Content-Disposition": f"attachment; filename={drawing['filename']}"}
    )

@api_router.post("/drawings/{drawing_id}/approve")
async def approve_drawing(drawing_id: str, action: ApprovalAction, payload: dict = Depends(require_role(["Admin"]))):
    drawing = await db.drawings.find_one({"drawing_id": drawing_id}, {"_id": 0})
    if not drawing:
        raise HTTPException(status_code=404, detail="Drawing not found")
    
    await db.drawings.update_one(
        {"drawing_id": drawing_id},
        {"$set": {"status": action.status, "admin_comments": action.comments}}
    )
    
    # Notify engineer
    await create_notification(
        drawing["engineer_id"],
        "drawing_status",
        f"Drawing {action.status}",
        f"Your drawing {drawing['filename']} has been {action.status.lower()}",
        drawing_id
    )
    
    return {"message": f"Drawing {action.status.lower()} successfully"}

# ====================
# MATERIAL ROUTES
# ====================

@api_router.post("/materials/request", response_model=Material)
async def request_material(material: MaterialRequest, payload: dict = Depends(require_role(["Engineer"]))):
    engineer = await db.users.find_one({"user_id": payload["user_id"]}, {"_id": 0})
    
    material_data = {
        "material_id": str(ObjectId()),
        **material.model_dump(),
        "engineer_id": payload["user_id"],
        "engineer_name": engineer["name"],
        "status": "Pending",
        "admin_comments": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.materials.insert_one(material_data)
    
    # Notify all admins
    admins = await db.users.find({"role": "Admin"}, {"_id": 0}).to_list(100)
    for admin in admins:
        await create_notification(
            admin["user_id"],
            "material_request",
            "New Material Request",
            f"{engineer['name']} requested {material.name}",
            material_data["material_id"]
        )
    
    return Material(**material_data)
@api_router.get("/materials")
async def get_materials(
    project_id: Optional[str] = None,   # ✅ Add this
    payload: dict = Depends(verify_token)
):
    query = {}

    # ✅ Project filter (Admin Page Project Wise)
    if project_id:
        query["project_id"] = project_id

    # ✅ Engineer only own materials
    if payload["role"] == "Engineer":
        query["engineer_id"] = payload["user_id"]

    # ✅ Admin only own created projects
    if payload["role"] == "Admin":
        myProjects = await db.projects.find(
            {"created_by_admin": payload["user_id"]},
            {"_id": 0}
        ).to_list(100)

        projectIds = [p["project_id"] for p in myProjects]

        # ✅ Admin project restriction + filter merge
        if project_id:
            if project_id not in projectIds:
                raise HTTPException(status_code=403, detail="Not allowed")
        else:
            query["project_id"] = {"$in": projectIds}

    materials = await db.materials.find(query, {"_id": 0}).to_list(1000)
    return materials

@api_router.post("/materials/{material_id}/approve")
async def approve_material(material_id: str, action: ApprovalAction, payload: dict = Depends(require_role(["Admin"]))):
    material = await db.materials.find_one({"material_id": material_id}, {"_id": 0})
    if not material:
        raise HTTPException(status_code=404, detail="Material not found")
    
    await db.materials.update_one(
        {"material_id": material_id},
        {"$set": {"status": action.status, "admin_comments": action.comments}}
    )
    
    # Notify engineer
    await create_notification(
        material["engineer_id"],
        "material_status",
        f"Material Request {action.status}",
        f"Your request for {material['name']} has been {action.status.lower()}",
        material_id
    )
    
    return {"message": f"Material {action.status.lower()} successfully"}

# ====================
# SCHEDULE ROUTES
# ====================

# ====================
# ✅ CLEAN HOLIDAY + SCHEDULE ROUTES
# ====================

# ✅ Auto Remove Expired Holidays
async def cleanup_old_holidays():
    today = datetime.now().strftime("%Y-%m-%d")
    await db.holidays.delete_many({"date": {"$lt": today}})


# ✅ Calculate End Date (Skip Sundays + Holidays)
async def calculate_end_date(start_date: str, duration: int):
    await cleanup_old_holidays()

    holidays = await db.holidays.find({}, {"_id": 0}).to_list(500)
    holiday_dates = [h["date"] for h in holidays]

    current = datetime.fromisoformat(start_date)
    count = 0

    while count < duration:
        current += timedelta(days=1)
        formatted = current.strftime("%Y-%m-%d")

        # ✅ Skip Sundays
        if current.weekday() == 6:
            continue

        # ✅ Skip Holidays
        if formatted in holiday_dates:
            continue

        count += 1

    return current.strftime("%Y-%m-%d")


# ✅ ADD HOLIDAY (Admin + Notify Engineers)
@api_router.post("/holidays", response_model=Holiday)
async def create_holiday(
    holiday: HolidayCreate,
    payload: dict = Depends(require_role(["Admin"]))
):
    holiday_data = {
        "holiday_id": str(ObjectId()),
        "name": holiday.name,
        "date": holiday.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.holidays.insert_one(holiday_data)

    # ✅ Notify Engineers
    engineers = await db.users.find({"role": "Engineer"}, {"_id": 0}).to_list(500)
    for eng in engineers:
        await create_notification(
            eng["user_id"],
            "holiday_added",
            "New Holiday Added 📢",
            f"Holiday declared on {holiday.date}. Scheduling will skip this date.",
            holiday_data["holiday_id"]
        )

    return Holiday(**holiday_data)


# ✅ GET HOLIDAYS
@api_router.get("/holidays", response_model=List[Holiday])
async def get_holidays(payload: dict = Depends(verify_token)):
    await cleanup_old_holidays()
    holidays = await db.holidays.find({}, {"_id": 0}).to_list(500)
    return holidays


# ✅ DELETE HOLIDAY
@api_router.delete("/holidays/{holiday_id}")
async def delete_holiday(
    holiday_id: str,
    payload: dict = Depends(require_role(["Admin"]))
):
    result = await db.holidays.delete_one({"holiday_id": holiday_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Holiday not found")

    return {"message": "Holiday removed ✅"}


# ✅ CREATE SCHEDULE PHASE (Auto Chaining + Notify Engineers)
@api_router.post("/schedules", response_model=Schedule)
async def create_schedule(
    schedule: ScheduleCreate,
    payload: dict = Depends(require_role(["Admin"]))
):
    # ✅ Auto Chain Start Date
    last_phase = await db.schedules.find(
        {"project_id": schedule.project_id},
        {"_id": 0}
    ).sort("end_date", -1).to_list(1)

    if last_phase:
        schedule.start_date = last_phase[0]["end_date"]

    # ✅ Calculate End Date
    end_date = await calculate_end_date(schedule.start_date, schedule.duration)

    schedule_data = {
        "schedule_id": str(ObjectId()),
        "project_id": schedule.project_id,
        "phase_name": schedule.phase_name,
        "start_date": schedule.start_date,
        "duration": schedule.duration,
        "end_date": end_date,
        "description": schedule.description,

        "progress": 0.0,
        "status": "Not Started",

        "created_at": datetime.now(timezone.utc).isoformat()
    }

    await db.schedules.insert_one(schedule_data)

    # ✅ Notify Engineers
    engineers = await db.users.find({"role": "Engineer"}, {"_id": 0}).to_list(500)
    for eng in engineers:
        await create_notification(
            eng["user_id"],
            "schedule_added",
            "New Phase Scheduled ✅",
            f"Phase '{schedule.phase_name}' added. Timeline updated.",
            schedule_data["schedule_id"]
        )

    return Schedule(**schedule_data)


# ✅ GET PROJECT SCHEDULES
@api_router.get("/projects/{project_id}/schedules", response_model=List[Schedule])
async def get_project_schedules(
    project_id: str,
    payload: dict = Depends(verify_token)
):
    schedules = await db.schedules.find(
        {"project_id": project_id},
        {"_id": 0}
    ).sort("start_date", 1).to_list(1000)

    return schedules


# ✅ UPDATE PROGRESS (Engineer)
@api_router.put("/schedules/{schedule_id}/progress")
async def update_schedule_progress(
    schedule_id: str,
    progress: float,
    payload: dict = Depends(require_role(["Engineer"]))
):
    schedule = await db.schedules.find_one({"schedule_id": schedule_id})

    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")

    # ✅ Update phase progress + status
    status = "Ongoing"
    if progress == 0:
        status = "Not Started"
    elif progress >= 100:
        status = "Completed"

    await db.schedules.update_one(
        {"schedule_id": schedule_id},
        {"$set": {"progress": progress, "status": status}}
    )

    # ✅ AUTO UPDATE PROJECT PROGRESS (Average)
    project_id = schedule["project_id"]

    phases = await db.schedules.find(
        {"project_id": project_id},
        {"_id": 0}
    ).to_list(100)

    if phases:
        avg_progress = sum([p.get("progress", 0) for p in phases]) / len(phases)

        await db.projects.update_one(
            {"project_id": project_id},
            {"$set": {"progress": round(avg_progress, 2)}}
        )

    return {"message": "Progress Updated ✅"}


@api_router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    payload: dict = Depends(require_role(["Admin"]))
):
    project = await db.projects.find_one({"project_id": project_id})

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # ✅ Only owner admin can delete
    if project["created_by_admin"] != payload["user_id"]:
        raise HTTPException(status_code=403, detail="Not allowed")

    await db.projects.delete_one({"project_id": project_id})

    # ✅ Also delete schedules & materials etc (optional)
    await db.schedules.delete_many({"project_id": project_id})
    await db.materials.delete_many({"project_id": project_id})
    await db.drawings.delete_many({"project_id": project_id})

    return {"message": "Project deleted successfully ✅"}




    # ============================
    # ✅ NOTIFY ASSIGNED ENGINEERS
    # ============================

    for engineer_id in project.get("assigned_engineers", []):

        await create_notification(
            engineer_id,
            "schedule_update",
            "New Schedule Phase Added",
            f"Phase '{schedule.phase_name}' was added in project '{project['name']}'",
            schedule_data["schedule_id"]
        )

    # ============================
    # ✅ NOTIFY CLIENT ALSO
    # ============================

    client_user = await db.users.find_one(
        {"email": project["client_email"]},
        {"_id": 0}
    )

    if client_user:
        await create_notification(
            client_user["user_id"],
            "schedule_update",
            "Project Schedule Updated",
            f"A new schedule phase '{schedule.phase_name}' was added in your project '{project['name']}'",
            schedule_data["schedule_id"]
        )

    return Schedule(**schedule_data)


@api_router.get("/projects/{project_id}/schedules", response_model=List[Schedule])
async def get_project_schedules(
    project_id: str,
    payload: dict = Depends(verify_token)
):
    # ✅ Admin can access only own project schedule
    if payload["role"] == "Admin":
        project = await db.projects.find_one(
            {"project_id": project_id, "created_by_admin": payload["user_id"]}
        )
        if not project:
            raise HTTPException(status_code=403, detail="Not allowed")

    schedules = await db.schedules.find(
        {"project_id": project_id},
        {"_id": 0}
    ).to_list(1000)

    return schedules


@api_router.put("/schedules/{schedule_id}")
async def update_schedule(schedule_id: str, updates: dict, payload: dict = Depends(require_role(["Admin"]))):
    result = await db.schedules.update_one({"schedule_id": schedule_id}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule updated successfully"}

@api_router.delete("/schedules/{schedule_id}")
async def delete_schedule(schedule_id: str, payload: dict = Depends(require_role(["Admin"]))):
    result = await db.schedules.delete_one({"schedule_id": schedule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"message": "Schedule deleted successfully"}

# ====================
# NOTIFICATION ROUTES
# ====================

@api_router.get("/notifications", response_model=List[Notification])
async def get_notifications(payload: dict = Depends(verify_token)):
    notifications = await db.notifications.find(
        {"user_id": payload["user_id"]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return notifications

@api_router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, payload: dict = Depends(verify_token)):
    result = await db.notifications.update_one(
        {"notification_id": notification_id, "user_id": payload["user_id"]},
        {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@api_router.get("/notifications/unread/count")
async def get_unread_count(payload: dict = Depends(verify_token)):
    count = await db.notifications.count_documents({"user_id": payload["user_id"], "read": False})
    return {"count": count}

# ====================
# DASHBOARD STATS
# ====================

@api_router.get("/stats/admin")
async def get_admin_stats(payload: dict = Depends(require_role(["Admin"]))):
    total_projects = await db.projects.count_documents({})
    ongoing = await db.projects.count_documents({"status": "In Progress"})
    completed = await db.projects.count_documents({"status": "Completed"})
    engineers = await db.users.count_documents({"role": "Engineer"})
    pending_drawings = await db.drawings.count_documents({"status": "Pending"})
    pending_materials = await db.materials.count_documents({"status": "Pending"})
    
    return {
        "total_projects": total_projects,
        "ongoing_projects": ongoing,
        "completed_projects": completed,
        "total_engineers": engineers,
        "pending_approvals": pending_drawings + pending_materials
    }

@api_router.get("/stats/engineer")
async def get_engineer_stats(payload: dict = Depends(require_role(["Engineer"]))):
    assigned_projects = await db.projects.count_documents({"assigned_engineers": payload["user_id"]})
    pending_drawings = await db.drawings.count_documents({"engineer_id": payload["user_id"], "status": "Pending"})
    approved_drawings = await db.drawings.count_documents({"engineer_id": payload["user_id"], "status": "Approved"})
    
    return {
        "assigned_projects": assigned_projects,
        "pending_drawings": pending_drawings,
        "approved_drawings": approved_drawings
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()