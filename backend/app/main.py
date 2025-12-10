# # """
# # FastAPI Main Application with Security Hardening
# # DestinyPal Backend API
# # """
# # from fastapi import FastAPI, Request
# # from fastapi.middleware.cors import CORSMiddleware
# # from fastapi.responses import JSONResponse
# # from contextlib import asynccontextmanager
# # import logging

# # from app.core.config import settings
# # from app.core.logging import setup_logging
# # from app.api.v1 import auth, users, students, sponsors, institutions, payments, donations, stats, public
# # from app.middleware.rate_limit import RateLimitMiddleware, AuthRateLimitMiddleware
# # from app.middleware.security import ContentTypeValidationMiddleware, SecurityHeadersMiddleware
# # from app.database.session import engine
# # from app.database.base import Base
# # from app.models import (
# #     User, UserProfile, User2FASettings,
# #     Institution, Student, StudentDocument, StudentFeeBalance,
# #     Sponsor, Sponsorship,
# #     Payment, PaymentAccount, PaymentTransaction, PaymentWebhook,
# #     OrganizationDonation,
# # )

# # # Setup logging
# # setup_logging()
# # logger = logging.getLogger(__name__)


# # async def init_db():
# #     """Create all database tables if they don't exist."""
# #     async with engine.begin() as conn:
# #         # Create all tables defined in models
# #         await conn.run_sync(Base.metadata.create_all)
# #     logger.info("Database tables initialized successfully")


# # @asynccontextmanager
# # async def lifespan(app: FastAPI):
# #     """Application lifespan events."""
# #     # Startup
# #     logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
# #     logger.info(f"Debug mode: {settings.DEBUG}")
    
# #     try:
# #         await init_db()
# #     except Exception as e:
# #         logger.error(f"Failed to initialize database: {e}")
# #         raise
    
# #     yield
    
# #     # Shutdown
# #     logger.info("Shutting down...")
# #     await engine.dispose()


# # app = FastAPI(
# #     title=settings.PROJECT_NAME,
# #     description="DestinyPal Backend API - Student Sponsorship Platform",
# #     version=settings.VERSION,
# #     docs_url="/api/docs" if settings.DEBUG else None,
# #     redoc_url="/api/redoc" if settings.DEBUG else None,
# #     openapi_url="/api/openapi.json" if settings.DEBUG else None,
# #     lifespan=lifespan,
# # )

# # # CORS middleware - stricter in production
# # app.add_middleware(
# #     CORSMiddleware,
# #     allow_origins=settings.CORS_ORIGINS,
# #     allow_credentials=True,
# #     allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
# #     allow_headers=["Authorization", "Content-Type", "X-Requested-With"],
# #     expose_headers=["X-Request-ID"],
# #     max_age=600,
# # )

# # app.add_middleware(SecurityHeadersMiddleware)
# # app.add_middleware(ContentTypeValidationMiddleware)
# # app.add_middleware(AuthRateLimitMiddleware, max_attempts=5, lockout_minutes=15)
# # app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_REQUESTS)

# # @app.exception_handler(Exception)
# # async def global_exception_handler(request: Request, exc: Exception):
# #     """Handle all unhandled exceptions securely."""
# #     # Log the full error for debugging
# #     logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
# #     # Return generic error to client (no internal details)
# #     return JSONResponse(
# #         status_code=500,
# #         content={"detail": "An internal error occurred. Please try again later."},
# #     )


# # # Include API routers
# # app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# # app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# # app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
# # app.include_router(sponsors.router, prefix="/api/v1/sponsors", tags=["Sponsors"])
# # app.include_router(institutions.router, prefix="/api/v1/institutions", tags=["Institutions"])
# # app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
# # app.include_router(donations.router, prefix="/api/v1/donations", tags=["Donations"])
# # app.include_router(stats.router, prefix="/api/v1/stats", tags=["Statistics"])
# # app.include_router(public.router, prefix="/api/v1/public", tags=["Public"])

