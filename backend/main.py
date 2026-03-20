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

# ---------------- PAGE ROUTES ----------------

@app.get("/")
def home():
    return FileResponse("frontend/login.html")

@app.get("/signup")
def signup_page():
    return FileResponse("frontend/signup.html")

@app.get("/dashboard")
def dashboard():
    return FileResponse("frontend/dashboard.html")

@app.get("/expenses.html")
def expenses_page():
    return FileResponse("frontend/expenses.html")

@app.get("/chart.html")
def chart_page():
    return FileResponse("frontend/chart.html")

@app.get("/ai.html")
def ai_page():
    return FileResponse("frontend/ai.html")

# ---------------- AUTH ----------------

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

# ---------------- EXPENSE BACKEND ----------------

expenses_db = {}

class Expense(BaseModel):
    date: str
    category: str
    amount: float
    description: str

@app.get("/expenses/{user}")
def get_expenses(user: str):
    return expenses_db.get(user, [])

@app.post("/add_expense/{user}")
def add_expense(user: str, expense: Expense):
    if user not in expenses_db:
        expenses_db[user] = []

    expenses_db[user].append(expense.dict())
    return {"status": "added"}

# ---------------- AI CHAT ----------------

class ChatRequest(BaseModel):
    message: str
    expenses: list


@app.post("/ai_chat/")
def ai_chat(data: ChatRequest):

    message = data.message.lower()
    expenses = data.expenses or []

    total = sum(float(e.get("amount", 0)) for e in expenses)

    category_map = {}
    for e in expenses:
        category = e.get("category", "Other")
        amount = float(e.get("amount", 0))
        category_map[category] = category_map.get(category, 0) + amount

    top_category = max(category_map, key=category_map.get) if category_map else "None"

    if "save" in message:
        reply = f"Your total spending is ₹{total:.0f}. Try reducing {top_category} spending."
    elif "overspending" in message:
        reply = f"You may be overspending on {top_category}."
    elif "summary" in message:
        reply = f"You have {len(expenses)} expenses. Total spending ₹{total:.0f}. Top category {top_category}."
    else:
        reply = f"I analysed your expenses. Total ₹{total:.0f}. Top category {top_category}."

    return {"reply": reply}