'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Calendar,
  Search,
  Filter,
  MapPin,
  Users,
  MessageSquare,
  QrCode as QrCodeIcon,
  TrendingUp,
  Sparkles,
  Eye,
  ExternalLink,
  Edit,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Event {
  id: string
  title: string
  type: 'safari' | 'marathon' | 'tour'
  location: string
  start_date: string
  end_date: string
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  created_at: string
  operator?: {
    business_name: string
  }
  reviews_count?: number
  qr_codes_count?: number
  wraps_count?: number
}

interface EventStats {
  total_events: number
  by_type: {
    safari: number
    marathon: number
    tour: number
  }
  by_status: {
    upcoming: number
    active: number
    completed: number
    cancelled: number
  }
}

export default function AdminEventsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch events
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['admin-events', searchQuery, typeFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const res = await fetch(`/api/admin/events?${params}`)
      if (!res.ok) throw new Error('Failed to fetch events')
      return res.json()
    },
  })

  // Fetch stats
  const { data: stats } = useQuery<EventStats>({
    queryKey: ['admin-events-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/events/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'safari':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'marathon':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'tour':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'active':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'completed':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'cancelled':
        return 'bg-red-500/10 text-red-700 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safari':
        return '🦁'
      case 'marathon':
        return '🏃'
      case 'tour':
        return '🗺️'
      default:
        return '📅'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            Events Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage events across all verticals (Safari, Marathon, Tour)
          </p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Calendar className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">Total Events</p>
                <p className="text-4xl font-bold">{stats?.total_events || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">🦁</span>
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-emerald-100 text-sm font-medium">Safari Events</p>
                <p className="text-4xl font-bold">{stats?.by_type.safari || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">🏃</span>
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-medium">Marathon Events</p>
                <p className="text-4xl font-bold">{stats?.by_type.marathon || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-4xl">🗺️</span>
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-purple-100 text-sm font-medium">Tour Events</p>
                <p className="text-4xl font-bold">{stats?.by_type.tour || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by title, location, or operator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="safari">🦁 Safari</SelectItem>
                  <SelectItem value="marathon">🏃 Marathon</SelectItem>
                  <SelectItem value="tour">🗺️ Tour</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">⏳ Upcoming</SelectItem>
                  <SelectItem value="active">🔵 Active</SelectItem>
                  <SelectItem value="completed">✅ Completed</SelectItem>
                  <SelectItem value="cancelled">❌ Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Events List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              All Events ({events.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">
                Loading events...
              </div>
            ) : events.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No events found</p>
              </div>
            ) : (
              <div className="divide-y">
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Event Icon */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl flex-shrink-0">
                        {getTypeIcon(event.type)}
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                              {event.title}
                              <Badge className={getTypeColor(event.type)}>
                                {event.type}
                              </Badge>
                              <Badge className={getStatusColor(event.status)}>
                                {event.status}
                              </Badge>
                            </h3>
                            {event.operator && (
                              <p className="text-sm text-gray-600 mt-1">
                                {event.operator.business_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/admin/events/${event.id}`, '_blank')}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          {event.reviews_count !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                              <MessageSquare className="w-4 h-4" />
                              <span className="font-semibold">{event.reviews_count}</span>
                              <span className="text-blue-600">reviews</span>
                            </div>
                          )}
                          {event.qr_codes_count !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                              <QrCodeIcon className="w-4 h-4" />
                              <span className="font-semibold">{event.qr_codes_count}</span>
                              <span className="text-purple-600">QR codes</span>
                            </div>
                          )}
                          {event.wraps_count !== undefined && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                              <Users className="w-4 h-4" />
                              <span className="font-semibold">{event.wraps_count}</span>
                              <span className="text-emerald-600">wraps</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
