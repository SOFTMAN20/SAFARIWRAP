'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Check,
  Star,
  Crown,
  Zap,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  Gift,
  Compass,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Subscription {
  id: string
  plan: 'free' | 'pro' | 'enterprise'
  status: 'active' | 'cancelled' | 'expired' | 'trialing'
}

const plans = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for getting started',
    icon: Gift,
    color: 'from-gray-500 to-gray-600',
    features: [
      '2 events maximum',
      '10 reviews per event',
      'Basic wrap generation',
      'SafariWrap branding',
      'Email support',
    ],
    limitations: [
      'No environmental tracking',
      'Limited customization',
      'Basic analytics',
    ],
    cta: 'Current Plan',
    popular: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 75000,
    period: 'month',
    description: 'Best for growing businesses',
    icon: Star,
    color: 'from-blue-500 to-blue-600',
    features: [
      'Unlimited events',
      'Unlimited reviews',
      'Advanced wrap customization',
      'Environmental impact tracking',
      'Remove SafariWrap branding',
      'Priority support',
      'Advanced analytics',
      'Custom QR codes',
    ],
    limitations: [],
    cta: 'Upgrade to Pro',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 250000,
    period: 'month',
    description: 'For large organizations',
    icon: Crown,
    color: 'from-purple-500 to-purple-600',
    features: [
      'Everything in Pro',
      'Multi-user accounts',
      'API access',
      'Custom branding',
      'White-label option',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
  },
]

