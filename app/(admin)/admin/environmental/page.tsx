'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Trees,
  MapPin,
  Award,
  TrendingUp,
  Sparkles,
  Leaf,
  Globe,
  CheckCircle2,
  Clock,
  Calendar,
  Download,
  ExternalLink,
  Search,
  Filter,
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

interface TreeActivity {
  id: string
  event_id: string
  trees_planted: number
  planting_date: string
  co2_offset_kg: number
  certificate_url: string | null
  created_at: string
  event?: {
    title: string
    type: string
    location: string
    operator?: {
      business_name: string
    }
  }
  gps_locations?: Array<{
    id: string
    latitude: number
    longitude: number
    location_name: string
    verified: boolean
  }>
}

interface EnvironmentalStats {
  total_trees_planted: number
  total_events: number
  total_co2_offset_kg: number
  verified_locations: number
  pending_verification: number
}

export default function AdminEnvironmentalPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Fetch tree activities
  const { data: activities = [], isLoading } = useQuery<TreeActivity[]>({
    queryKey: ['admin-tree-activities', searchQuery, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const res = await fetch(`/api/admin/environmental/tree-activities?${params}`)
      if (!res.ok) throw new Error('Failed to fetch tree activities')
      return res.json()
    },
  })

  // Fetch stats
  const { data: stats } = useQuery<EnvironmentalStats>({
    queryKey: ['admin-environmental-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/environmental/stats')
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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'safari':
        return '🦁'
      case 'marathon':
        return '🏃'
      case 'tour':
        return '🗺️'
      default:
        return '🌍'
    }
  }

  const formatCO2 = (kg: number) => {
    if (kg >= 1000) {
      return `${(kg / 1000).toFixed(1)} tonnes`
    }
    return `${kg.toLocaleString()} kg`
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
            Environmental Impact
          </h1>
          <p className="text-gray-600 mt-1">
            Track tree planting, GPS verification, and carbon offset
          </p>
        </div>
        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700">
          <ExternalLink className="w-4 h-4 mr-2" />
          Green Manjaro
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Trees className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-emerald-100 text-sm font-medium">Trees Planted</p>
                <p className="text-4xl font-bold">{stats?.total_trees_planted || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Globe className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">Events</p>
                <p className="text-4xl font-bold">{stats?.total_events || 0}</p>
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
                <Leaf className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-medium">CO₂ Offset</p>
                <p className="text-2xl font-bold">{formatCO2(stats?.total_co2_offset_kg || 0)}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <CheckCircle2 className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-green-100 text-sm font-medium">Verified</p>
                <p className="text-4xl font-bold">{stats?.verified_locations || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 border-none text-white shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Clock className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-orange-100 text-sm font-medium">Pending</p>
                <p className="text-4xl font-bold">{stats?.pending_verification || 0}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by event title or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">✓ Verified</SelectItem>
                  <SelectItem value="pending">⏳ Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tree Activities List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
            <CardTitle className="flex items-center gap-2">
              <Trees className="w-5 h-5" />
              Tree Planting Activities ({activities.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">
                Loading tree activities...
              </div>
            ) : activities.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Trees className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No tree activities found</p>
              </div>
            ) : (
              <div className="divide-y">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-emerald-500/10 to-green-500/10 flex items-center justify-center text-3xl flex-shrink-0">
                        {activity.event ? getTypeIcon(activity.event.type) : '🌳'}
                      </div>

                      {/* Activity Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {activity.event?.title || 'Unknown Event'}
                              {activity.event && (
                                <Badge className={getTypeColor(activity.event.type)}>
                                  {activity.event.type}
                                </Badge>
                              )}
                            </h3>
                            {activity.event?.operator && (
                              <p className="text-sm text-gray-600 mt-1">
                                {activity.event.operator.business_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {activity.certificate_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(activity.certificate_url!, '_blank')}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Certificate
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                            <Trees className="w-4 h-4" />
                            <span className="font-semibold">{activity.trees_planted}</span>
                            <span className="text-emerald-600">trees</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                            <Leaf className="w-4 h-4" />
                            <span className="font-semibold">{formatCO2(activity.co2_offset_kg)}</span>
                            <span className="text-blue-600">CO₂</span>
                          </div>
                          {activity.gps_locations && activity.gps_locations.length > 0 && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                              <MapPin className="w-4 h-4" />
                              <span className="font-semibold">{activity.gps_locations.length}</span>
                              <span className="text-purple-600">locations</span>
                            </div>
                          )}
                          {activity.gps_locations?.some(loc => loc.verified) && (
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-50 text-green-700">
                              <CheckCircle2 className="w-4 h-4" />
                              <span className="text-green-600">Verified</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(activity.planting_date).toLocaleDateString()}
                          </div>
                        </div>

                        {/* GPS Locations */}
                        {activity.gps_locations && activity.gps_locations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-sm font-medium text-gray-700 mb-2">GPS Locations:</p>
                            <div className="flex flex-wrap gap-2">
                              {activity.gps_locations.map((loc) => (
                                <Badge
                                  key={loc.id}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {loc.location_name}
                                  {loc.verified && <CheckCircle2 className="w-3 h-3 ml-1 text-green-600" />}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
