# Career Platform - AI-Powered Career Guidance

A comprehensive career platform built with Next.js, featuring AI-powered agents that help users with career guidance, company research, internship opportunities, and job searching.

## Features

- **AI-Powered Agents**: Four specialized agents with comprehensive, detailed responses
  - **NRsolution4u Assistant**: Complete information about NRsolution4u's internship programs, training opportunities, and career paths
  - **Internship Agent**: Comprehensive internship guidance with detailed application and interview strategies
  - **Job Agent**: Complete job search support with market insights and career advancement strategies
  - **Career Consultant**: Strategic career guidance with professional development and transition planning

- **Multi-Language Support**: 11 languages supported (English, Hindi, Hinglish, Marathi, Spanish, French, German, Chinese, Japanese, Arabic, Portuguese) with automatic message translation when switching languages
- **Comprehensive Company Database**: All agents can provide website links, addresses, and detailed information for 50+ major companies across all industries
- **Conversation Context**: All AI agents remember previous messages and provide contextually relevant responses
- **Modern UI**: Dark theme with professional orange accents
- **Authentication**: Secure login system with JWT
- **Real-time Chat**: Interactive chat interface with AI agents
- **Database Integration**: PostgreSQL with Prisma ORM
- **Responsive Design**: Works on all devices

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM v5.19.1
- **Database**: PostgreSQL (Supabase)
- **AI**: Google Gemini API
- **Authentication**: JWT with HTTP-only cookies
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Google Gemini API key

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd career-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment variables are already configured** with your Supabase credentials

4. **Database is already set up** with:
   - Schema pushed to Supabase
   - Sample data seeded
   - Test user created

5. **Start the development server**:
   ```bash
   npm run dev
   ```

6. **Access the application**:
   - Local: http://localhost:3000
   - Network: http://192.168.29.68:3000

## Login Credentials

Use these credentials to access the application:
- **Email**: admin@career.com
- **Password**: admin123

## Usage Flow

1. Visit the homepage at `http://localhost:3000`
2. Click "Get Started" to go to login
3. Sign in with the provided credentials
4. Choose from 4 specialized AI agents on the dashboard
5. Start chatting with your chosen agent
6. Get personalized career guidance based on your needs

## AI Agent Capabilities

### NRsolution4u Assistant
- Learn about NRsolution4u company (Nagpur, Maharashtra, India)
- **Website**: http://www.nrsolution4u.com/prayatn
- **Address**: https://maps.google.com/?cid=13404017808869720139&g_mp=Cidnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLlNlYXJjaFRleHQ
- Discover internship programs in web development, mobile apps, and digital marketing
- Get information about training opportunities in ASP.NET, PHP, JavaScript, Android development
- Understand the application process for NRsolution4u positions
- Learn about career growth opportunities within the company
- Get details about NRsolution4u's services: Web Development, Mobile Apps, E-commerce, SEO
- **Bonus Feature**: Can also provide website links and addresses for other companies when requested

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

Each agent uses the Gemini AI API to provide intelligent, contextual responses tailored to your specific career needs. All agents maintain conversation context, remembering your previous messages to provide personalized, progressive guidance without repetition. The agents now provide comprehensive, detailed answers to all questions and can fulfill any specific requests or demands with complete information.

## Database Schema

The application includes:
- **Users**: User accounts and authentication
- **Companies**: Sample companies (Google, Microsoft, Apple)
- **Opportunities**: Jobs and internships
- **ChatSessions**: User chat sessions with agents
- **ChatMessages**: Individual messages in chat sessions

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/chat` - Send message to AI agent

## Project Structure

```
career-platform/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── dashboard/    # Dashboard page
│   │   ├── login/        # Login page
│   │   └── page.tsx      # Homepage
│   ├── components/       # React components
│   ├── lib/             # Utilities and configurations
│   └── middleware.ts    # Route protection
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts         # Database seeding
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.