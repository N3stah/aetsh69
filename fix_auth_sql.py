#!/usr/bin/env python3

with open('backend/app/api/auth.py', 'r') as f:
    content = f.read()

# Fix 1: INSERT - remove status column, use 'free' role instead of 'visitor'
content = content.replace(
    "INSERT INTO users (id, email, username, full_name, hashed_password, role, status)",
    "INSERT INTO users (id, email, username, full_name, hashed_password, role, is_active)"
)
content = content.replace(
    "VALUES (:id, :email, :username, :full_name, :pw, 'visitor', 'active')",
    "VALUES (:id, :email, :username, :full_name, :pw, 'free', true)"
)

# Fix 2: SELECT in login - remove status, add is_active
content = content.replace(
    "SELECT id, hashed_password, role, status, login_attempts, locked_until FROM users WHERE email = :e",
    "SELECT id, hashed_password, role, is_active, login_attempts, locked_until FROM users WHERE email = :e"
)

with open('backend/app/api/auth.py', 'w') as f:
    f.write(content)

print("✅ auth.py SQL queries fixed")
