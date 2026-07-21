#!/usr/bin/env python3

with open('backend/app/api/auth.py', 'r') as f:
    content = f.read()

# Replace the import
content = content.replace(
    'from passlib.context import CryptContext',
    'import bcrypt'
)

# Remove pwd_context line
content = content.replace(
    'pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")\n',
    ''
)

# Replace hash_password function
old_hash = 'def hash_password(plain: str) -> str:\n    return pwd_context.hash(plain[:72])'
new_hash = 'def hash_password(plain: str) -> str:\n    password_bytes = plain.encode("utf-8")[:72]\n    salt = bcrypt.gensalt(rounds=12)\n    hashed = bcrypt.hashpw(password_bytes, salt)\n    return hashed.decode("utf-8")'
content = content.replace(old_hash, new_hash)

# Replace verify_password function
old_verify = 'def verify_password(plain: str, hashed: str) -> bool:\n    return pwd_context.verify(plain, hashed)'
new_verify = 'def verify_password(plain: str, hashed: str) -> bool:\n    password_bytes = plain.encode("utf-8")[:72]\n    hashed_bytes = hashed.encode("utf-8")\n    return bcrypt.checkpw(password_bytes, hashed_bytes)'
content = content.replace(old_verify, new_verify)

with open('backend/app/api/auth.py', 'w') as f:
    f.write(content)

print("✅ auth.py updated to use bcrypt directly")
