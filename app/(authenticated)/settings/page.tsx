'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Save,
  Globe,
  Palette,
  Building2,
  Upload,
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Bell,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  AlertCircle,
  Crown,
  Sparkles,
  ExternalLink,
  Trash2,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { operatorsApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function SettingsPage() {
  const { operator, user, refreshProfile } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoLoading, setLogoLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(operator?.logo_url || null);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Prevent hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);
  
  const [formData, setFormData] = useState({
    business_name: operator?.business_name || '',
    email: operator?.email || '',
    phone: '',
    location: '',
    website: '',
    brand_color_1: operator?.brand_color_1 || '#1B4D3E',
    brand_color_2: operator?.brand_color_2 || '#F4C542',
  });

  const [notifications, setNotifications] = useState({
    emailReviews: true,
    emailWraps: true,
    emailWeekly: true,
    pushReviews: false,
    pushWraps: false,
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setLogoLoading(true);
    try {
      const publicUrl = await operatorsApi.uploadOperatorLogo(file);
      setLogoPreview(publicUrl);
      await refreshProfile();
    } catch (error) {
      console.error('Logo upload failed:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setLogoLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    
    try {
      await operatorsApi.updateOperator(user.id, {
        business_name: formData.business_name,
        brand_color_1: formData.brand_color_1,
        brand_color_2: formData.brand_color_2,
      });
      await refreshProfile();
      alert('Settings saved successfully!');
    } catch (error) {
      console.error(error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !operator) return null;

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
              Settings
            </h1>
            <p className="text-lg text-stone">
              Manage your account, branding, and preferences
            </p>
          </div>
          
          <Button onClick={handleSave} disabled={loading} size="lg">
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 h-auto">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Branding</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Billing</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Business Profile</CardTitle>
                  <CardDescription>
                    Update your business information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Logo Upload */}
                  <div className="flex flex-col md:flex-row items-start gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <div 
                        className="h-32 w-32 rounded-2xl bg-parchment border-2 border-dashed border-dust flex items-center justify-center overflow-hidden group relative cursor-pointer hover:border-forest transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {logoPreview ? (
                          <img src={logoPreview} className="h-full w-full object-cover" alt="Logo" />
                        ) : (
                          <Building2 className="w-12 h-12 text-stone/30" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/png,image/jpeg,image/svg+xml"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoLoading}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {logoLoading ? 'Uploading...' : 'Change Logo'}
                      </Button>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="business-name">Business Name *</Label>
                        <Input
                          id="business-name"
                          value={formData.business_name}
                          onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                          placeholder="Safari Adventures Ltd"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="contact@safari.com"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+255 123 456 789"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          placeholder="Arusha, Tanzania"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          type="url"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          placeholder="https://yoursafari.com"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Brand Colors</CardTitle>
                  <CardDescription>
                    Customize your brand colors for wraps and review forms
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ColorPicker
                      label="Primary Brand Color"
                      description="Main color for buttons and headers"
                      value={formData.brand_color_1}
                      onChange={(val) => setFormData({ ...formData, brand_color_1: val })}
                    />
                    <ColorPicker
                      label="Secondary Accent Color"
                      description="Accent color for highlights"
                      value={formData.brand_color_2}
                      onChange={(val) => setFormData({ ...formData, brand_color_2: val })}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h4 className="font-bold text-ink mb-4">Preview</h4>
                    <div className="p-6 rounded-xl border-2 border-dust bg-white">
                      <div className="flex items-center gap-4 mb-4">
                        <div 
                          className="w-16 h-16 rounded-xl"
                          style={{ backgroundColor: formData.brand_color_1 }}
                        />
                        <div>
                          <p className="font-bold text-ink">Primary Color</p>
                          <p className="text-sm text-stone">Used for main elements</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-16 h-16 rounded-xl"
                          style={{ backgroundColor: formData.brand_color_2 }}
                        />
                        <div>
                          <p className="font-bold text-ink">Accent Color</p>
                          <p className="text-sm text-stone">Used for highlights</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Email Notifications</CardTitle>
                  <CardDescription>
                    Choose what updates you want to receive via email
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <NotificationToggle
                    icon={<MessageSquare className="w-4 h-4" />}
                    label="New Guest Reviews"
                    description="Get notified when guests submit reviews"
                    checked={notifications.emailReviews}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailReviews: checked })}
                  />
                  <NotificationToggle
                    icon={<Camera className="w-4 h-4" />}
                    label="Wrap Generations"
                    description="Get notified when new wraps are created"
                    checked={notifications.emailWraps}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailWraps: checked })}
                  />
                  <NotificationToggle
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Weekly Summary"
                    description="Receive weekly performance reports"
                    checked={notifications.emailWeekly}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailWeekly: checked })}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Push Notifications</CardTitle>
                  <CardDescription>
                    Receive real-time notifications in your browser
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <NotificationToggle
                    icon={<Bell className="w-4 h-4" />}
                    label="Review Notifications"
                    description="Real-time alerts for new reviews"
                    checked={notifications.pushReviews}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushReviews: checked })}
                  />
                  <NotificationToggle
                    icon={<Sparkles className="w-4 h-4" />}
                    label="Wrap Notifications"
                    description="Real-time alerts for new wraps"
                    checked={notifications.pushWraps}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushWraps: checked })}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-6 rounded-xl bg-gradient-to-r from-forest/10 to-savanna/10 border border-forest/20">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                        <Crown className="w-6 h-6 text-savanna" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-forest">Free Plan</h3>
                        <p className="text-sm text-stone">2 events • 10 reviews per event</p>
                      </div>
                    </div>
                    <Button size="lg" className="bg-forest hover:bg-forest/90">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-bold text-ink mb-4">Billing History</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-parchment/50">
                        <div>
                          <p className="font-bold text-ink">Free Plan</p>
                          <p className="text-sm text-stone">Active since April 2026</p>
                        </div>
                        <Badge variant="secondary">Current</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm new password"
                    />
                  </div>
                  
                  <Button>
                    <Lock className="w-4 h-4 mr-2" />
                    Update Password
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Account Actions</CardTitle>
                  <CardDescription>
                    Manage your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl border border-dust">
                    <div>
                      <p className="font-bold text-ink">Sign Out</p>
                      <p className="text-sm text-stone">Sign out from this device</p>
                    </div>
                    <Button variant="outline">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-xl border border-red-200 bg-red-50">
                    <div>
                      <p className="font-bold text-red-600">Delete Account</p>
                      <p className="text-sm text-red-600/70">Permanently delete your account and data</p>
                    </div>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function ColorPicker({ label, description, value, onChange }: { 
  label: string; 
  description: string;
  value: string; 
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base">{label}</Label>
        <p className="text-sm text-stone mt-1">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <input 
          type="color" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-16 w-16 rounded-xl border-2 border-dust cursor-pointer"
        />
        <div className="flex-1">
          <Input
            value={value.toUpperCase()}
            onChange={(e) => onChange(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>
    </div>
  );
}

function NotificationToggle({ icon, label, description, checked, onCheckedChange }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl hover:bg-parchment/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-parchment flex items-center justify-center text-forest">
          {icon}
        </div>
        <div>
          <p className="font-bold text-ink">{label}</p>
          <p className="text-sm text-stone">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

// Import missing icons
import { MessageSquare, BarChart3 } from 'lucide-react';