# # @app.get("/health")
# # async def health_check():
# #     """Health check endpoint."""
# #     return {"status": "healthy", "version": settings.VERSION}


# # @app.get("/")
# # async def root():
# #     """Root endpoint."""
# #     return {
# #         "message": f"Welcome to {settings.PROJECT_NAME}",
# #         "version": settings.VERSION,
# #     }

# """
# FastAPI Main Application with Security Hardening
# DestinyPal Backend API
# """
# from fastapi import FastAPI, Request
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.responses import JSONResponse
# from contextlib import asynccontextmanager
# import logging

# from app.core.config import settings
# from app.core.logging import setup_logging
# from app.api.v1 import auth, users, students, sponsors, institutions, payments, donations, stats, public
# from app.middleware.rate_limit import RateLimitMiddleware, AuthRateLimitMiddleware
# from app.middleware.security import ContentTypeValidationMiddleware, SecurityHeadersMiddleware
# from app.database.session import engine
# from app.database.base import Base
# from app.models import (
#     User, UserProfile, User2FASettings,
#     Institution, Student, StudentDocument, StudentFeeBalance,
#     Sponsor, Sponsorship,
#     Payment, PaymentAccount, PaymentTransaction, PaymentWebhook,
#     OrganizationDonation,contact,
# )
# from app.api.v1.contact import router as contact_router
# from app.api.v1 import files as files_router


# # Setup logging
# setup_logging()
# logger = logging.getLogger(__name__)


# async def init_db():
#     """Create all database tables if they don't exist."""
#     async with engine.begin() as conn:
#         # Create all tables defined in models
#         await conn.run_sync(Base.metadata.create_all)
#     logger.info("Database tables initialized successfully")


# @asynccontextmanager
# async def lifespan(app: FastAPI):
#     """Application lifespan events."""
#     # Startup
#     logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
#     logger.info(f"Debug mode: {settings.DEBUG}")
#     logger.info(f"CORS origins configured: {settings.CORS_ORIGINS}")
    
#     try:
#         await init_db()
#     except Exception as e:
#         logger.error(f"Failed to initialize database: {e}")
#         raise
    
#     yield
    
#     # Shutdown
#     logger.info("Shutting down...")
#     await engine.dispose()


# app = FastAPI(
#     title=settings.PROJECT_NAME,
#     description="DestinyPal Backend API - Student Sponsorship Platform",
#     version=settings.VERSION,
#     docs_url="/api/docs" if settings.DEBUG else None,
#     redoc_url="/api/redoc" if settings.DEBUG else None,
#     openapi_url="/api/openapi.json" if settings.DEBUG else None,
#     lifespan=lifespan,
# )

# cors_origins = settings.CORS_ORIGINS
# if not cors_origins and settings.DEBUG:
#     # Fallback for development - allows common local dev URLs
#     cors_origins = [
#         "http://localhost:3000",
#         "http://127.0.0.1:3000",
#         "http://localhost:3001",
#         "http://127.0.0.1:3001",
#     ]
#     logger.warning(f"No CORS_ORIGINS set, using development defaults: {cors_origins}")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=cors_origins,
#     allow_credentials=True,
#     allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
#     allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie"],
#     expose_headers=["X-Request-ID", "Set-Cookie"],
#     max_age=600,
# )

# app.add_middleware(SecurityHeadersMiddleware)
# app.add_middleware(ContentTypeValidationMiddleware)
# app.add_middleware(AuthRateLimitMiddleware, max_attempts=5, lockout_minutes=15)
# app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_REQUESTS)

# @app.exception_handler(Exception)
# async def global_exception_handler(request: Request, exc: Exception):
#     """Handle all unhandled exceptions securely."""
#     # Log the full error for debugging
#     logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
#     # Return generic error to client (no internal details)
#     return JSONResponse(
#         status_code=500,
#         content={"detail": "An internal error occurred. Please try again later."},
#     )


