# Student Dashboard Structure

## Overview
The application now features a modular architecture with separate dashboards for sponsors and students, making the codebase more maintainable and scalable.

## Directory Structure

\`\`\`
src/
├── components/
│   ├── student/                    # Student dashboard components
│   │   ├── StudentDashboard.tsx    # Main student dashboard container
│   │   ├── StudentSidebar.tsx      # Student navigation sidebar
│   │   ├── StudentProfile.tsx      # Student profile view
│   │   ├── StudentSponsors.tsx     # View sponsors and payments
│   │   ├── StudentSettings.tsx     # Account settings
│   │   └── StudentHelp.tsx         # Help and support section
│   │
│   ├── Sidebar.tsx                 # Sponsor sidebar
│   ├── StudentsInNeedDashboard.tsx # Browse students (Sponsors)
│   ├── MySponsorshipsDashboard.tsx # Manage sponsorships
│   ├── ImpactDashboard.tsx         # Impact statistics
│   └── ... (other sponsor components)
│
├── services/                       # Business logic services
│   └── paymentService.ts          # Payment processing service
│
├── lib/                           # Libraries and utilities
│   └── supabase.ts               # Supabase client
│
└── App.tsx                        # Main application with dashboard selector
\`\`\`

## Features

### Dashboard Selection
- Landing page allows users to choose between Sponsor or Student dashboard
- Clean separation of concerns between user types

### Student Dashboard Features

#### 1. Profile Section (`StudentProfile.tsx`)
- View student details and photo
- See institution information
- Track fee balance with visual progress bar
- View background story, family situation, and academic performance

#### 2. Sponsors Section (`StudentSponsors.tsx`)
- View all sponsors supporting the student
- See sponsorship details (commitment type, amounts)
- Track payment history
- View sponsor contact information
- Statistics: total sponsors, total received, active sponsorships

#### 3. Settings Section (`StudentSettings.tsx`)
- Manage notification preferences
  - Email notifications
  - Payment alerts
  - Monthly reports
  - Sponsor updates
- Privacy settings
  - Profile visibility (Public, Sponsors Only, Private)
- Security options

#### 4. Help Section (`StudentHelp.tsx`)
- Frequently asked questions
- Contact methods (Email, Phone, Live Chat)
- Quick links to other sections
- Support resources

### Student Dashboard Navigation
- Clean green-themed sidebar
- Email-based authentication
- Logout functionality
- Responsive mobile design

## Authentication Flow

### Student Access
1. User selects "Student Dashboard" from landing page
2. Student enters their email address
3. System searches for student profile by email
4. Dashboard displays student-specific information

### Sponsor Access
1. User selects "Sponsor Dashboard" from landing page
2. Access to browse students, manage sponsorships, donate, and view impact
3. Email required only for "My Sponsorships" section

## Data Flow

### Student Profile Data
- Fetched from `students` table
- Joined with `institutions` table for school info
- `student_fee_balances` table for payment tracking

### Student Sponsors Data
- Fetched from `sponsorships` table
- Joined with `sponsors` table for sponsor details
- Linked with `payments` table for payment history

## Design Patterns

### Color Schemes
- Sponsor Dashboard: Blue theme
- Student Dashboard: Green theme
- Clear visual distinction between user types

### Component Structure
- Modular components in dedicated directories
- Reusable UI patterns
- Consistent prop interfaces
- Type-safe with TypeScript

### State Management
- Local state with React hooks
- Props drilling for simple data flow
- Supabase for data persistence

## Database Integration

The student dashboard uses the following tables:
- `students` - Student profile information
- `institutions` - School/institution details
- `sponsors` - Sponsor information
- `sponsorships` - Sponsorship relationships
- `payments` - Payment transactions
- `student_fee_balances` - Fee tracking

## Responsive Design

All student dashboard components are fully responsive:
- Mobile-first approach
- Collapsible sidebar on mobile
- Optimized layouts for all screen sizes
- Touch-friendly interactions

## Future Enhancements

Potential improvements for the student dashboard:
- Direct messaging with sponsors
- Progress reports and academic updates
- Document uploads (certificates, reports)
- Calendar for important dates
- Achievements and milestones tracking
