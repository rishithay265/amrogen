import { Hyperbrowser } from '@hyperbrowser/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'

const hbClient = new Hyperbrowser({
  apiKey: process.env.HYPERBROWSER_API_KEY || ''
})

const ai = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '')

export interface DiscoveryResult {
  leads: Array<{
    name: string
    title: string
    company: string
    email: string | null
    linkedin: string | null
    source: string
    fitScore: number
    intentScore: number
  }>
  totalFound: number
  enrichmentComplete: boolean
}

export async function discoverLeads(params: {
  jobTitles: string[]
  companySize: string
  location?: string
  keywords?: string[]
  maxResults?: number
}): Promise<DiscoveryResult> {
  const { jobTitles, companySize, location, keywords = [], maxResults = 50 } = params

  console.log('Starting lead discovery:', params)

  try {
    // Use Hyperbrowser to search LinkedIn
    const searchQuery = `
Find potential leads on LinkedIn with:
- Job Titles: ${jobTitles.join(', ')}
- Company Size: ${companySize}
${location ? `- Location: ${location}` : ''}
${keywords.length > 0 ? `- Keywords: ${keywords.join(', ')}` : ''}

Extract name, title, company, and profile URL for up to ${maxResults} leads.
    `

    const result = await hbClient.agents.browserUse.startAndWait({
      task: searchQuery,
      maxSteps: 20,
      sessionOptions: {
        useStealth: true
      }
    })

    if (result.status === 'failed') {
      console.error('Lead discovery failed:', result.error)
      return { leads: [], totalFound: 0, enrichmentComplete: false }
    }

    // Parse the results with Gemini
    const model = ai.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const parsePrompt = `
Parse the following lead discovery results and extract structured data:

${result.data?.finalResult || ''}

Return a JSON array of leads with: name, title, company, email (if available), linkedin (profile URL), source, fitScore (0-100), intentScore (0-100).
    `

    const parseResult = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: parsePrompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json'
      }
    })

    const parsed = JSON.parse(parseResult.response.text())
    const leads = Array.isArray(parsed) ? parsed : parsed.leads || []

    return {
      leads: leads.map((lead: any) => ({
        name: lead.name || 'Unknown',
        title: lead.title || 'Unknown',
        company: lead.company || 'Unknown',
        email: lead.email || null,
        linkedin: lead.linkedin || null,
        source: 'linkedin',
        fitScore: lead.fitScore || 50,
        intentScore: lead.intentScore || 50
      })),
      totalFound: leads.length,
      enrichmentComplete: true
    }
  } catch (error) {
    console.error('Lead discovery error:', error)
    return { leads: [], totalFound: 0, enrichmentComplete: false }
  }
}

export async function enrichCompanyData(domain: string): Promise<any> {
  console.log('Enriching company data for:', domain)
  
  // In production, this would call Clearbit, ZoomInfo, etc.
  // For now, return mock data
  return {
    name: 'Sample Company',
    domain,
    industry: 'Technology',
    employees: 500,
    revenue: 50000000,
    technologies: ['React', 'Node.js', 'PostgreSQL'],
    socialProfiles: {
      linkedin: `https://linkedin.com/company/${domain}`,
      twitter: `https://twitter.com/${domain}`
    }
  }
}
