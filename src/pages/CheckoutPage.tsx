import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, CreditCard, Lock } from 'lucide-react';
import { Logo } from '../components/Logo';
export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan');
  const [selectedPlan, setSelectedPlan] = useState(planParam || 'professional');
  const plans = {
    starter: {
      name: 'Starter',
      price: 799
    },
    professional: {
      name: 'Professional',
      price: 1499
    },
    enterprise: {
      name: 'Enterprise',
      price: 1999
    }
  };
  // Default to professional if invalid param
  const currentPlan =
  plans[selectedPlan as keyof typeof plans] || plans.professional;
  return (
    <div className="min-h-screen bg-paper">
      {/* Simple Header */}
      <header className="bg-white border-b border-line py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <Logo className="w-9 h-9 text-ink group-hover:text-ink/80 transition-colors" />
            <span className="font-bold text-xl tracking-tight text-ink">
              Tech to Store
            </span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Lock className="w-4 h-4" />
            <span>Encrypted checkout form</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-sm text-muted hover:text-crimson transition-colors">

            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Checkout Form */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div
              initial={{
                opacity: 0,
                y: 20
              }}
              animate={{
                opacity: 1,
                y: 0
              }}
              transition={{
                duration: 0.5
              }}>

              <h1 className="text-3xl font-bold text-ink mb-2">
                Finalize Your Order
              </h1>
              <p className="text-muted mb-8">
                Complete your details below to continue exploring Tech to Store.
              </p>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-line space-y-6">
                <h2 className="text-xl font-semibold text-ink mb-4">
                  Business Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-ink/80">

                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                      placeholder="John" />

                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-ink/80">

                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                      placeholder="Doe" />

                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="businessName"
                    className="block text-sm font-medium text-ink/80">

                    Business Name
                  </label>
                  <input
                    type="text"
                    id="businessName"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                    placeholder="Your Store Name" />

                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-ink/80">

                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                    placeholder="john@example.com" />

                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-ink/80">

                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                    placeholder="(204) 555-0123" />

                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-line space-y-6 mt-6">
                <h2 className="text-xl font-semibold text-ink mb-4">
                  Payment Details
                </h2>

                <div className="p-4 bg-paper border border-line rounded-lg flex items-start gap-3 mb-6">
                  <CreditCard className="w-5 h-5 text-crimson mt-0.5" />
                  <div>
                    <h3 className="font-medium text-ink">
                      Secure Payment
                    </h3>
                    <p className="text-sm text-muted">
                      Your payment information is encrypted and secure. We never
                      store your credit card details.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="cardNumber"
                      className="block text-sm font-medium text-ink/80">

                      Card Number
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                      placeholder="0000 0000 0000 0000" />

                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label
                        htmlFor="expiry"
                        className="block text-sm font-medium text-ink/80">

                        Expiry Date
                      </label>
                      <input
                        type="text"
                        id="expiry"
                        className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                        placeholder="MM/YY" />

                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="cvc"
                        className="block text-sm font-medium text-ink/80">

                        CVC
                      </label>
                      <input
                        type="text"
                        id="cvc"
                        className="w-full px-4 py-2 border border-line rounded-lg focus:ring-2 focus:ring-crimson/30 focus:border-crimson outline-none transition-all"
                        placeholder="123" />

                    </div>
                  </div>
                </div>
              </div>

              <button className="btn-primary w-full py-4 text-lg mt-8">
                Complete Order (${currentPlan.price})
              </button>

              <p className="text-center text-sm text-muted mt-4">
                By completing your order, you agree to our Terms of Service and
                Privacy Policy.
              </p>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-24">
              <motion.div
                initial={{
                  opacity: 0,
                  x: 20
                }}
                animate={{
                  opacity: 1,
                  x: 0
                }}
                transition={{
                  duration: 0.5,
                  delay: 0.2
                }}
                className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl">

                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-700">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {currentPlan.name} Plan
                      </h3>
                      <p className="text-slate-400 text-sm">One-time payment</p>
                    </div>
                    <span className="font-bold text-xl">
                      ${currentPlan.price}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-slate-300 text-sm">
                    <span>Subtotal</span>
                    <span>${currentPlan.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 text-sm">
                    <span>Tax (GST/HST)</span>
                    <span>Calculated at next step</span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-slate-700 mb-8">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-pin">
                    ${currentPlan.price}
                  </span>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 space-y-4">
                  <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-400">
                    What's Included
                  </h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-pin flex-shrink-0" />
                      <span>Website design &amp; build (as scoped)</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-pin flex-shrink-0" />
                      <span>Local SEO setup guidance</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-pin flex-shrink-0" />
                      <span>Winnipeg-based contact</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-pin flex-shrink-0" />
                      <span>Responsive layout for common devices</span>
                    </li>
                  </ul>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>);

}