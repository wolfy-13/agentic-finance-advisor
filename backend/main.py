from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from backend.db import get_user_expenses, add_user_expense
from backend.auth import register_user, login_user
from backend.ai import get_ai_response

app = FastAPI()

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class Expense(BaseModel):
    date: str
    category: str
    amount: float
    description: str

class ChatRequest(BaseModel):
    message: str
    expenses: list

class Auth(BaseModel):
    username: str
    password: str


# 🔐 AUTH ROUTES
@app.post("/register/")
def register(user: Auth):
    success = register_user(user.username, user.password)
    return {"success": success}

@app.post("/login/")
def login(user: Auth):
    success = login_user(user.username, user.password)
    return {"success": success}


# 💰 EXPENSE ROUTES
@app.post("/add_expense/{user}")
def add_expense(user: str, expense: Expense):
    add_user_expense(user, expense.dict())
    return {"msg": "added"}

@app.get("/expenses/{user}")
def get_expenses(user: str):
    return get_user_expenses(user)


# 🤖 AI ROUTE
@app.post("/ai_chat/")
def ai_chat(req: ChatRequest):
    reply = get_ai_response(req.message, req.expenses)
    return {"reply": reply}