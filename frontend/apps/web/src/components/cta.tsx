'use client'

import { useState } from 'react'

export function CTA() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [subscriptionMessage, setSubscriptionMessage] = useState('')
  const [subscriptionStatus, setSubscriptionStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Newsletter subscription handler
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubscribing(true)
    setSubscriptionMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          preferences: {
            priceAlerts: true,
            weeklyDigest: true,
            marketNews: true,
            forecastUpdates: true
          }
        }),
      })

      if (response.ok) {
        setSubscriptionStatus('success')
        setSubscriptionMessage('🎉 Successfully subscribed! Check your email for confirmation.')
        setEmail('')
      } else {
        const errorData = await response.json()
        setSubscriptionStatus('error')
        setSubscriptionMessage(errorData.error || 'Failed to subscribe. Please try again.')
      }
    } catch (error) {
      setSubscriptionStatus('error')
      setSubscriptionMessage('Network error. Please check your connection and try again.')
    } finally {
      setIsSubscribing(false)
      setTimeout(() => {
        setSubscriptionMessage('')
        setSubscriptionStatus('idle')
      }, 5000)
    }
  }

  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
          Stay Updated with Market Trends
        </h2>
        <p className="text-green-100 text-lg mb-8">
          Subscribe to our newsletter for weekly market insights, price forecasts, and agricultural tips.
        </p>
        
        <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
          <div className="flex gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-300"
              required
            />
            <button
              type="submit"
              disabled={isSubscribing}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              {isSubscribing ? 'Subscribing...' : 'Subscribe'}
            </button>
          </div>
          
          {subscriptionMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm ${
              subscriptionStatus === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {subscriptionMessage}
            </div>
          )}
        </form>
      </div>
    </section>
  )
}

