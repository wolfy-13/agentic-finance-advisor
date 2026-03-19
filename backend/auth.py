from backend.db import connect_db

def register_user(data):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO users(name,email,password) VALUES(?,?,?)",
        (data["name"], data["email"], data["password"])
    )

    conn.commit()
    return {"status":"registered"}


def login_user(data):
    conn = connect_db()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE email=? AND password=?",
        (data["email"], data["password"])
    )

    user = cur.fetchone()

    return {"status":"success" if user else "fail"}
    users = {}

def register_user(username, password):
    if username in users:
        return False
    users[username] = password
    return True

def login_user(username, password):
    return users.get(username) == password