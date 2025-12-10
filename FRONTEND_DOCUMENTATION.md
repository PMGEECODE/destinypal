# DestinyPal Frontend Documentation

## Overview

DestinyPal is an education sponsorship platform that connects sponsors with students in need. The frontend is built with React, TypeScript, and Tailwind CSS, featuring role-based dashboards for different user types.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [User Roles & Dashboards](#user-roles--dashboards)
3. [Admin Dashboard](#admin-dashboard)
4. [Student Dashboard](#student-dashboard)
5. [Institution Dashboard](#institution-dashboard)
6. [Sponsor Dashboard](#sponsor-dashboard)
7. [Public Dashboards](#public-dashboards)
8. [Shared Components](#shared-components)
9. [Authentication System](#authentication-system)
10. [Payment System](#payment-system)

---

## Architecture Overview

### Tech Stack
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React useState/useEffect hooks
- **API Layer**: Custom API client (`src/lib/api.ts`) connecting to FastAPI backend
- **Database Compatibility**: Supabase-like query builder (`src/lib/supabase.ts`)

### File Structure
\`\`\`
src/
├── components/
│   ├── admin/           # Admin dashboard components
│   ├── student/         # Student dashboard components
│   ├── institution/     # Institution dashboard components
│   ├── sponsor/         # Sponsor-related components
│   └── AuthPublic/      # Authentication components
├── services/
│   └── paymentService.ts # Payment processing logic
├── lib/
│   ├── api.ts           # FastAPI client
│   ├── supabase.ts      # Database query builder
│   └── types.ts         # TypeScript type definitions
└── types/
    └── index.ts         # Shared type definitions
\`\`\`

---

## User Roles & Dashboards

| Role | Dashboard | Access Level |
|------|-----------|--------------|
| Admin | AdminDashboard | Full system access |
| Student | StudentDashboard | Personal profile & sponsorships |
| Institution | InstitutionDashboard | Manage enrolled students |
| Sponsor | MySponsorshipsDashboard | Track sponsored students |
| Public | StudentsInNeedDashboard | Browse & sponsor students |

---

## Admin Dashboard

### Location
`src/components/admin/AdminDashboard.tsx`

### Description
The Admin Dashboard provides complete administrative control over the DestinyPal platform with real-time statistics, user management, and system configuration.

### Navigation Views
| View | Component | Description |
|------|-----------|-------------|
| Home | `AdminHome` | Dashboard overview with key metrics |
| Users | `AdminUsers` | Manage all platform users |
| Students | `AdminStudents` | Student management & verification |
| Institutions | `AdminInstitutions` | Institution management & creation |
| Sponsors | `AdminSponsors` | Sponsor management |
| Compliance | `AdminCompliance` | Blacklist/whitelist management |
| Payments | `AdminPayments` | Payment transaction monitoring |
| Donations | `AdminDonations` | Organization donation tracking |
| Analytics | `AdminAnalytics` | Reports and trend analysis |
| Settings | `AdminSettings` | System configuration |

---

### AdminHome
**File**: `src/components/admin/AdminHome.tsx`

**Features**:
- Real-time system statistics (users, students, institutions, sponsors)
- Revenue tracking with growth indicators
- Student sponsorship overview (sponsored vs unsponsored)
- Payment status breakdown (completed, pending, failed)
- Recent activity feed

**Key Metrics Displayed**:
- Total System Users
- Total Students
- Institutions Count
- Active Sponsors
- Total Revenue
- Total Donations
- Active Sponsorships
- Average Sponsorship Amount

---

### AdminStudents
**File**: `src/components/admin/AdminStudents.tsx`

**Features**:
- List all registered students with pagination
- Search by name or grade level
- Filter by sponsorship status (all/sponsored/unsponsored)
- Bulk verify all students
- Individual student verification toggle
- View student fee balance progress

**Actions**:
- Verify/Unverify individual students
- Verify All Students (bulk action)
- View student details

---

### AdminSponsors
**File**: `src/components/admin/AdminSponsors.tsx`

**Features**:
- List all sponsors with contact information
- Search by name or email
- Track active sponsorships per sponsor
- View total contributions

**Displayed Information**:
- Sponsor name and contact
- Active/Inactive status
- Number of active sponsorships
- Total amount spent

---

### AdminInstitutions
**File**: `src/components/admin/AdminInstitutions.tsx`

**Features**:
- List all registered institutions
- Search by name or email
- Create new institutions with temporary passwords
- Verify/Unverify institutions
- Track student count per institution

**Create Institution Form Fields**:
- Institution name (required)
- Email (required)
- Phone, Address, Region, Country
- Institution type (secondary_school, university, etc.)
- Contact person details
- Website, Registration number
- Auto-generated temporary password

---

### AdminPayments
**File**: `src/components/admin/AdminPayments.tsx`

**Features**:
- View all payment transactions
- Filter by status (all/completed/pending/failed)
- Transaction table with details
- Payment statistics (success rate, average, total processed)

**Transaction Details**:
- Reference ID
- Payment type
- Amount and currency
- Payment method
- Status with visual indicators
- Transaction date

---

### AdminDonations
**File**: `src/components/admin/AdminDonations.tsx`

**Features**:
- Track organization donations
- View donor information
- Statistics: total donations, total amount, average, monthly count

**Donation Information**:
- Donor name and email
- Amount donated
- Payment method
- Date
- Optional message

---

### AdminAnalytics
**File**: `src/components/admin/AdminAnalytics.tsx`

**Features**:
- Time-range selection (6 months, 12 months, 24 months)
- Revenue trend visualization (bar charts)
- Student growth tracking
- Sponsor growth tracking
- Period summaries

**Charts**:
- Revenue by month
- New students by month
- New sponsors by month

---

### AdminCompliance
**File**: `src/components/admin/AdminCompliance.tsx`

**Features**:
- Manage compliance status for institutions, students, and sponsors
- Four compliance levels: Active, Whitelisted, Blacklisted, Suspended
- Search and filter by entity type
- Audit trail with timestamps and reasons

**Compliance Statuses**:
| Status | Color | Description |
|--------|-------|-------------|
| Active | Green | Normal status |
| Whitelisted | Blue | Trusted/verified partner |
| Blacklisted | Red | Permanently blocked |
| Suspended | Amber | Temporarily blocked |

---

### AdminUsers
**File**: `src/components/admin/AdminUsers.tsx`

**Features**:
- Unified view of all platform users
- Filter by user type (students, institutions, sponsors)
- Search by name or email
- View join date and user details

---

### AdminSettings
**File**: `src/components/admin/AdminSettings.tsx`

**Configuration Sections**:

1. **Notifications**
   - Email notifications toggle
   - Payment alerts toggle
   - System alerts toggle
   - Weekly reports toggle

2. **Security**
   - Two-factor authentication toggle
   - Maintenance mode toggle

3. **Data Management**
   - Automatic backups toggle
   - Data retention period (90 days to forever)

4. **Email Configuration**
   - Admin email (display only)
   - Support email
   - No-reply email

---

## Student Dashboard

### Location
`src/components/student/StudentDashboard.tsx`

### Description
Personal dashboard for students to view their profile, sponsorships, documents, and settings.

### Navigation Views
| View | Component | Description |
|------|-----------|-------------|
| Profile | `StudentProfile` | Personal information & fee balance |
| Documents | `StudentDocuments` | Upload verification documents |
| Sponsors | `StudentSponsors` | View sponsorships & payments |
| Settings | `StudentSettings` | Account settings |
| Help | `StudentHelp` | Support resources |

---

### StudentProfile
**File**: `src/components/student/StudentProfile.tsx`

**Features**:
- Display student photo and personal info
- Age calculation from date of birth
- Fee balance visualization with progress bar
- Background story display
- Family situation information
- Academic performance details
- Institution information

**Fee Balance Section**:
- Total fees
- Amount paid
- Balance due
- Visual progress bar

---

### StudentDocuments
**File**: `src/components/student/StudentDocuments.tsx`

**Features**:
- Document upload interface with verification workflow
- Verification progress tracker
- Disclaimer acceptance required
- Support for multiple document types

**Required Documents**:
| Type | Label | Accepted Formats | Max Size |
|------|-------|------------------|----------|
| passport_photo | Passport Photo | .jpg, .jpeg, .png | 5MB |
| academic_results | Academic Results | .pdf, .jpg, .jpeg, .png | 10MB |
| authority_letter | Authority Letter | .pdf, .jpg, .jpeg, .png | 10MB |
| approval_letter | School Approval Letter | .pdf, .jpg, .jpeg, .png | 10MB |
| identification | Identification Document | .pdf, .jpg, .jpeg, .png | 10MB |

**Document Statuses**:
- Pending Review (amber)
- Approved (green)
- Rejected (red) - with rejection reason

---

### StudentSponsors
**File**: `src/components/student/StudentSponsors.tsx`

**Features**:
- List all sponsors supporting the student
- View sponsor contact information
- Track sponsorship status (active, paused, completed)
- Payment history per sponsorship
- Statistics: total sponsors, total received, active sponsorships

---

## Institution Dashboard

### Location
`src/components/institution/InstitutionDashboard.tsx`

### Description
Dashboard for educational institutions to manage their enrolled students and track sponsorships.

### Navigation Views
| View | Component | Description |
|------|-----------|-------------|
| Home | `InstitutionHome` | Dashboard overview |
| Students | `InstitutionStudents` | Manage enrolled students |
| Register | `InstitutionRegisterStudent` | Register new students |
| Profile | `InstitutionProfile` | Institution profile |
| Settings | `InstitutionSettings` | Account settings |
| Help | `InstitutionHelp` | Support resources |

---

### InstitutionHome
**File**: `src/components/institution/InstitutionHome.tsx`

**Features**:
- Overview statistics for the institution
- Quick action buttons
- Payment progress overview

**Statistics**:
- Total Students
- Sponsored Students
- Unsponsored Students
- Total Fees Owed
- Fees Paid
- Outstanding Balance
- Active Sponsors
- Recent Registrations (30 days)

---

### InstitutionStudents
**File**: `src/components/institution/InstitutionStudents.tsx`

**Features**:
- List all students enrolled at the institution
- Search by name or grade
- Filter by sponsorship status
- View fee balance for each student
- Student cards with photo, age, grade, location

**Student Card Details**:
- Photo
- Full name
- Age and gender
- Grade level
- Location
- Sponsorship status badge
- Fee balance progress bar

---

## Sponsor Dashboard

### MySponsorshipsDashboard
**File**: `src/components/MySponsorshipsDashboard.tsx`

**Features**:
- View all sponsored students
- Track payment progress per student
- View payment history
- Statistics: total sponsored, total contributed, active sponsorships

**Per-Sponsorship Information**:
- Student photo and details
- Institution information
- Sponsorship status
- Commitment type (full/partial)
- Start date
- Payment progress bar
- Recent payments list

---

## Public Dashboards

### StudentsInNeedDashboard
**File**: `src/components/StudentsInNeedDashboard.tsx`

**Description**:
Public-facing dashboard for browsing and sponsoring students in need.

**Features**:
- Browse students by institution
- View student profiles with need levels
- Create sponsorships
- Make organization donations
- Statistics: students in need, institutions, total fees needed

**Flow**:
1. View institutions grid
2. Select institution to see students
3. Click student to view details
4. Choose to sponsor (creates sponsorship + payment)
5. Or donate to platform directly

---

### ImpactDashboard
**File**: `src/components/ImpactDashboard.tsx`

**Description**:
Showcase the platform's overall impact with aggregate statistics.

**Displayed Metrics**:
- Students Supported
- Active Sponsors
- Active Sponsorships
- Total Funds Raised
- Total Donations
- Locations Served

---

## Shared Components

### StudentCard
**File**: `src/components/StudentCard.tsx`

Reusable card component displaying student information with:
- Photo placeholder
- Name, age, gender, grade
- Location
- Need level indicator
- Fee balance progress
- Sponsorship status badge

### StudentDetailModal
**File**: `src/components/StudentDetailModal.tsx`

Modal for viewing complete student details with:
- Full profile information
- Background story
- Family situation
- Academic performance
- Payment accounts for sponsorship

### SponsorshipModal
**File**: `src/components/SponsorshipModal.tsx`

Multi-step modal for creating sponsorships:
1. Sponsor information form
2. Commitment type selection
3. Payment method selection
4. Payment processing

### DonationModal
**File**: `src/components/DonationModal.tsx`

Modal for making platform donations:
- Donor name and email
- Donation amount
- Payment method selection
- Optional message

### VerifiedBadge
**File**: `src/components/VerifiedBadge.tsx`

Visual badge indicating verified status (blue checkmark).

### ComplianceBadge
**File**: `src/components/ComplianceBadge.tsx`

Visual badge showing compliance status with appropriate colors.

### PaymentStatusTracker
**File**: `src/components/PaymentStatusTracker.tsx`

Real-time payment status tracking component.

---

## Authentication System

### Location
`src/components/AuthPublic/`

### Components

| Component | Purpose |
|-----------|---------|
| `AuthContext.tsx` | Authentication state management |
| `AuthGuard.tsx` | Route protection |
| `AuthRouter.tsx` | Authentication routing |
| `Login.tsx` | Login form |
| `ForgotPassword.tsx` | Password reset request |
| `ResetPassword.tsx` | Password reset form |
| `VerifyEmail.tsx` | Email verification |
| `VerifySMS.tsx` | SMS verification |
| `TwoFactorSetup.tsx` | 2FA configuration |
| `TwoFactorVerify.tsx` | 2FA verification |

### Registration Forms
| Component | User Type |
|-----------|-----------|
| `RegisterSelector.tsx` | Role selection |
| `StudentRegister.tsx` | Student registration |
| `HighSchoolStudentRegister.tsx` | High school student |
| `UniversityStudentRegister.tsx` | University student |
| `SponsorRegister.tsx` | Sponsor registration |
| `InstitutionRegister.tsx` | Institution registration |

### Shared Auth Components
- `CountrySelect.tsx` - Country dropdown
- `PhoneInput.tsx` - Phone number input
- `PasswordStrengthMeter.tsx` - Password strength indicator

---

## Payment System

### PaymentService
**File**: `src/services/paymentService.ts`

**Supported Payment Methods**:
| Method | Provider | Description |
|--------|----------|-------------|
| M-Pesa | Safaricom | Mobile money (Kenya) |
| Airtel Money | Airtel | Mobile money |
| Card | Stripe | Credit/Debit cards |

**Features**:
- Process payments through FastAPI backend
- Poll payment status for mobile money
- Generate payment reference IDs
- Real-time status updates

**Payment Flow**:
1. User initiates payment
2. Service calls appropriate backend endpoint
3. For mobile money: STK push sent to phone
4. Status polling until completion/failure
5. Update UI with result

---

## Environment Variables

### Frontend (`.env.local`)
\`\`\`
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
\`\`\`

### Backend (see `backend/.env`)
Database, JWT, CORS, SMTP, and payment provider configuration.

---

## Design System

### Color Palette
- **Primary**: Slate (admin), Green (student), Orange (institution), Blue (sponsor)
- **Success**: Green-600
- **Warning**: Amber-600
- **Error**: Red-600
- **Info**: Blue-600

### Typography
- Headings: Font-bold, text-gray-800
- Body: text-gray-600
- Labels: text-sm, text-gray-500

### Components
- Cards: `bg-white rounded-lg shadow-md`
- Buttons: `rounded-lg font-medium transition-colors`
- Inputs: `border border-gray-300 rounded-lg focus:ring-2`
- Badges: `px-3 py-1 rounded-full text-xs font-semibold`

---

## API Integration

All frontend components communicate with the FastAPI backend through:

1. **`src/lib/api.ts`** - Direct API client with JWT authentication
2. **`src/lib/supabase.ts`** - Supabase-compatible query builder (for migration compatibility)

The API client handles:
- JWT token storage and refresh
- Request/response interceptors
- Error handling
- Authentication state management

---

## Best Practices

1. **State Management**: Use local state for UI, context for auth
2. **Loading States**: Always show loading indicators
3. **Error Handling**: Display user-friendly error messages
4. **Responsive Design**: Mobile-first with Tailwind breakpoints
5. **Accessibility**: Proper ARIA labels and keyboard navigation
6. **Security**: Never expose sensitive data in client code