# # Include API routers
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
# app.include_router(sponsors.router, prefix="/api/v1/sponsors", tags=["Sponsors"])
# app.include_router(institutions.router, prefix="/api/v1/institutions", tags=["Institutions"])
# app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
# app.include_router(donations.router, prefix="/api/v1/donations", tags=["Donations"])
# app.include_router(stats.router, prefix="/api/v1/stats", tags=["Statistics"])
# app.include_router(public.router, prefix="/api/v1/public", tags=["Public"])
# app.include_router(files_router.router, prefix="/api/v1/files", tags=["Files"])
# app.include_router(contact_router, prefix="/api/v1")


# @app.get("/health")
# async def health_check():
#     """Health check endpoint."""
#     return {"status": "healthy", "version": settings.VERSION}


# @app.get("/")
# async def root():
#     """Root endpoint."""
#     return {
#         "message": f"Welcome to {settings.PROJECT_NAME}",
#         "version": settings.VERSION,
#     }
"""
FastAPI Main Application with Security Hardening
DestinyPal Backend API
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1 import auth, users, students, sponsors, institutions, payments, donations, stats, public
from app.middleware.rate_limit import RateLimitMiddleware, AuthRateLimitMiddleware
from app.middleware.security import ContentTypeValidationMiddleware, SecurityHeadersMiddleware
from app.database.session import engine
from app.database.base import Base
from app.models import (
    User, UserProfile, User2FASettings,
    Institution, Student, StudentDocument, StudentFeeBalance,
    Sponsor, Sponsorship,
    Payment, PaymentAccount, PaymentTransaction, PaymentWebhook,
    OrganizationDonation, contact,
)
from app.api.v1.contact import router as contact_router
from app.api.v1 import files as files_router
from app.api.v1.admin_notifications import router as admin_notifications_router

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


async def init_db():
    """Create all database tables if they don't exist."""
    async with engine.begin() as conn:
        # Create all tables defined in models
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables initialized successfully")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"CORS origins configured: {settings.CORS_ORIGINS}")
    
    try:
        await init_db()
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DestinyPal Backend API - Student Sponsorship Platform",
    version=settings.VERSION,
    docs_url="/api/docs" if settings.DEBUG else None,
    redoc_url="/api/redoc" if settings.DEBUG else None,
    openapi_url="/api/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

cors_origins = settings.CORS_ORIGINS
if not cors_origins and settings.DEBUG:
    # Fallback for development - allows common local dev URLs
    cors_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]
    logger.warning(f"No CORS_ORIGINS set, using development defaults: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Cookie"],
    expose_headers=["X-Request-ID", "Set-Cookie"],
    max_age=600,
)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(ContentTypeValidationMiddleware)
app.add_middleware(AuthRateLimitMiddleware, max_attempts=5, lockout_minutes=15)
app.add_middleware(RateLimitMiddleware, requests_per_minute=settings.RATE_LIMIT_REQUESTS)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Handle all unhandled exceptions securely."""
    # Log the full error for debugging
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    # Return generic error to client (no internal details)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again later."},
    )


# Include API routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
app.include_router(students.router, prefix="/api/v1/students", tags=["Students"])
app.include_router(sponsors.router, prefix="/api/v1/sponsors", tags=["Sponsors"])
app.include_router(institutions.router, prefix="/api/v1/institutions", tags=["Institutions"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["Payments"])
app.include_router(donations.router, prefix="/api/v1/donations", tags=["Donations"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Statistics"])
app.include_router(public.router, prefix="/api/v1/public", tags=["Public"])
app.include_router(files_router.router, prefix="/api/v1/files", tags=["Files"])
app.include_router(contact_router, prefix="/api/v1")
app.include_router(admin_notifications_router, prefix="/api/v1/admin", tags=["Admin Notifications"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.VERSION}


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "version": settings.VERSION,
    }
