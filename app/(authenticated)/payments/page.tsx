'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Download,
  Filter,
  Search,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Mock payments data
const mockPayments = {
  overview: {
    totalRevenue: 47850,
    monthlyRevenue: 12400,
    pendingPayments: 3200,
    completedPayments: 44650,
    revenueChange: 18.5,
    paymentsChange: 12.3,
  },
  recentPayments: [
    {
      id: 'PAY-001',
      eventName: 'Serengeti Wildlife Safari',
      guestName: 'Emma Wilson',
      amount: 1500,
      status: 'completed',
      date: '2026-04-14',
      method: 'Credit Card',
      transactionId: 'TXN-789123'
    },
    {
      id: 'PAY-002',
      eventName: 'Ngorongoro Crater Tour',
      guestName: 'John Smith',
      amount: 1200,
      status: 'pending',
      date: '2026-04-13',
      method: 'Bank Transfer',
      transactionId: 'TXN-789124'
    },
    {
      id: 'PAY-003',
      eventName: 'Masai Mara Adventure',
      guestName: 'Sarah Johnson',
      amount: 1800,
      status: 'completed',
      date: '2026-04-12',
      method: 'PayPal',
      transactionId: 'TXN-789125'
    },
    {
      id: 'PAY-004',
      eventName: 'Tarangire Safari',
      guestName: 'Michael Brown',
      amount: 900,
      status: 'failed',
      date: '2026-04-11',
      method: 'Credit Card',
      transactionId: 'TXN-789126'
    },
    {
      id: 'PAY-005',
      eventName: 'Lake Manyara Tour',
      guestName: 'Lisa Anderson',
      amount: 1100,
      status: 'completed',
      date: '2026-04-10',
      method: 'Credit Card',
      transactionId: 'TXN-789127'
    },
    {
      id: 'PAY-006',
      eventName: 'Amboseli Safari',
      guestName: 'David Wilson',
      amount: 1600,
      status: 'pending',
      date: '2026-04-09',
      method: 'Bank Transfer',
      transactionId: 'TXN-789128'
    },
  ],
  monthlyData: [
    { month: 'Oct', revenue: 8500, payments: 12 },
    { month: 'Nov', revenue: 12200, payments: 18 },
    { month: 'Dec', revenue: 15800, payments: 22 },
    { month: 'Jan', revenue: 9400, payments: 14 },
    { month: 'Feb', revenue: 7600, payments: 11 },
    { month: 'Mar', revenue: 13200, payments: 19 },
    { month: 'Apr', revenue: 12400, payments: 17 },
  ]
};

export default function PaymentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  const filteredPayments = mockPayments.recentPayments.filter(payment => {
    const matchesSearch = payment.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.transactionId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-amber-100 text-amber-800 border-amber-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-parchment to-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-forest mb-2">
              Payments
            </h1>
            <p className="text-lg text-stone">
              Track revenue and manage payment transactions
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 3 months</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </motion.div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <RevenueCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Total Revenue"
            value={mockPayments.overview.totalRevenue}
            change={mockPayments.overview.revenueChange}
            trend="up"
            color="text-forest"
            bgColor="bg-forest/10"
            delay={0}
            isCurrency={true}
          />
          <RevenueCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="This Month"
            value={mockPayments.overview.monthlyRevenue}
            change={mockPayments.overview.paymentsChange}
            trend="up"
            color="text-blue-600"
            bgColor="bg-blue-100"
            delay={0.1}
            isCurrency={true}
          />
          <RevenueCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending"
            value={mockPayments.overview.pendingPayments}
            change={-5.2}
            trend="down"
            color="text-amber-600"
            bgColor="bg-amber-100"
            delay={0.2}
            isCurrency={true}
          />
          <RevenueCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            label="Completed"
            value={mockPayments.overview.completedPayments}
            change={15.8}
            trend="up"
            color="text-green-600"
            bgColor="bg-green-100"
            delay={0.3}
            isCurrency={true}
          />
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-forest" />
                Revenue Trend
              </CardTitle>
              <CardDescription>
                Monthly revenue over the last 7 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <RevenueChart data={mockPayments.monthlyData} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payments Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Recent Payments</CardTitle>
                  <CardDescription>
                    Track all payment transactions
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPayments.map((payment, i) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-parchment/30 hover:bg-parchment/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center shadow-sm">
                        {getStatusIcon(payment.status)}
                      </div>
                      <div>
                        <p className="font-bold text-ink">{payment.guestName}</p>
                        <p className="text-sm text-stone">{payment.eventName}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-stone flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(payment.date).toLocaleDateString()}
                          </span>
                          <span className="text-xs text-stone">
                            {payment.method}
                          </span>
                          <span className="text-xs text-stone font-mono">
                            {payment.transactionId}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-black text-ink">
                          ${payment.amount.toLocaleString()}
                        </p>
                        <Badge className={`text-xs ${getStatusBadge(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="w-4 h-4 mr-2" />
                            Download Receipt
                          </DropdownMenuItem>
                          {payment.status === 'failed' && (
                            <DropdownMenuItem>
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Retry Payment
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {filteredPayments.length === 0 && (
                <div className="text-center py-12">
                  <CreditCard className="w-16 h-16 text-stone/30 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-ink mb-2">No payments found</h3>
                  <p className="text-stone">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Helper Components
interface RevenueCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down';
  color: string;
  bgColor: string;
  delay: number;
  isCurrency?: boolean;
}

function RevenueCard({ icon, label, value, change, trend, color, bgColor, delay, isCurrency }: RevenueCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center ${color}`}>
              {icon}
            </div>
            <div className={`flex items-center gap-1 text-sm font-bold ${
              trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {Math.abs(change)}%
            </div>
          </div>
          <p className="text-3xl font-black text-ink mb-1">
            {isCurrency ? `TZS ${value.toLocaleString('sw-TZ')}` : value.toLocaleString()}
          </p>
          <p className="text-sm text-stone font-bold">{label}</p>
          <p className="text-xs text-stone/60 mt-1">vs last period</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="h-full flex items-end justify-between gap-2 px-4 pb-8">
      {data.map((item, i) => (
        <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
            transition={{ delay: 0.5 + i * 0.1, type: 'spring' }}
            className="w-full bg-gradient-to-t from-forest to-forest-light rounded-t-lg relative group cursor-pointer hover:from-savanna hover:to-savanna-light transition-colors min-h-[20px]"
          >
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-forest text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap">
                ${item.revenue.toLocaleString()}
                <br />
                {item.payments} payments
              </div>
            </div>
          </motion.div>
          <span className="text-xs font-bold text-stone">{item.month}</span>
        </div>
      ))}
    </div>
  );
}