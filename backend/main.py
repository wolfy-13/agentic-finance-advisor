from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from backend.auth import register_user, login_user

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")


# -------------------------
# PAGE ROUTES
# -------------------------
@app.get("/")
def home():
    return FileResponse("frontend/login.html")


@app.get("/login.html")
def login_html():
    return FileResponse("frontend/login.html")


@app.get("/signup")
def signup_page():
    return FileResponse("frontend/signup.html")


@app.get("/signup.html")
def signup_html():
    return FileResponse("frontend/signup.html")


@app.get("/dashboard")
def dashboard():
    return FileResponse("frontend/dashboard.html")


@app.get("/dashboard.html")
def dashboard_html():
    return FileResponse("frontend/dashboard.html")


# -------------------------
# AUTH
# -------------------------
class Auth(BaseModel):
    username: str
    password: str


@app.post("/register/")
def register(user: Auth):
    success = register_user(user.username, user.password)
    return {"success": success}


@app.post("/login/")
def login(user: Auth):
    success = login_user(user.username, user.password)
    return {"success": success}