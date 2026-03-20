import sqlite3

conn = sqlite3.connect("finance.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS expenses(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    date TEXT,
    category TEXT,
    amount REAL,
    description TEXT
)
""")

conn.commit()