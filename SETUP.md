# Setup Instructions

## Important: Database Configuration

Before running the application, you need to update the database credentials in the `.env` file.

### Step 1: Update Database Credentials

Replace `[YOUR-PASSWORD]` in the `.env` file with your actual Supabase database password:

```env
# Connect to Supabase via connection pooling
DATABASE_URL="postgresql://postgres.kuwhsxelqaodxziseewc:YOUR_ACTUAL_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres.kuwhsxelqaodxziseewc:YOUR_ACTUAL_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres"
```

### Step 2: Set up the Database

Once you've updated the credentials, run:

```bash
npx prisma db push
npx prisma db seed
```

### Step 3: Start the Application

```bash
npm run dev
```

## Features Overview

The application includes:

1. **Authentication System**
   - User registration and login
   - JWT-based authentication with HTTP-only cookies
   - Protected routes with middleware

2. **AI-Powered Career Agents**
   - **Company Agent**: Research companies and opportunities
   - **Internship Agent**: Find internship opportunities
   - **Job Agent**: Discover job openings
   - **Career Consultant**: Get comprehensive career advice

3. **Modern UI/UX**
   - Dark theme with professional orange accents
   - Responsive design for all devices
   - Smooth animations and transitions
   - Professional chat interface

4. **Database Integration**
   - PostgreSQL with Supabase
   - Prisma ORM for type-safe database operations
   - Chat history and session management
   - Company and opportunity data

## Usage Flow

1. Visit the homepage at `http://localhost:3000`
2. Sign up for a new account or sign in
3. Choose from 4 specialized AI agents on the dashboard
4. Start chatting with your chosen agent
5. Get personalized career guidance based on your needs

## AI Agent Capabilities

### Company Agent
- Research company culture and values
- Find companies in specific industries
- Get insights about work environment
- Learn about company benefits and opportunities

### Internship Agent
- Find internships matching your skills and interests
- Get application tips and requirements
- Learn about different internship programs
- Receive guidance on internship applications

### Job Agent
- Search for jobs based on experience level
- Get salary information and market insights
- Find remote and on-site opportunities
- Receive interview and application advice

### Career Consultant
- Comprehensive career planning and strategy
- Skill development recommendations
- Resume and interview preparation
- Career transition guidance
- Professional development advice

Each agent uses the Gemini AI API to provide intelligent, contextual responses tailored to your specific career needs.