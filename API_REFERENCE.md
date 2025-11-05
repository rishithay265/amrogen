# 🔌 AmroGen API Reference

Complete API documentation for AmroGen's backend services.

**Base URL**: `http://localhost:3001/api`

---

## 🏥 Health Check

### GET /health
Check if the API server is running.

**Response**
```json
{
  "status": "ok",
  "timestamp": "2025-11-05T10:30:00.000Z"
}
```

---

## 👥 Leads Management

### GET /leads
Get a list of all leads with optional filtering.

**Query Parameters**
- `status` (optional): Filter by lead status
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Request**
```bash
GET /api/leads?status=qualified&limit=20&offset=0
```

**Response**
```json
{
  "leads": [
    {
      "id": "lead_1",
      "name": "John Smith",
      "email": "john@techcorp.com",
      "company": "TechCorp Inc",
      "title": "VP of Sales",
      "source": "linkedin",
      "status": "qualified",
      "qualificationScore": 85,
      "engagementScore": 72,
      "painPoints": ["Manual data entry", "Slow lead response"],
      "budget": 50000,
      "timeline": "Q1 2025",
      "createdAt": "2025-11-01T10:00:00.000Z",
      "updatedAt": "2025-11-05T15:30:00.000Z",
      "assignedTo": null,
      "tags": ["high-priority"],
      "metadata": {}
    }
  ],
  "total": 1
}
```

---

### GET /leads/:id
Get detailed information about a specific lead, including activity history.

**Path Parameters**
- `id` (required): Lead ID

**Example Request**
```bash
GET /api/leads/lead_1
```

**Response**
```json
{
  "lead": {
    "id": "lead_1",
    "name": "John Smith",
    ...
  },
  "activities": [
    {
      "id": "activity_1",
      "leadId": "lead_1",
      "type": "email",
      "subject": "Introduction to AmroGen",
      "content": "Hi John...",
      "outcome": "Email opened",
      "sentBy": "agent",
      "agentName": "outreach",
      "timestamp": "2025-11-05T14:00:00.000Z",
      "metadata": {}
    }
  ]
}
```

---

### POST /leads
Create a new lead.

**Request Body**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "company": "Example Corp",
  "title": "Director of Sales",
  "source": "web_form",
  "painPoints": ["Lead qualification inefficiency"],
  "budget": 35000,
  "timeline": "Q2 2025"
}
```

**Response**
```json
{
  "success": true,
  "leadId": "lead_2"
}
```

**Notes**
- Triggers orchestrator agent automatically
- Emits WebSocket event: `lead:created`

---

### POST /leads/:id/qualify
Qualify a lead using AI-powered MEDDIC framework.

**Path Parameters**
- `id` (required): Lead ID

**Example Request**
```bash
POST /api/leads/lead_1/qualify
```

**Response**
```json
{
  "success": true,
  "qualification": {
    "metrics": {
      "currentCost": 100000,
      "expectedSavings": 40000,
      "roiTimeline": "6 months"
    },
    "economicBuyer": {
      "identified": true,
      "name": "John Smith",
      "title": "VP of Sales"
    },
    "decisionCriteria": [
      "Price",
      "Integration capabilities",
      "Support quality"
    ],
    "decisionProcess": {
      "timeline": "Q1 2025",
      "steps": ["Evaluation", "Proposal", "Decision"],
      "stakeholders": ["VP Sales", "CTO", "CFO"]
    },
    "identifyPain": [
      {
        "painPoint": "Manual data entry consuming 70% of time",
        "severity": "critical",
        "impact": "Reduced productivity and revenue loss"
      },
      {
        "painPoint": "Slow lead response times",
        "severity": "high",
        "impact": "Lower conversion rates"
      }
    ],
    "champion": {
      "exists": true,
      "name": "John Smith",
      "influenceLevel": "high"
    },
    "qualificationScore": 85,
    "recommendation": "advance_to_sales"
  }
}
```

**Notes**
- Uses Gemini 2.0 Flash for fast processing
- Updates lead's qualification score
- Emits WebSocket event: `lead:qualified`

---

### POST /leads/:id/outreach
Generate a personalized multi-touch outreach sequence.

**Path Parameters**
- `id` (required): Lead ID

**Request Body**
```json
{
  "sequenceType": "cold_outreach"
}
```

**Sequence Types**
- `cold_outreach` - Initial contact sequence
- `demo_follow_up` - Post-demo nurturing
- `nurture` - Long-term engagement
- `reengagement` - Re-activate cold leads

**Response**
```json
{
  "success": true,
  "sequence": {
    "emails": [
      {
        "touchNumber": 1,
        "subject": "Quick question about TechCorp's sales process",
        "body": "Hi John,\n\nI noticed TechCorp is experiencing challenges with manual data entry...",
        "sendDelay": "Immediate",
        "cta": "Schedule 15-min call"
      },
      {
        "touchNumber": 2,
        "subject": "How TechCorp compares to industry leaders",
        "body": "Hi John,\n\nI wanted to share a case study...",
        "sendDelay": "2 days",
        "cta": "View case study"
      }
    ],
    "channels": ["email", "linkedin"],
    "totalTouches": 5,
    "estimatedDuration": "2 weeks"
  }
}
```

**Notes**
- Uses Claude Sonnet 4.5 for personalization
- Analyzes lead's pain points and company info
- Optimal timing suggestions included

---

## 🔍 Lead Discovery

### POST /discover
Discover new leads using AI-powered browser automation.

**Request Body**
```json
{
  "jobTitles": ["VP of Sales", "Director of Marketing"],
  "companySize": "100-500",
  "location": "United States",
  "keywords": ["B2B", "SaaS"],
  "maxResults": 50
}
```

**Response**
```json
{
  "success": true,
  "leads": [
    {
      "name": "Sarah Johnson",
      "title": "VP of Sales",
      "company": "Innovation Inc",
      "email": "sarah@innovation.com",
      "linkedin": "https://linkedin.com/in/sarahjohnson",
      "source": "linkedin",
      "fitScore": 78,
      "intentScore": 65
    }
  ],
  "totalFound": 45,
  "enrichmentComplete": true
}
```

**Notes**
- Uses Hyperbrowser for LinkedIn search
- Gemini for data parsing
- Automatic enrichment and scoring
- Stealth mode enabled by default

---

## 📊 Analytics

### GET /analytics/pipeline
Get pipeline metrics by stage.

**Response**
```json
{
  "pipeline": [
    {
      "status": "new",
      "count": 25,
      "total_value": 750000,
      "avg_score": 45
    },
    {
      "status": "qualified",
      "count": 18,
      "total_value": 900000,
      "avg_score": 82
    },
    {
      "status": "closed_won",
      "count": 5,
      "total_value": 250000,
      "avg_score": 95
    }
  ]
}
```

---

### GET /analytics/summary
Get overall performance summary.

**Response**
```json
{
  "summary": {
    "total_leads": 125,
    "qualified_leads": 48,
    "won_deals": 12,
    "total_revenue": 600000,
    "avg_qualification_score": 73.5,
    "avg_engagement_score": 68.2,
    "recent_activities": 156
  }
}
```

---

## 🔌 WebSocket Events

Connect to `ws://localhost:3001` for real-time updates.

