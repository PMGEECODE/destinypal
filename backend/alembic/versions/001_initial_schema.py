"""Initial DestinyPal schema migration.

Revision ID: 001_initial
Revises: 
Create Date: 2024-12-03

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_initial'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create enum types
    op.execute("CREATE TYPE user_role AS ENUM ('admin', 'sponsor', 'student', 'institution', 'public')")
    op.execute("CREATE TYPE two_factor_method AS ENUM ('email', 'sms', 'totp')")
    op.execute("CREATE TYPE verification_status AS ENUM ('pending', 'in_review', 'approved', 'rejected')")
    op.execute("CREATE TYPE student_status AS ENUM ('active', 'inactive', 'graduated', 'suspended', 'pending')")
    op.execute("CREATE TYPE education_level AS ENUM ('primary', 'secondary', 'tertiary', 'vocational')")
    op.execute("CREATE TYPE sponsorship_status AS ENUM ('active', 'pending', 'completed', 'cancelled', 'paused')")
    op.execute("CREATE TYPE payment_method AS ENUM ('mpesa', 'airtel', 'card', 'bank_transfer', 'paypal')")
    op.execute("CREATE TYPE transaction_status AS ENUM ('initiated', 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')")
    op.execute("CREATE TYPE transaction_type AS ENUM ('donation', 'sponsorship', 'fee_payment', 'disbursement', 'refund')")
    op.execute("CREATE TYPE donation_frequency AS ENUM ('one_time', 'monthly', 'quarterly', 'annually')")
    op.execute("CREATE TYPE institution_type AS ENUM ('primary_school', 'secondary_school', 'university', 'college', 'vocational', 'other')")
    
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('email', sa.String(255), unique=True, nullable=False, index=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(20), unique=True, nullable=True),
        sa.Column('role', postgresql.ENUM('admin', 'sponsor', 'student', 'institution', 'public', name='user_role', create_type=False), nullable=False, default='public'),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('is_verified', sa.Boolean(), default=False),
        sa.Column('email_verified', sa.Boolean(), default=False),
        sa.Column('phone_verified', sa.Boolean(), default=False),
        sa.Column('two_factor_enabled', sa.Boolean(), default=False),
        sa.Column('two_factor_method', postgresql.ENUM('email', 'sms', 'totp', name='two_factor_method', create_type=False), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    
    # User profiles
    op.create_table(
        'user_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('first_name', sa.String(100), nullable=True),
        sa.Column('last_name', sa.String(100), nullable=True),
        sa.Column('display_name', sa.String(200), nullable=True),
        sa.Column('avatar_url', sa.String(500), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(20), nullable=True),
        sa.Column('nationality', sa.String(100), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('county', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), nullable=True, default='Kenya'),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    
    # User 2FA settings
    op.create_table(
        'user_2fa_settings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('method', postgresql.ENUM('email', 'sms', 'totp', name='two_factor_method', create_type=False), nullable=False),
        sa.Column('enabled', sa.Boolean(), default=False),
        sa.Column('totp_secret', sa.String(255), nullable=True),
        sa.Column('backup_codes_hash', sa.Text(), nullable=True),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    
    # Refresh tokens
    op.create_table(
        'refresh_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(255), unique=True, nullable=False),
        sa.Column('device_info', sa.String(500), nullable=True),
        sa.Column('ip_address', sa.String(50), nullable=True),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean(), default=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
    )
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    
    # Institutions
    op.create_table(
        'institutions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('institution_type', postgresql.ENUM('primary_school', 'secondary_school', 'university', 'college', 'vocational', 'other', name='institution_type', create_type=False), nullable=False),
        sa.Column('registration_number', sa.String(100), unique=True, nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('website', sa.String(255), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('city', sa.String(100), nullable=True),
        sa.Column('county', sa.String(100), nullable=True),
        sa.Column('country', sa.String(100), default='Kenya'),
        sa.Column('postal_code', sa.String(20), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('logo_url', sa.String(500), nullable=True),
        sa.Column('verification_status', postgresql.ENUM('pending', 'in_review', 'approved', 'rejected', name='verification_status', create_type=False), default='pending'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('student_count', sa.Integer(), default=0),
        sa.Column('metadata', postgresql.JSONB(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    op.create_index('ix_institutions_name', 'institutions', ['name'])
    
    # Students
    op.create_table(
        'students',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('student_id', sa.String(50), unique=True, nullable=True),
        sa.Column('first_name', sa.String(100), nullable=False),
        sa.Column('last_name', sa.String(100), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(20), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('phone', sa.String(20), nullable=True),
        sa.Column('profile_image_url', sa.String(500), nullable=True),
        sa.Column('education_level', postgresql.ENUM('primary', 'secondary', 'tertiary', 'vocational', name='education_level', create_type=False), nullable=True),
        sa.Column('grade_class', sa.String(50), nullable=True),
        sa.Column('academic_year', sa.String(20), nullable=True),
        sa.Column('gpa', sa.Numeric(3, 2), nullable=True),
        sa.Column('status', postgresql.ENUM('active', 'inactive', 'graduated', 'suspended', 'pending', name='student_status', create_type=False), default='pending'),
        sa.Column('verification_status', postgresql.ENUM('pending', 'in_review', 'approved', 'rejected', name='verification_status', create_type=False), default='pending'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('county', sa.String(100), nullable=True),
        sa.Column('sub_county', sa.String(100), nullable=True),
        sa.Column('background_story', sa.Text(), nullable=True),
        sa.Column('funding_goal', sa.Numeric(12, 2), nullable=True),
        sa.Column('amount_raised', sa.Numeric(12, 2), default=0),
        sa.Column('is_featured', sa.Boolean(), default=False),
        sa.Column('guardian_name', sa.String(200), nullable=True),
        sa.Column('guardian_phone', sa.String(20), nullable=True),
        sa.Column('guardian_relationship', sa.String(50), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    op.create_index('ix_students_institution_id', 'students', ['institution_id'])
    op.create_index('ix_students_status', 'students', ['status'])
    
    # Sponsors
    op.create_table(
        'sponsors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False),
        sa.Column('sponsor_type', sa.String(50), default='individual'),
        sa.Column('company_name', sa.String(255), nullable=True),
        sa.Column('company_registration', sa.String(100), nullable=True),
        sa.Column('tax_id', sa.String(100), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), default=False),
        sa.Column('total_donated', sa.Numeric(14, 2), default=0),
        sa.Column('students_sponsored', sa.Integer(), default=0),
        sa.Column('verification_status', postgresql.ENUM('pending', 'in_review', 'approved', 'rejected', name='verification_status', create_type=False), default='pending'),
        sa.Column('verified_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('preferences', postgresql.JSONB(), default={}),
        sa.Column('metadata', postgresql.JSONB(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    
    # Sponsorships
    op.create_table(
        'sponsorships',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('sponsor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sponsors.id', ondelete='CASCADE'), nullable=False),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='CASCADE'), nullable=False),
        sa.Column('status', postgresql.ENUM('active', 'pending', 'completed', 'cancelled', 'paused', name='sponsorship_status', create_type=False), default='pending'),
        sa.Column('amount_per_period', sa.Numeric(12, 2), nullable=False),
        sa.Column('payment_frequency', postgresql.ENUM('one_time', 'monthly', 'quarterly', 'annually', name='donation_frequency', create_type=False), nullable=False),
        sa.Column('total_committed', sa.Numeric(14, 2), default=0),
        sa.Column('total_paid', sa.Numeric(14, 2), default=0),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('next_payment_date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_anonymous', sa.Boolean(), default=False),
        sa.Column('metadata', postgresql.JSONB(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    op.create_index('ix_sponsorships_sponsor_id', 'sponsorships', ['sponsor_id'])
    op.create_index('ix_sponsorships_student_id', 'sponsorships', ['student_id'])
    
    # Payment transactions
    op.create_table(
        'payment_transactions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('reference_id', sa.String(100), unique=True, nullable=False),
        sa.Column('payment_type', postgresql.ENUM('donation', 'sponsorship', 'fee_payment', 'disbursement', 'refund', name='transaction_type', create_type=False), nullable=False),
        sa.Column('related_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='KES'),
        sa.Column('payment_method', postgresql.ENUM('mpesa', 'airtel', 'card', 'bank_transfer', 'paypal', name='payment_method', create_type=False), nullable=False),
        sa.Column('status', postgresql.ENUM('initiated', 'pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', name='transaction_status', create_type=False), default='initiated'),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('card_last4', sa.String(4), nullable=True),
        sa.Column('card_brand', sa.String(20), nullable=True),
        sa.Column('failure_reason', sa.Text(), nullable=True),
        sa.Column('provider_reference', sa.String(255), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('failed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    op.create_index('ix_payment_transactions_reference_id', 'payment_transactions', ['reference_id'])
    op.create_index('ix_payment_transactions_status', 'payment_transactions', ['status'])
    
    # Donations
    op.create_table(
        'donations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('sponsor_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sponsors.id', ondelete='SET NULL'), nullable=True),
        sa.Column('student_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('students.id', ondelete='SET NULL'), nullable=True),
        sa.Column('institution_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('institutions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('sponsorship_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('sponsorships.id', ondelete='SET NULL'), nullable=True),
        sa.Column('transaction_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('payment_transactions.id', ondelete='SET NULL'), nullable=True),
        sa.Column('amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('currency', sa.String(3), default='KES'),
        sa.Column('frequency', postgresql.ENUM('one_time', 'monthly', 'quarterly', 'annually', name='donation_frequency', create_type=False), default='one_time'),
        sa.Column('is_anonymous', sa.Boolean(), default=False),
        sa.Column('donor_name', sa.String(200), nullable=True),
        sa.Column('donor_email', sa.String(255), nullable=True),
        sa.Column('donor_phone', sa.String(20), nullable=True),
        sa.Column('message', sa.Text(), nullable=True),
        sa.Column('is_recurring', sa.Boolean(), default=False),
        sa.Column('next_donation_date', sa.Date(), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), default={}),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()')),
    )
    op.create_index('ix_donations_sponsor_id', 'donations', ['sponsor_id'])
    op.create_index('ix_donations_student_id', 'donations', ['student_id'])


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('donations')
    op.drop_table('payment_transactions')
    op.drop_table('sponsorships')
    op.drop_table('sponsors')
    op.drop_table('students')
    op.drop_table('institutions')
    op.drop_table('refresh_tokens')
    op.drop_table('user_2fa_settings')
    op.drop_table('user_profiles')
    op.drop_table('users')
    
    # Drop enum types
    op.execute('DROP TYPE IF EXISTS institution_type')
    op.execute('DROP TYPE IF EXISTS donation_frequency')
    op.execute('DROP TYPE IF EXISTS transaction_type')
    op.execute('DROP TYPE IF EXISTS transaction_status')
    op.execute('DROP TYPE IF EXISTS payment_method')
    op.execute('DROP TYPE IF EXISTS sponsorship_status')
    op.execute('DROP TYPE IF EXISTS education_level')
    op.execute('DROP TYPE IF EXISTS student_status')
    op.execute('DROP TYPE IF EXISTS verification_status')
    op.execute('DROP TYPE IF EXISTS two_factor_method')
    op.execute('DROP TYPE IF EXISTS user_role')
