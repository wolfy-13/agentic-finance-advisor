import sqlite3

conn = sqlite3.connect("finance.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS budgets(
    budget_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    limit_amount REAL NOT NULL,
    month TEXT NOT NULL,
    created_at TEXT
)
""")

conn.commit()
conn.close()

print("✅ Budgets Table Created")