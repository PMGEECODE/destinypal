"""
Base Pydantic schemas with security configurations.
"""
from pydantic import BaseModel, ConfigDict


class StrictSchema(BaseModel):
    """
    Base schema that rejects unexpected fields.
    All schemas should inherit from this for security.
    """
    model_config = ConfigDict(
        extra="forbid",  # Reject unexpected fields
        str_strip_whitespace=True,  # Strip whitespace from strings
        validate_assignment=True,  # Validate on assignment
    )
