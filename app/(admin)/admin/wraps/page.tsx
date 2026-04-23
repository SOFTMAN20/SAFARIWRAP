'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Eye,
  Share2,
  Trash2,
  Search,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  User,
  MapPin,
  Sparkles,
  TrendingUp,
  FileText,
  Image as ImageIcon,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Wrap {
  id: string
  guest_name: string
  wrap_url: string | null
  data: any
  event_id: string
  created_at: string
  event?: {
    title: string
    type: string
    location: string
  }
}

interface WrapStats {
  total_wraps: number
  wraps_by_type: {
    safari: number
    marathon: number
    tour: number
  }
  avg_shares: number
  most_viewed: number
}

export default function AdminWrapsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [deleteWrapId, setDeleteWrapId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch wraps
  const { data: wraps = [], isLoading } = useQuery<Wrap[]>({
    queryKey: ['admin-wraps', searchQuery, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      
      const res = await fetch(`/api/admin/wraps?${params}`)
      if (!res.ok) throw new Error('Failed to fetch wraps')
      return res.json()
    },
  })

  // Fetch stats
  const { data: stats } = useQuery<WrapStats>({
    queryKey: ['admin-wraps-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/wraps/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  })

  // Delete wrap mutation
  const deleteMutation = useMutation({
    mutationFn: async (wrapId: string) => {
      const res = await fetch(`/api/admin/wraps/${wrapId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete wrap')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wraps'] })
      queryClient.invalidateQueries({ queryKey: ['admin-wraps-stats'] })
      setDeleteWrapId(null)
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
        return '📱'
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
            Wraps Management
          </h1>
          <p className="text-gray-600 mt-1">
            Monitor content quality, engagement, and sharing
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
                <FileText className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">Total Wraps</p>
                <p className="text-4xl font-bold">{stats?.total_wraps || 0}</p>
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
                <p className="text-emerald-100 text-sm font-medium">Safari Wraps</p>
                <p className="text-4xl font-bold">{stats?.wraps_by_type.safari || 0}</p>
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
                <Share2 className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-medium">Avg Shares</p>
                <p className="text-4xl font-bold">{stats?.avg_shares || 0}</p>
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
                <Eye className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-purple-100 text-sm font-medium">Most Viewed</p>
                <p className="text-4xl font-bold">{stats?.most_viewed || 0}</p>
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
                  placeholder="Search by guest name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="safari">🦁 Safari</SelectItem>
                  <SelectItem value="marathon">🏃 Marathon</SelectItem>
                  <SelectItem value="tour">🗺️ Tour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Wraps List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              All Wraps ({wraps.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">
                Loading wraps...
              </div>
            ) : wraps.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No wraps found</p>
              </div>
            ) : (
              <div className="divide-y">
                {wraps.map((wrap, index) => (
                  <motion.div
                    key={wrap.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* Wrap Preview */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl flex-shrink-0">
                        {wrap.event ? getTypeIcon(wrap.event.type) : '📱'}
                      </div>

                      {/* Wrap Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {wrap.guest_name}
                              {wrap.event && (
                                <Badge className={getTypeColor(wrap.event.type)}>
                                  {wrap.event.type}
                                </Badge>
                              )}
                            </h3>
                            {wrap.event && (
                              <p className="text-sm text-gray-600 mt-1">
                                {wrap.event.title}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {wrap.wrap_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => window.open(wrap.wrap_url!, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setDeleteWrapId(wrap.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          {wrap.event && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {wrap.event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(wrap.created_at).toLocaleDateString()}
                          </div>
                          {wrap.data?.photos && (
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" />
                              Has photos
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

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {deleteWrapId && (
          <Dialog open={!!deleteWrapId} onOpenChange={() => setDeleteWrapId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Wrap</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete this wrap? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDeleteWrapId(null)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate(deleteWrapId)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
