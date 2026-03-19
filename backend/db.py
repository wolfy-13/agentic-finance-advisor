import sqlite3

def connect_db():
    return sqlite3.connect("finance.db")

def create_tables():
    conn = connect_db()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE IF NOT EXISTS expenses(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        category TEXT,
        amount INTEGER,
        date TEXT,
        description TEXT
    )
    """)

    conn.commit()
    conn.close()
    db = {}

def get_user_expenses(user):
    return db.get(user, [])

def add_user_expense(user, expense):
    if user not in db:
        db[user] = []
    db[user].append(expense)