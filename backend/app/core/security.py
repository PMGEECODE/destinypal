"""
Security utilities for authentication and authorization.
Implements secure password hashing, JWT tokens, and session management.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import secrets
import hashlib

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError
from jose import jwt, JWTError
from pydantic import BaseModel

from app.core.config import settings


# time_cost: number of iterations (higher = more secure, slower)
# memory_cost: memory usage in KiB (higher = more resistant to GPU attacks)
# parallelism: number of parallel threads
password_hasher = PasswordHasher(
    time_cost=3,        # OWASP recommended minimum
    memory_cost=65536,  # 64 MiB - resistant to GPU/ASIC attacks
    parallelism=4,      # Number of parallel threads
    hash_len=32,        # Length of the hash in bytes
    salt_len=16,        # Length of the salt in bytes
)


class TokenData(BaseModel):
    """Token payload data."""
    user_id: str
    email: str
    role: str
    token_type: str = "access"
    exp: datetime
    iat: datetime
    jti: str  # JWT ID for token revocation


class TokenPair(BaseModel):
    """Access and refresh token pair."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its Argon2 hash."""
    try:
        password_hasher.verify(hashed_password, plain_password)
        return True
    except (VerifyMismatchError, InvalidHashError):
        return False


def get_password_hash(password: str) -> str:
    """Generate a secure Argon2 password hash."""
    return password_hasher.hash(password)


def needs_rehash(hashed_password: str) -> bool:
    """Check if a password hash needs to be rehashed with updated parameters."""
    return password_hasher.check_needs_rehash(hashed_password)


def generate_token_id() -> str:
    """Generate a unique token ID."""
    return secrets.token_urlsafe(32)


def create_access_token(
    user_id: str,
    email: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT access token."""
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "access",
        "exp": expire,
        "iat": now,
        "jti": generate_token_id(),
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_refresh_token(
    user_id: str,
    email: str,
    role: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    """Create a JWT refresh token."""
    if expires_delta is None:
        expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    
    now = datetime.now(timezone.utc)
    expire = now + expires_delta
    
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "type": "refresh",
        "exp": expire,
        "iat": now,
        "jti": generate_token_id(),
    }
    
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_token_pair(user_id: str, email: str, role: str) -> TokenPair:
    """Create both access and refresh tokens."""
    access_token = create_access_token(user_id, email, role)
    refresh_token = create_refresh_token(user_id, email, role)
    
    return TokenPair(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


def decode_token(token: str) -> Optional[dict[str, Any]]:
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        return payload
    except JWTError:
        return None


def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """Verify a token and return its data."""
    payload = decode_token(token)
    
    if payload is None:
        return None
    
    if payload.get("type") != token_type:
        return None
    
    try:
        return TokenData(
            user_id=payload["sub"],
            email=payload["email"],
            role=payload["role"],
            token_type=payload["type"],
            exp=datetime.fromtimestamp(payload["exp"], tz=timezone.utc),
            iat=datetime.fromtimestamp(payload["iat"], tz=timezone.utc),
            jti=payload["jti"],
        )
    except (KeyError, ValueError):
        return None


def generate_verification_code(length: int = 6) -> str:
    """Generate a numeric verification code."""
    return "".join([str(secrets.randbelow(10)) for _ in range(length)])


def generate_backup_codes(count: int = 8) -> list[str]:
    """Generate backup codes for 2FA."""
    codes = []
    for _ in range(count):
        code = secrets.token_hex(4).upper()
        codes.append(f"{code[:4]}-{code[4:]}")
    return codes


def hash_backup_code(code: str) -> str:
    """Hash a backup code for storage."""
    return hashlib.sha256(code.encode()).hexdigest()


def verify_backup_code(code: str, hashed_code: str) -> bool:
    """Verify a backup code against its hash."""
    return hash_backup_code(code.upper().replace("-", "").strip()) == hashed_code
