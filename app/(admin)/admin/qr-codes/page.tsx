'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  QrCode,
  Search,
  Filter,
  Download,
  ExternalLink,
  Calendar,
  Eye,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  BarChart3,
  Users,
  CheckCircle2,
  RefreshCw,
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

interface QRCode {
  id: string
  event_id: string
  short_code: string
  code_url: string
  scans_count: number
  unique_scans_count: number
  created_at: string
  event?: {
    title: string
    type: string
    location: string
    operator?: {
      business_name: string
    }
  }
}

interface QRStats {
  total_qr_codes: number
  total_scans: number
  total_unique_scans: number
  avg_conversion_rate: number
}

export default function AdminQRCodesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [regenerateQRId, setRegenerateQRId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  // Fetch QR codes
  const { data: qrCodes = [], isLoading } = useQuery<QRCode[]>({
    queryKey: ['admin-qr-codes', searchQuery, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (typeFilter !== 'all') params.append('type', typeFilter)
      
      const res = await fetch(`/api/admin/qr-codes?${params}`)
      if (!res.ok) throw new Error('Failed to fetch QR codes')
      return res.json()
    },
  })

  // Fetch stats
  const { data: stats } = useQuery<QRStats>({
    queryKey: ['admin-qr-codes-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/qr-codes/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
  })

  // Regenerate QR code mutation
  const regenerateMutation = useMutation({
    mutationFn: async (qrId: string) => {
      const res = await fetch(`/api/admin/qr-codes/${qrId}/regenerate`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to regenerate QR code')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-qr-codes'] })
      setRegenerateQRId(null)
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
        return '🔲'
    }
  }

  const calculateConversionRate = (qr: QRCode) => {
    if (qr.scans_count === 0) return 0
    // TODO: Get actual review count from database
    // For now, estimate based on unique scans
    const estimatedReviews = Math.floor(qr.unique_scans_count * 0.3)
    return Math.round((estimatedReviews / qr.unique_scans_count) * 100)
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
            QR Codes & Analytics
          </h1>
          <p className="text-gray-600 mt-1">
            Track QR code performance and conversion metrics
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
                <QrCode className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-blue-100 text-sm font-medium">Total QR Codes</p>
                <p className="text-4xl font-bold">{stats?.total_qr_codes || 0}</p>
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
                <Eye className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-emerald-100 text-sm font-medium">Total Scans</p>
                <p className="text-4xl font-bold">{stats?.total_scans || 0}</p>
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
                <Users className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-amber-100 text-sm font-medium">Unique Scans</p>
                <p className="text-4xl font-bold">{stats?.total_unique_scans || 0}</p>
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
                <BarChart3 className="w-10 h-10 opacity-80" />
                <TrendingUp className="w-5 h-5 opacity-60" />
              </div>
              <div className="space-y-1">
                <p className="text-purple-100 text-sm font-medium">Avg Conversion</p>
                <p className="text-4xl font-bold">{stats?.avg_conversion_rate || 0}%</p>
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
                  placeholder="Search by event title or short code..."
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

      {/* QR Codes List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              All QR Codes ({qrCodes.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500">
                Loading QR codes...
              </div>
            ) : qrCodes.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <QrCode className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>No QR codes found</p>
              </div>
            ) : (
              <div className="divide-y">
                {qrCodes.map((qr, index) => (
                  <motion.div
                    key={qr.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      {/* QR Code Icon */}
                      <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-3xl flex-shrink-0">
                        {qr.event ? getTypeIcon(qr.event.type) : '🔲'}
                      </div>

                      {/* QR Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              {qr.event?.title || 'Unknown Event'}
                              {qr.event && (
                                <Badge className={getTypeColor(qr.event.type)}>
                                  {qr.event.type}
                                </Badge>
                              )}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Code: <span className="font-mono font-bold">{qr.short_code}</span>
                            </p>
                            {qr.event?.operator && (
                              <p className="text-sm text-gray-500 mt-1">
                                {qr.event.operator.business_name}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(qr.code_url, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRegenerateQRId(qr.id)}
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700">
                            <Eye className="w-4 h-4" />
                            <span className="font-semibold">{qr.scans_count}</span>
                            <span className="text-blue-600">scans</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                            <Users className="w-4 h-4" />
                            <span className="font-semibold">{qr.unique_scans_count}</span>
                            <span className="text-emerald-600">unique</span>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="font-semibold">{calculateConversionRate(qr)}%</span>
                            <span className="text-purple-600">conversion</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {new Date(qr.created_at).toLocaleDateString()}
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

      {/* Regenerate Confirmation Dialog */}
      <AnimatePresence>
        {regenerateQRId && (
          <Dialog open={!!regenerateQRId} onOpenChange={() => setRegenerateQRId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Regenerate QR Code</DialogTitle>
                <DialogDescription>
                  Are you sure you want to regenerate this QR code? The old QR code will stop working.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setRegenerateQRId(null)}
                  disabled={regenerateMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => regenerateMutation.mutate(regenerateQRId)}
                  disabled={regenerateMutation.isPending}
                >
                  {regenerateMutation.isPending ? 'Regenerating...' : 'Regenerate'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}