const faqs = [
  {
    question: 'What is SafariWrap and how does it work?',
    answer: 'SafariWrap is an Experience Intelligence Platform that transforms real-world safari experiences into beautiful, shareable digital stories. Guests scan QR codes to submit reviews and photos, which are automatically compiled into stunning visual "wraps" similar to Spotify Wrapped.',
    popular: true
  },
  {
    question: 'Can I try SafariWrap before committing to a paid plan?',
    answer: 'Yes! Our Free plan allows you to create up to 2 events with 10 reviews each. This gives you a full taste of SafariWrap\'s capabilities. You can upgrade anytime as your business grows.',
    popular: true
  },
  {
    question: 'What happens to my data if I cancel my subscription?',
    answer: 'Your data remains safe and accessible. If you downgrade to Free, you\'ll keep access to your existing wraps and reviews, but new events will be limited to Free plan restrictions. We never delete your historical data.'
  },
  {
    question: 'How does the environmental impact tracking work?',
    answer: 'Through our partnership with Green Manjaro, we plant trees based on guest engagement: 1 tree for 1-10 reviews, 2 trees for 11-25 reviews, and 3 trees for 26+ reviews per event. Each tree offsets approximately 22kg of CO₂ annually, and you receive GPS coordinates of planted trees.',
    popular: true
  },
  {
    question: 'Can I customize the wraps with my safari company branding?',
    answer: 'Yes! Pro and Enterprise plans allow you to remove SafariWrap branding and add your own logo, colors, and custom messaging. Enterprise plans offer full white-label options for complete brand control.'
  },
  {
    question: 'How do guests access the review system?',
    answer: 'Guests simply scan a QR code you provide (printed cards, tent cards, etc.) which takes them to a mobile-optimized review form. No app downloads or account creation required - it works instantly on any smartphone.'
  },
  {
    question: 'What types of safari experiences does SafariWrap support?',
    answer: 'Currently focused on safari experiences, but we\'re expanding to support marathons, cultural tours, and other adventure experiences. Each type has specialized review forms and wrap templates.'
  },
  {
    question: 'Is there a limit to how many photos guests can upload?',
    answer: 'Guests can upload up to 3 photos per review on all plans. These photos are automatically incorporated into the generated wraps and stored securely in our cloud storage.'
  },
  {
    question: 'Can I export or download the reviews and data?',
    answer: 'Yes! All plans include data export capabilities. Pro and Enterprise plans offer advanced export options and API access for integrating with your existing systems.'
  },
  {
    question: 'What kind of support do you provide?',
    answer: 'Free plans include email support. Pro plans get priority support with faster response times. Enterprise customers receive dedicated support with phone access and a dedicated account manager.'
  },
  {
    question: 'How secure is guest data on SafariWrap?',
    answer: 'We take security seriously with enterprise-grade encryption, secure cloud storage, and GDPR compliance. Guest data is only used for wrap generation and is never shared with third parties without explicit consent.'
  },
  {
    question: 'Can I change plans anytime?',
    answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, while downgrades take effect at the end of your current billing cycle.'
  }
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  // Fetch current subscription
  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['subscription-status'],
    queryFn: async () => {
      const res = await fetch('/api/subscriptions/status')
      if (!res.ok) throw new Error('Failed to fetch subscription')
      return res.json()
    },
  })

  const handlePlanSelect = async (planId: string) => {
    if (planId === 'free') {
      // Already on free plan
      return
    }

    if (planId === 'enterprise') {
      // Contact sales
      window.open('mailto:sales@safariwrap.com?subject=Enterprise Plan Inquiry', '_blank')
      return
    }

    try {
      // Create checkout session
      const res = await fetch('/api/subscriptions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: planId,
          annual: isAnnual,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to create checkout')
      }

      const { checkoutUrl } = await res.json()
      window.location.href = checkoutUrl
    } catch (error: any) {
      console.error('Error creating checkout:', error)
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to create checkout'
      
      if (errorMessage.includes('SNIPPESH_API_KEY') || errorMessage.includes('not configured')) {
        alert('Payment system is not yet configured. Please contact support or try again later.')
      } else if (errorMessage.includes('Unauthorized')) {
        alert('Please log in to upgrade your plan.')
      } else if (errorMessage.includes('Operator not found')) {
        alert('Account not found. Please complete your profile setup.')
      } else {
        alert(`Error: ${errorMessage}`)
      }
    }
  }

  const getPlanPrice = (plan: typeof plans[0]) => {
    if (plan.price === 0) return 'Free'
    const price = isAnnual ? plan.price * 10 : plan.price // 2 months free annually
    return new Intl.NumberFormat('sw-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const getPlanCTA = (plan: typeof plans[0]) => {
    if (subscription?.plan === plan.id) {
      return subscription.status === 'active' ? 'Current Plan' : 'Reactivate'
    }
    return plan.cta
  }

  const isPlanDisabled = (plan: typeof plans[0]) => {
    return subscription?.plan === plan.id && subscription.status === 'active'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Navigation Header */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-dust"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-primary" />
              <img src="/logo.png" alt="SafariWrap" className="w-8 h-8" />
              <span className="text-2xl font-extrabold text-primary">
                Safari<span className="text-yellow-500">Wrap</span>
              </span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-primary hover:bg-primary/10">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90 text-white">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-gray-900">Choose Your Plan</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your safari experiences into beautiful digital stories with our flexible pricing plans
          </p>
        </motion.div>

        {/* Annual Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-center mb-12"
        >
          <div className="flex items-center gap-4 p-1 bg-gray-100 rounded-full">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                !isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                isAnnual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <Badge className="bg-emerald-500 text-white text-xs">2 months free</Badge>
            </button>
          </div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon
            const isCurrentPlan = subscription?.plan === plan.id
            const isActive = subscription?.status === 'active'

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="relative"
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <Card className={`h-full transition-all duration-300 hover:shadow-xl ${
                  plan.popular ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                } ${isCurrentPlan && isActive ? 'ring-2 ring-emerald-500' : ''}`}>
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                      {plan.name}
                      {isCurrentPlan && isActive && (
                        <Badge className="bg-emerald-500 text-white text-xs">Current</Badge>
                      )}
                    </CardTitle>
                    <p className="text-gray-600">{plan.description}</p>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-gray-900">
                          {getPlanPrice(plan)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-gray-600">
                            /{isAnnual ? 'year' : plan.period}
                          </span>
                        )}
                      </div>
                      {plan.price > 0 && isAnnual && (
                        <p className="text-sm text-emerald-600 mt-1">
                          Save {new Intl.NumberFormat('sw-TZ', { style: 'currency', currency: 'TZS', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(plan.price * 2)} annually
                        </p>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handlePlanSelect(plan.id)}
                      disabled={isPlanDisabled(plan)}
                      className={`w-full ${
                        plan.popular
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700'
                          : plan.id === 'enterprise'
                          ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700'
                          : ''
                      }`}
                      variant={isPlanDisabled(plan) ? 'outline' : 'default'}
                    >
                      {getPlanCTA(plan)}
                      {!isPlanDisabled(plan) && plan.id !== 'free' && (
                        <ArrowRight className="w-4 h-4 ml-2" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>

        {/* Feature Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-20"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Feature Comparison</CardTitle>
              <p className="text-gray-600">See what's included in each plan</p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-4 px-4">Features</th>
                      <th className="text-center py-4 px-4">Free</th>
                      <th className="text-center py-4 px-4">Pro</th>
                      <th className="text-center py-4 px-4">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-4 px-4 font-medium">Events</td>
                      <td className="text-center py-4 px-4">2</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-medium">Reviews per event</td>
                      <td className="text-center py-4 px-4">10</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                      <td className="text-center py-4 px-4">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-medium">Environmental tracking</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-medium">Custom branding</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-medium">API access</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-medium">Multi-user accounts</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4">❌</td>
                      <td className="text-center py-4 px-4">✅</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-20"
        >
          <Card>
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <HelpCircle className="w-8 h-8 text-primary" />
                <CardTitle className="text-2xl font-bold">Frequently Asked Questions</CardTitle>
              </div>
              <p className="text-gray-600">Everything you need to know about SafariWrap</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        openFaq === index 
                          ? 'border-primary/50 bg-primary/5 shadow-sm' 
                          : 'border-gray-200 hover:border-primary/30 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 pr-4">
                          <span className={`flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                            openFaq === index 
                              ? 'bg-primary text-white' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-gray-900">{faq.question}</h3>
                              {faq.popular && (
                                <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        {openFaq === index ? (
                          <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      {openFaq === index && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="mt-3 pt-3 border-t border-gray-100"
                        >
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </motion.div>
                      )}
                    </button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center mt-16"
        >
          <p className="text-gray-600 mb-4">
            Still have questions or need personalized guidance?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" asChild>
              <a href="mailto:support@safariwrap.com">
                <Shield className="w-4 h-4 mr-2" />
                Contact Support
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:sales@safariwrap.com">
                <Users className="w-4 h-4 mr-2" />
                Talk to Sales
              </a>
            </Button>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Response time: Free (24-48h) • Pro (4-8h) • Enterprise (1-2h)
          </p>
        </motion.div>
      </div>
    </div>
  )
}