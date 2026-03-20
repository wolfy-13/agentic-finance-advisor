import sqlite3

conn = sqlite3.connect("finance.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)
""")

conn.commit()


def register_user(username, password):
    try:
        cursor.execute(
            "INSERT INTO users (username,password) VALUES (?,?)",
            (username, password)
        )
        conn.commit()
        return True
    except:
        return False


def login_user(username, password):
    cursor.execute(
        "SELECT * FROM users WHERE username=? AND password=?",
        (username, password)
    )
    user = cursor.fetchone()

    if user:
        return True
    return False