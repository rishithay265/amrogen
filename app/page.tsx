'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  Target, 
  TrendingUp, 
  DollarSign, 
  Activity, 
  Mail, 
  Phone,
  Calendar,
  ArrowUpRight,
  Sparkles,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Summary {
  total_leads: number
  qualified_leads: number
  won_deals: number
  total_revenue: number
  avg_qualification_score: number
  avg_engagement_score: number
  recent_activities: number
}

interface Lead {
  id: string
  name: string
  company: string
  status: string
  qualificationScore: number
  budget: number
  createdAt: string
}

interface PipelineStage {
  status: string
  count: number
  total_value: number
  avg_score: number
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [pipeline, setPipeline] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [summaryRes, leadsRes, pipelineRes] = await Promise.all([
        axios.get(`${API_URL}/api/analytics/summary`),
        axios.get(`${API_URL}/api/leads?limit=5`),
        axios.get(`${API_URL}/api/analytics/pipeline`)
      ])

      setSummary(summaryRes.data.summary)
      setRecentLeads(leadsRes.data.leads)
      setPipeline(pipelineRes.data.pipeline)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const conversionRate = summary 
    ? Math.round((summary.won_deals / Math.max(summary.total_leads, 1)) * 100)
    : 0

  const qualificationRate = summary
    ? Math.round((summary.qualified_leads / Math.max(summary.total_leads, 1)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AmroGen
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/leads">
                <Button variant="ghost">Leads</Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="ghost">Campaigns</Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost">Analytics</Button>
              </Link>
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <Target className="mr-2 h-4 w-4" />
                Discover Leads
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Sales Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor your AI agents' performance and pipeline health
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary ? formatNumber(summary.total_leads) : '...'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">+{summary?.recent_activities || 0}</span> this week
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary ? formatNumber(summary.qualified_leads) : '...'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">{qualificationRate}%</span> qualification rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Won Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{summary ? formatNumber(summary.won_deals) : '...'}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-green-600 font-medium">{conversionRate}%</span> conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summary ? formatCurrency(Number(summary.total_revenue)) : '...'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From closed deals
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          {/* Pipeline Overview */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Pipeline Overview
              </CardTitle>
              <CardDescription>Lead distribution across stages</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pipeline}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Lead Quality Distribution */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Lead Quality Distribution
              </CardTitle>
              <CardDescription>By qualification score</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pipeline}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.status}: ${entry.count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {pipeline.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Leads */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Leads</CardTitle>
                <CardDescription>Latest leads processed by AI agents</CardDescription>
              </div>
              <Link href="/leads">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">{lead.company}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={lead.status === 'qualified' ? 'success' : 'secondary'}>
                      {lead.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">Score: {lead.qualificationScore}</p>
                      <p className="text-xs text-muted-foreground">
                        {lead.budget ? formatCurrency(lead.budget) : 'No budget'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="mt-8 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Agent Performance
            </CardTitle>
            <CardDescription>Real-time activity from autonomous agents</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="orchestrator" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="orchestrator">Orchestrator</TabsTrigger>
                <TabsTrigger value="discovery">Discovery</TabsTrigger>
                <TabsTrigger value="qualification">Qualification</TabsTrigger>
                <TabsTrigger value="outreach">Outreach</TabsTrigger>
                <TabsTrigger value="followup">Follow-up</TabsTrigger>
              </TabsList>
              <TabsContent value="orchestrator" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Leads Processed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.total_leads || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Decision Accuracy</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">94%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Response Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">2.3s</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="discovery" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Leads Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">847</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Fit Score Avg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">76%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Intent Score Avg</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">68%</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="qualification" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Qualified</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{summary?.qualified_leads || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Accuracy Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">92%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {summary?.avg_qualification_score || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="outreach" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Messages Sent</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,234</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Response Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">28%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Open Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">67%</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="followup" className="space-y-4 mt-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Sequences</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">89</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Re-engagement Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">34%</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Follow-ups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">4.2</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
