"""Add contact_submissions table

Revision ID: 002_add_contact_submissions
Revises: 001_initial_schema
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '002_add_contact_submissions'
down_revision: Union[str, None] = '001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create enum types
    inquiry_type_enum = postgresql.ENUM(
        'general', 'sponsor', 'institution', 'student',
        name='inquirytype',
        create_type=False
    )
    contact_status_enum = postgresql.ENUM(
        'pending', 'sent', 'failed', 'responded',
        name='contactstatus',
        create_type=False
    )
    
    # Create enums
    op.execute("CREATE TYPE inquirytype AS ENUM ('general', 'sponsor', 'institution', 'student')")
    op.execute("CREATE TYPE contactstatus AS ENUM ('pending', 'sent', 'failed', 'responded')")
    
    # Create contact_submissions table
    op.create_table(
        'contact_submissions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False),
        sa.Column('email', sa.String(255), nullable=False, index=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('inquiry_type', inquiry_type_enum, nullable=False, server_default='general'),
        sa.Column('subject', sa.String(200), nullable=False),
        sa.Column('message', sa.Text, nullable=False),
        sa.Column('status', contact_status_enum, nullable=False, server_default='pending'),
        sa.Column('ip_address', sa.String(45), nullable=True),
        sa.Column('user_agent', sa.String(500), nullable=True),
        sa.Column('turnstile_verified', sa.Boolean, default=False),
        sa.Column('responded_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('response_notes', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )
    
    # Create indexes
    op.create_index('ix_contact_submissions_created_at', 'contact_submissions', ['created_at'])
    op.create_index('ix_contact_submissions_status', 'contact_submissions', ['status'])


def downgrade() -> None:
    op.drop_index('ix_contact_submissions_status', table_name='contact_submissions')
    op.drop_index('ix_contact_submissions_created_at', table_name='contact_submissions')
    op.drop_table('contact_submissions')
    op.execute("DROP TYPE contactstatus")
    op.execute("DROP TYPE inquirytype")
