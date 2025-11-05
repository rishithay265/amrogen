# 🚀 AmroGen Setup Guide

Complete step-by-step guide to get AmroGen running on your machine.

## Prerequisites

### Required Software
- **Node.js**: Version 20.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL**: Version 14.x or higher ([Download](https://www.postgresql.org/download/))
- **Redis**: Version 6.x or higher ([Download](https://redis.io/download))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

### Required API Keys

1. **Anthropic API Key** (Claude)
   - Sign up at [https://console.anthropic.com/](https://console.anthropic.com/)
   - Create a new API key from the dashboard
   - Copy the key (starts with `sk-ant-...`)

2. **Google API Key** (Gemini)
   - Go to [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
   - Create a new API key
   - Copy the key

3. **Hyperbrowser API Key**
   - Sign up at [https://app.hyperbrowser.ai/](https://app.hyperbrowser.ai/)
   - Navigate to Settings > API Keys
   - Create a new API key
   - Copy the key

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd amrogen
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- Claude Agent SDK
- Gemini API
- Hyperbrowser SDK
- PostgreSQL driver
- Redis client
- And all other dependencies

### 3. Set Up PostgreSQL Database

**Option A: Using Docker (Recommended)**

```bash
docker run --name amrogen-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=amrogen \
  -p 5432:5432 \
  -d postgres:14
```

**Option B: Local Installation**

1. Create a new database:
```sql
CREATE DATABASE amrogen;
```

2. Create a user (optional):
```sql
CREATE USER amrogen_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE amrogen TO amrogen_user;
```

### 4. Set Up Redis

**Option A: Using Docker (Recommended)**

```bash
docker run --name amrogen-redis \
  -p 6379:6379 \
  -d redis:latest
```

**Option B: Local Installation**

Start Redis server:
```bash
redis-server
```

### 5. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# Required API Keys
ANTHROPIC_API_KEY=sk-ant-your-key-here
GOOGLE_API_KEY=your-google-key-here
HYPERBROWSER_API_KEY=your-hyperbrowser-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/amrogen
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=3000
API_PORT=3001
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001

# Optional: Email Services
SENDGRID_API_KEY=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=

# Optional: CRM Integrations
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
HUBSPOT_API_KEY=

# Optional: Data Enrichment
CLEARBIT_API_KEY=
ZOOMINFO_API_KEY=
```

### 6. Run Database Migrations

```bash
npm run db:migrate
```

This will create all necessary tables in your PostgreSQL database.

### 7. (Optional) Seed Sample Data

```bash
npm run db:seed
```

This will add 3 sample leads to help you get started.

### 8. Start the Application

You need to run two servers:

**Terminal 1 - Backend API Server:**
```bash
npm run server
```

You should see:
```
✓ Database connected
✓ Redis connected
✓ API server running on port 3001
✓ WebSocket server ready
```

**Terminal 2 - Frontend Development Server:**
```bash
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 9. Access the Application

Open your browser and navigate to:
```
http://localhost:3000
```

You should see the AmroGen dashboard!

## Verification

### Test Database Connection

```bash
psql -U postgres -d amrogen -c "SELECT * FROM leads LIMIT 1;"
```

### Test Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

### Test API Server

```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test Frontend

Open http://localhost:3000 in your browser. You should see:
- Dashboard with metrics
- Navigation menu
- Sample leads (if seeded)

## Troubleshooting

### Database Connection Error

**Error**: `Connection refused at localhost:5432`

**Solution**:
```bash
# Check if PostgreSQL is running
pg_isready -h localhost -p 5432

# If not running, start it:
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker start amrogen-postgres
```

### Redis Connection Error

**Error**: `Redis connection refused`

**Solution**:
```bash
# Check if Redis is running
redis-cli ping

# If not running, start it:
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Docker
docker start amrogen-redis
```

### API Key Errors

**Error**: `Missing API key for Anthropic`

**Solution**:
- Verify your `.env` file exists in the root directory
- Check that the API key is correct and starts with the proper prefix
- Restart the backend server after updating `.env`

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
```bash
# Find and kill the process using the port
lsof -ti:3000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### TypeScript Errors

**Error**: `Cannot find module '@/...'`

**Solution**:
```bash
# Clean build artifacts
rm -rf .next node_modules
npm install
```

## Next Steps

### 1. Create Your First Lead

Navigate to http://localhost:3000/leads and click "Add Lead"

Fill in the form:
- Name: John Doe
- Email: john@example.com
- Company: Example Corp
- Title: VP of Sales
- Source: linkedin
- Pain Points: Manual data entry, Slow response times
- Budget: $50,000
- Timeline: Q1 2025

### 2. Qualify a Lead

1. Open any lead from the leads page
2. Click "Qualify Lead" button
3. Wait for the AI to analyze using MEDDIC framework
4. Review the qualification results

### 3. Generate Outreach Sequence

1. Open a qualified lead
2. Click "Generate Outreach" button
3. Review the personalized email sequence
4. The AI creates 5 touchpoints with optimal timing

### 4. Discover New Leads

Use the Discovery API to find leads on LinkedIn:

```bash
curl -X POST http://localhost:3001/api/discover \
  -H "Content-Type: application/json" \
  -d '{
    "jobTitles": ["VP of Sales", "Director of Marketing"],
    "companySize": "100-500",
    "location": "United States",
    "maxResults": 20
  }'
```

## Production Deployment

### Environment Setup

For production, update your `.env`:

```env
NODE_ENV=production
DATABASE_URL=your-production-database-url
REDIS_URL=your-production-redis-url
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Build for Production

```bash
# Build the frontend
npm run build

# Start production servers
npm start  # Frontend
npm run server  # Backend
```

### Recommended Hosting

- **Frontend**: Vercel, Netlify, or AWS Amplify
- **Backend**: AWS EC2, Google Cloud Run, or DigitalOcean
- **Database**: AWS RDS, Google Cloud SQL, or Supabase
- **Redis**: AWS ElastiCache, Redis Cloud, or Upstash

## Support

If you encounter any issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the logs in your terminals
3. Create an issue on GitHub
4. Contact support@amrogen.ai

## Additional Resources

- [API Documentation](./API.md)
- [Architecture Overview](./ARCHITECTURE.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Claude Agent SDK Docs](https://docs.anthropic.com/en/api/agent-sdk/overview)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Hyperbrowser Docs](https://docs.hyperbrowser.ai)

---

**Ready to revolutionize your sales process? Let's go! 🚀**