### Events Emitted by Server

**lead:created**
```json
{
  "leadId": "lead_123",
  "name": "John Doe",
  "company": "Example Corp"
}
```

**lead:processed**
```json
{
  "leadId": "lead_123",
  "decision": {
    "decision": "qualify",
    "priority": "high",
    "reasoning": "High engagement score...",
    "nextActions": ["Qualify lead", "Send outreach"]
  }
}
```

**lead:qualified**
```json
{
  "leadId": "lead_123",
  "qualification": {
    "qualificationScore": 85,
    "recommendation": "advance_to_sales"
  }
}
```

---

## 🔐 Authentication

Currently, the API is open for development. In production, implement:

1. **API Key Authentication**
```javascript
headers: {
  'Authorization': 'Bearer YOUR_API_KEY'
}
```

2. **JWT Tokens**
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

---

## ⚠️ Error Responses

All endpoints return errors in this format:

**400 Bad Request**
```json
{
  "error": "Invalid input data",
  "details": "Email is required"
}
```

**404 Not Found**
```json
{
  "error": "Lead not found"
}
```

**500 Internal Server Error**
```json
{
  "error": "Failed to process request",
  "message": "Database connection error"
}
```

---

## 🚀 Rate Limiting

Current limits (development):
- 100 requests per minute per IP
- No API key required

Production recommendations:
- 1000 requests per hour per API key
- Burst limit: 50 requests per second

---

## 📝 Best Practices

### 1. Always Handle Errors
```javascript
try {
  const response = await axios.post('/api/leads', data)
  // Handle success
} catch (error) {
  // Handle error
  console.error(error.response.data)
}
```

### 2. Use Query Parameters for Filtering
```javascript
// Good
GET /api/leads?status=qualified&limit=20

// Avoid
POST /api/leads/filter with body
```

### 3. Implement Pagination
```javascript
const page = 1
const limit = 20
const offset = (page - 1) * limit

const response = await axios.get(`/api/leads?limit=${limit}&offset=${offset}`)
```

### 4. Subscribe to WebSocket Events
```javascript
import io from 'socket.io-client'

const socket = io('http://localhost:3001')

socket.on('lead:qualified', (data) => {
  console.log('Lead qualified:', data)
  // Update UI
})
```

---

## 🛠️ Development Tools

### Testing with cURL

**Create a lead**
```bash
curl -X POST http://localhost:3001/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Lead",
    "email": "test@example.com",
    "company": "Test Corp",
    "title": "VP Sales",
    "source": "api"
  }'
```

**Qualify a lead**
```bash
curl -X POST http://localhost:3001/api/leads/lead_1/qualify
```

### Testing with Postman

Import this collection to get started:
[Download Postman Collection](./postman_collection.json)

---

## 📞 Support

- **Issues**: Create an issue on GitHub
- **Email**: api-support@amrogen.ai
- **Docs**: https://docs.amrogen.ai

---

**API Version**: 1.0.0  
**Last Updated**: November 5, 2025
