'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp,
  MessageSquare,
  Clock,
  DollarSign,
  Building2
} from 'lucide-react'
import Link from 'next/link'
import axios from 'axios'
import { formatCurrency, formatDate } from '@/lib/utils'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  title: string
  source: string
  status: string
  qualificationScore: number
  engagementScore: number
  painPoints: string[]
  budget: number | null
  timeline: string | null
  createdAt: string
  updatedAt: string
  tags: string[]
  metadata: any
}

interface Activity {
  id: string
  type: string
  subject: string
  content: string
  outcome: string | null
  sentBy: string
  agentName: string | null
  timestamp: string
}

export default function LeadDetailPage() {
  const params = useParams()
  const [lead, setLead] = useState<Lead | null>(null)
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [qualifying, setQualifying] = useState(false)
  const [generatingOutreach, setGeneratingOutreach] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchLead(params.id as string)
    }
  }, [params.id])

  const fetchLead = async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/api/leads/${id}`)
      setLead(response.data.lead)
      setActivities(response.data.activities)
    } catch (error) {
      console.error('Error fetching lead:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleQualify = async () => {
    if (!lead) return
    setQualifying(true)
    try {
      await axios.post(`${API_URL}/api/leads/${lead.id}/qualify`)
      await fetchLead(lead.id)
    } catch (error) {
      console.error('Error qualifying lead:', error)
    } finally {
      setQualifying(false)
    }
  }

  const handleGenerateOutreach = async () => {
    if (!lead) return
    setGeneratingOutreach(true)
    try {
      const response = await axios.post(`${API_URL}/api/leads/${lead.id}/outreach`, {
        sequenceType: 'cold_outreach'
      })
      console.log('Outreach sequence generated:', response.data)
      alert('Outreach sequence generated successfully!')
    } catch (error) {
      console.error('Error generating outreach:', error)
    } finally {
      setGeneratingOutreach(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading lead details...</p>
        </div>
      </div>
    )
  }

  if (!lead) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Lead not found</p>
          <Link href="/leads">
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, any> = {
      email: Mail,
      call: Phone,
      meeting: Calendar,
      linkedin_message: MessageSquare,
      note: MessageSquare
    }
    const Icon = icons[type] || MessageSquare
    return <Icon className="h-4 w-4" />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AmroGen
              </h1>
            </Link>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <Link href="/leads">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Leads
            </Button>
          </Link>
        </div>

        {/* Lead Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-3xl">{lead.name}</CardTitle>
                  <Badge variant="secondary" className="text-sm">
                    {lead.status.replace('_', ' ')}
                  </Badge>
                  {lead.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <CardDescription className="text-lg">
                  {lead.title} at {lead.company}
                </CardDescription>
                <div className="flex items-center gap-6 text-sm text-muted-foreground pt-2">
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {lead.email}
                  </span>
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Source: {lead.source}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Added: {formatDate(lead.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleQualify}
                  disabled={qualifying}
                  className="bg-gradient-to-r from-green-600 to-emerald-600"
                >
                  {qualifying ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Qualifying...
                    </>
                  ) : (
                    <>
                      <Target className="mr-2 h-4 w-4" />
                      Qualify Lead
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerateOutreach}
                  disabled={generatingOutreach}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600"
                >
                  {generatingOutreach ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Generate Outreach
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="activity">Activity ({activities.length})</TabsTrigger>
                <TabsTrigger value="qualification">Qualification</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Pain Points */}
                {lead.painPoints.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Pain Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {lead.painPoints.map((pain, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                            <p className="text-sm">{pain}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Budget & Timeline */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Deal Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Budget</span>
                      <span className="font-semibold">
                        {lead.budget ? formatCurrency(lead.budget) : 'Not specified'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Timeline</span>
                      <span className="font-semibold">{lead.timeline || 'Not specified'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Last Updated</span>
                      <span className="font-semibold">{formatDate(lead.updatedAt)}</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {activities.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6 text-center text-muted-foreground">
                      No activities yet
                    </CardContent>
                  </Card>
                ) : (
                  activities.map((activity) => (
                    <Card key={activity.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getActivityIcon(activity.type)}
                            <CardTitle className="text-base">{activity.subject}</CardTitle>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(activity.timestamp)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant="outline">{activity.type}</Badge>
                          <Badge variant="secondary">
                            {activity.sentBy === 'agent' ? `AI: ${activity.agentName}` : 'Human'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {activity.content}
                        </p>
                        {activity.outcome && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm">
                              <span className="font-medium">Outcome:</span> {activity.outcome}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="qualification">
                {lead.metadata?.qualification ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>MEDDIC Qualification</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">Recommendation</h4>
                        <Badge variant="success" className="text-sm">
                          {lead.metadata.qualification.recommendation.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      {lead.metadata.qualification.identifyPain.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Pain Analysis</h4>
                          <div className="space-y-2">
                            {lead.metadata.qualification.identifyPain.map((pain: any, idx: number) => (
                              <div key={idx} className="p-3 rounded-lg border bg-muted/50">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium">{pain.painPoint}</span>
                                  <Badge
                                    variant={
                                      pain.severity === 'critical' ? 'destructive' :
                                      pain.severity === 'high' ? 'warning' :
                                      'secondary'
                                    }
                                  >
                                    {pain.severity}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{pain.impact}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground mb-4">
                        This lead hasn't been qualified yet
                      </p>
                      <Button onClick={handleQualify} disabled={qualifying}>
                        {qualifying ? 'Qualifying...' : 'Qualify Now'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Scores */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Qualification Score</span>
                    <span className="text-2xl font-bold">{lead.qualificationScore}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${lead.qualificationScore}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Engagement Score</span>
                    <span className="text-2xl font-bold">{lead.engagementScore}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                      style={{ width: `${lead.engagementScore}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">AI Agent Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleQualify}>
                  <Target className="mr-2 h-4 w-4" />
                  Re-qualify Lead
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleGenerateOutreach}>
                  <Mail className="mr-2 h-4 w-4" />
                  Generate Sequence
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Analyze Sentiment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
