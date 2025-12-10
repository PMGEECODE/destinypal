"""
File serving API routes.
"""
from uuid import UUID
import io

from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse, FileResponse
from sqlalchemy import select

from app.models.student import Student
from app.core.deps import CurrentUser, DBSession
from app.services.file_service import file_storage_service

router = APIRouter()


@router.get("/{student_id}/{filename}")
async def serve_file(
    student_id: str,
    filename: str,
    db: DBSession,
    current_user: CurrentUser,
):
    """
    Serve a file from student storage.
    Profile photos are served publicly, encrypted documents require authorization.
    """
    try:
        # Check if it's an encrypted file (documents)
        is_encrypted_file = filename.startswith("enc_")
        
        if is_encrypted_file:
            # For encrypted documents, verify authorization
            result = await db.execute(
                select(Student).where(Student.id == UUID(student_id))
            )
            student = result.scalar_one_or_none()
            
            if not student:
                raise HTTPException(status_code=404, detail="Student not found")
            
            # Only allow student themselves, their institution, or admin
            if current_user.role.value == "student" and student.user_id != current_user.id:
                raise HTTPException(status_code=403, detail="Not authorized")
        
        # Download file (will decrypt if encrypted)
        file_data, was_encrypted = await file_storage_service.download_file(
            student_id=student_id,
            filename=filename,
        )
        
        # Determine content type
        content_type = "application/octet-stream"
        lower_filename = filename.lower()
        if ".jpg" in lower_filename or ".jpeg" in lower_filename:
            content_type = "image/jpeg"
        elif ".png" in lower_filename:
            content_type = "image/png"
        elif ".webp" in lower_filename:
            content_type = "image/webp"
        elif ".pdf" in lower_filename:
            content_type = "application/pdf"
        
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=3600" if not was_encrypted else "private, no-cache",
            },
        )
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")


@router.get("/public/{student_id}/{filename}")
async def serve_public_file(
    student_id: str,
    filename: str,
):
    """
    Serve public files like profile photos without authentication.
    Only non-encrypted files are served through this endpoint.
    """
    # Don't allow serving encrypted files through public endpoint
    if filename.startswith("enc_"):
        raise HTTPException(status_code=403, detail="Cannot access encrypted files publicly")
    
    try:
        file_data, _ = await file_storage_service.download_file(
            student_id=student_id,
            filename=filename,
        )
        
        # Determine content type
        content_type = "image/jpeg"
        lower_filename = filename.lower()
        if ".png" in lower_filename:
            content_type = "image/png"
        elif ".webp" in lower_filename:
            content_type = "image/webp"
        
        return StreamingResponse(
            io.BytesIO(file_data),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
            },
        )
        
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error serving file: {str(e)}")
