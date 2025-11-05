'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Search, 
  Filter,
  Plus,
  Mail,
  Phone,
  Calendar,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp
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
  tags: string[]
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showNewLeadForm, setShowNewLeadForm] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  useEffect(() => {
    filterLeads()
  }, [searchQuery, statusFilter, leads])

  const fetchLeads = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/leads`)
      setLeads(response.data.leads)
      setFilteredLeads(response.data.leads)
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterLeads = () => {
    let filtered = [...leads]

    if (searchQuery) {
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: 'default',
      contacted: 'secondary',
      qualified: 'success',
      proposal: 'warning',
      negotiation: 'warning',
      closed_won: 'success',
      closed_lost: 'destructive'
    }
    return colors[status] || 'default'
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
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
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link href="/campaigns">
                <Button variant="ghost">Campaigns</Button>
              </Link>
              <Link href="/analytics">
                <Button variant="ghost">Analytics</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Leads</h2>
            <p className="text-muted-foreground">
              Manage and track all your leads
            </p>
          </div>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setShowNewLeadForm(!showNewLeadForm)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Search by name, company, or email..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-48">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className="w-full h-9 px-3 rounded-md border border-input bg-transparent text-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed_won">Closed Won</option>
                  <option value="closed_lost">Closed Lost</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredLeads.length} Lead{filteredLeads.length !== 1 ? 's' : ''}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLeads.map((lead) => (
                <Link key={lead.id} href={`/leads/${lead.id}`}>
                  <div className="p-6 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{lead.name}</h3>
                          <Badge variant={getStatusColor(lead.status) as any}>
                            {lead.status.replace('_', ' ')}
                          </Badge>
                          {lead.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {lead.email}
                          </span>
                          <span>@ {lead.company}</span>
                          <span>{lead.title}</span>
                        </div>

                        {lead.painPoints.length > 0 && (
                          <div className="flex gap-2 flex-wrap">
                            {lead.painPoints.slice(0, 3).map((pain, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {pain}
                              </Badge>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center gap-6 text-xs text-muted-foreground">
                          <span>Source: {lead.source}</span>
                          <span>Added: {formatDate(lead.createdAt)}</span>
                          {lead.timeline && <span>Timeline: {lead.timeline}</span>}
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Qualification</div>
                          <div className={`text-2xl font-bold ${getScoreColor(lead.qualificationScore)}`}>
                            {lead.qualificationScore}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Engagement</div>
                          <div className={`text-xl font-semibold ${getScoreColor(lead.engagementScore)}`}>
                            {lead.engagementScore}
                          </div>
                        </div>
                        {lead.budget && (
                          <div className="text-sm font-medium text-green-600 mt-2">
                            {formatCurrency(lead.budget)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
