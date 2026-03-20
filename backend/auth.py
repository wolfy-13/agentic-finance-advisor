users = {}

def register_user(username, password):
    if username in users:
        return False
    users[username] = password
    return True

def login_user(username, password):
    if username not in users:
        return False
    return users[username] == password