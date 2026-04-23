'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Sparkles,
  Shield,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Download,
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

interface ActivityLog {
  id: string
  admin_email: string
  action: string
  resource_type: string
  resource_id: string | null
  details: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

interface ActivityStats {
  total_actions: number
  actions_today: number
  unique_admins: number
  by_action_type: {
    create: number
    update: number
    delete: number
    view: number
  }
}

export default function AdminActivityPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [resourceFilter, setResourceFilter] = useState<string>('all')

  // Fetch activity logs
  const { data: logs = [], isLoading } = useQuery<ActivityLog[]>({
    queryKey: ['admin-activity-logs', searchQuery, actionFilter, resourceFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (actionFilter !== 'all') params.append('action', actionFilter)
      if (resourceFilter !== 'all') params.append('resource', resourceFilter)
      
      const res = await fetch(`/api/admin/activity?${params}`)
      if (!res.ok) throw new Error('Failed to fetch activity logs')
      return res.json()
    },
  })

  // Fetch stats
  const { data: stats } = useQuery<ActivityStats>({
    queryKey: ['admin-activity-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/activity/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  })

  const getActionIcon = (action: string) => {
    if (action.includes('create')) return <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    if (action.includes('update')) return <FileText className="w-4 h-4 text-blue-600" />
    if (action.includes('delete')) return <XCircle className="w-4 h-4 text-red-600" />
    if (action.includes('view')) return <Activity className="w-4 h-4 text-gray-600" />
    return <AlertCircle className="w-4 h-4 text-amber-600" />
  }

  const getActionColor = (action: string) => {
    if (action.includes('create')) return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
    if (action.includes('update')) return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
    if (action.includes('delete')) return 'bg-red-500/10 text-red-700 border-red-500/20'
    if (action.includes('view')) return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
  }

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'operator':
        return 'bg-purple-500/10 text-purple-700 border-purple-500/20'
      case 'event':
        return 'bg-blue-500/10 text-blue-700 border-blue-500/20'
      case 'review':
        return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20'
      case 'wrap':
        return 'bg-amber-500/10 text-amber-700 border-amber-500/20'
      case 'qr_code':
        return 'bg-pink-500/10 text-pink-700 border-pink-500/20'
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-500/20'
    }
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
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
            Activity Logs
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor admin actions and audit trail
          </p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
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
                <Activity className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">Total Actions</p>
                <p className="text-4xl font-bold">{stats?.total_actions || 0}</p>
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
                <Clock className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-emerald-100 text-sm font-medium">Today</p>
                <p className="text-4xl font-bold">{stats?.actions_today || 0}</p>
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
                <Shield className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-medium">Active Admins</p>
                <p className="text-4xl font-bold">{stats?.unique_admins || 0}</p>
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
                <FileText className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-purple-100 text-sm font-medium">Updates</p>
                <p className="text-4xl font-bold">{stats?.by_action_type.update || 0}</p>
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
                  placeholder="Search by admin email or resource..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Action Filter */}
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="create">✅ Create</SelectItem>
                  <SelectItem value="update">📝 Update</SelectItem>
                  <SelectItem value="delete">❌ Delete</SelectItem>
                  <SelectItem value="view">👁️ View</SelectItem>
                </SelectContent>
              </Select>

              {/* Resource Filter */}
              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  <SelectItem value="operator">Operators</SelectItem>
                  <SelectItem value="event">Events</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="wrap">Wraps</SelectItem>
                  <SelectItem value="qr_code">QR Codes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Activity Logs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline ({logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">
                Loading activity logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No activity logs found</p>
                <p className="text-sm mt-2">Activity logs will appear here as admins perform actions</p>
              </div>
            ) : (
              <div className="divide-y">
                {logs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center flex-shrink-0">
                        {getActionIcon(log.action)}
                      </div>

                      {/* Log Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2 flex-wrap">
                              <Badge className={getActionColor(log.action)}>
                                {log.action}
                              </Badge>
                              <Badge className={getResourceColor(log.resource_type)}>
                                {log.resource_type}
                              </Badge>
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              by <span className="font-medium">{log.admin_email}</span>
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="w-4 h-4" />
                            {formatTimeAgo(log.created_at)}
                          </div>
                        </div>

                        {/* Details */}
                        {log.details && Object.keys(log.details).length > 0 && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 mb-2">Details:</p>
                            <pre className="text-xs text-gray-600 overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-3">
                          {log.ip_address && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">IP:</span>
                              {log.ip_address}
                            </div>
                          )}
                          {log.resource_id && (
                            <div className="flex items-center gap-1">
                              <span className="font-medium">ID:</span>
                              <code className="bg-gray-100 px-1 rounded">{log.resource_id.slice(0, 8)}...</code>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.created_at).toLocaleString()}
                          </div>
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
