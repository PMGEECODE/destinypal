"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import {
  Heart,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Building2,
  Users,
  Loader2,
  CheckCircle,
  Menu,
  X,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
} from "lucide-react"
import type { ContactFormData, ContactInfoItem, InquiryTypeOption, ContactAPIResponse } from "../../types/contact"
import type { TurnstileRenderOptions } from "../../types/cloudflare-turnstile"
import { apiClient, ApiError } from "../../lib/api/client"

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "0x4AAAAAACFgSmAHFnDJWO6Q"

const CONTACT_INFO: ContactInfoItem[] = [
  {
    icon: Mail,
    title: "Email Us",
    value: "support@destinypal.org",
    description: "24 hour response",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+254 700 123 456",
    description: "Mon-Fri, 9am-6pm",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    value: "Nairobi, Kenya",
    description: "Westlands, ABC Place",
  },
  {
    icon: Clock,
    title: "Office Hours",
    value: "Mon-Fri: 9am-6pm",
    description: "Sat: 10am-2pm",
  },
]

const INQUIRY_TYPES: InquiryTypeOption[] = [
  { value: "general", label: "General Inquiry", icon: MessageSquare },
  { value: "sponsor", label: "Sponsorship", icon: Heart },
  { value: "institution", label: "Partnership", icon: Building2 },
  { value: "student", label: "Student Support", icon: Users },
]

const INITIAL_FORM_DATA: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  inquiryType: "general",
  subject: "",
  message: "",
}

export function Contact(): React.JSX.Element {
  const [formData, setFormData] = useState<ContactFormData>(INITIAL_FORM_DATA)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [turnstileReady, setTurnstileReady] = useState<boolean>(false)

  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetId = useRef<string | null>(null)
  const isMountedRef = useRef<boolean>(true)

  const renderTurnstileWidget = useCallback((): void => {
    if (!turnstileContainerRef.current || !window.turnstile || turnstileWidgetId.current) {
      return
    }

    try {
      const options: TurnstileRenderOptions = {
        sitekey: TURNSTILE_SITE_KEY,
        callback: () => {
          if (isMountedRef.current) {
            setTurnstileReady(true)
          }
        },
        "error-callback": () => {
          if (isMountedRef.current) {
            setError("Verification widget failed to load. Please refresh.")
            setTurnstileReady(false)
          }
        },
        "expired-callback": () => {
          if (isMountedRef.current) {
            setTurnstileReady(false)
          }
        },
        theme: "light",
        size: "normal",
      }

      turnstileWidgetId.current = window.turnstile.render(turnstileContainerRef.current, options)
    } catch (err) {
      console.error("Failed to render Turnstile widget:", err)
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    const scriptId = "cf-turnstile-script"
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    const handleScriptLoad = (): void => {
      // Small delay to ensure turnstile is fully initialized
      requestAnimationFrame(() => {
        if (isMountedRef.current) {
          renderTurnstileWidget()
        }
      })
    }

    if (!script) {
      script = document.createElement("script")
      script.id = scriptId
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.onload = handleScriptLoad
      script.onerror = () => {
        if (isMountedRef.current) {
          setError("Failed to load verification. Please refresh the page.")
        }
      }
      document.head.appendChild(script)
    } else if (window.turnstile) {
      // Script already loaded, render immediately
      handleScriptLoad()
    } else {
      // Script exists but not loaded yet, wait for it
      script.addEventListener("load", handleScriptLoad)
    }

    return () => {
      isMountedRef.current = false
      if (turnstileWidgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId.current)
        } catch {
          // Widget may already be removed
        }
        turnstileWidgetId.current = null
      }
    }
  }, [renderTurnstileWidget])

  const resetTurnstile = useCallback((): void => {
    if (turnstileWidgetId.current && window.turnstile) {
      try {
        window.turnstile.reset(turnstileWidgetId.current)
        setTurnstileReady(false)
      } catch {
        // Widget may not exist
      }
    }
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    },
    [],
  )

  const handleResetForm = useCallback((): void => {
    setIsSubmitted(false)
    setFormData(INITIAL_FORM_DATA)
    setError(null)
    resetTurnstile()
  }, [resetTurnstile])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      // Get Turnstile token
      const token = turnstileWidgetId.current ? window.turnstile?.getResponse(turnstileWidgetId.current) : undefined

      if (!token) {
        setError("Please complete the verification challenge.")
        setIsSubmitting(false)
        return
      }

      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        inquiry_type: formData.inquiryType,
        subject: formData.subject, // Added missing subject field required by backend
        message: formData.message,
        cf_turnstile_response: token,
      }

      try {
        console.log("[v0] Submitting contact form with payload:", payload)
        const response = await apiClient.post<ContactAPIResponse>("/contact", payload)
        console.log("[v0] Contact form submission successful:", response)

        if (isMountedRef.current) {
          setIsSubmitted(true)
          resetTurnstile()
        }
      } catch (err) {
        console.log("[v0] Contact form submission error:", err)
        console.log("[v0] Error type:", err?.constructor?.name)
        if (err instanceof ApiError) {
          console.log("[v0] ApiError status:", err.status)
          console.log("[v0] ApiError message:", err.message)
          console.log("[v0] ApiError data:", err.data)
        }

        if (isMountedRef.current) {
          let errorMessage = "Failed to send message. Please try again later."
          if (err instanceof ApiError) {
            errorMessage = err.message || errorMessage
          } else if (err instanceof Error) {
            errorMessage = err.message
          }
          setError(errorMessage)
          resetTurnstile()
        }
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false)
        }
      }
    },
    [formData, resetTurnstile],
  )

  const toggleMenu = useCallback((): void => {
    setIsMenuOpen((prev) => !prev)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-lg font-bold text-gray-900">DestinyPal</span>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a href="/" className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors">
                Home
              </a>
              <a href="/about" className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors">
                About
              </a>
              <a href="/students" className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors">
                Students
              </a>
              <a href="/contact" className="text-sm font-medium text-slate-700">
                Contact
              </a>
              <button
                type="button"
                className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 text-sm font-medium rounded-lg transition-colors"
              >
                Sponsor Now
              </button>
            </nav>

            <button
              type="button"
              onClick={toggleMenu}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {isMenuOpen && (
            <nav className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <a href="/" className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors py-2">
                  Home
                </a>
                <a
                  href="/about"
                  className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors py-2"
                >
                  About
                </a>
                <a
                  href="/students"
                  className="text-sm font-medium text-gray-700 hover:text-slate-700 transition-colors py-2"
                >
                  Students
                </a>
                <a href="/contact" className="text-sm font-medium text-slate-700 py-2">
                  Contact
                </a>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 text-sm font-medium rounded-lg transition-colors mt-2"
                >
                  Sponsor Now
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-yellow-400 text-xs md:text-sm mb-2">We'd Love to Hear From You</p>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3">Contact Us</h1>
            <p className="text-sm text-gray-300 max-w-2xl mx-auto">
              Questions about sponsoring a student or partnering with us? We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-5xl mx-auto -mt-16">
            {CONTACT_INFO.map((info) => {
              const Icon = info.icon
              return (
                <div
                  key={info.title}
                  className="bg-white rounded-lg p-3 md:p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-lg mb-2 md:mb-3">
                    <Icon className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5">{info.title}</h3>
                  <p className="text-slate-700 font-medium text-xs md:text-sm mb-0.5">{info.value}</p>
                  <p className="text-xs text-gray-600">{info.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Form + Map Section */}
      <section className="py-6 md:py-10 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Contact Form */}
            <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-gray-200">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">Send us a Message</h2>
              <div className="w-12 h-1 bg-gradient-to-r from-slate-700 to-yellow-400 rounded-full mb-4" />

              {isSubmitted ? (
                <div className="text-center py-8 md:py-12">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 bg-green-100 text-green-600 rounded-full mb-3">
                    <CheckCircle className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-sm text-slate-700 font-medium hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium text-gray-900 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        minLength={2}
                        maxLength={100}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium text-gray-900 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone & Inquiry Type */}
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium text-gray-900 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={20}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow"
                        placeholder="+254 700 000 000"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiryType" className="block text-xs font-medium text-gray-900 mb-1">
                        Inquiry Type *
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow"
                      >
                        {INQUIRY_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-medium text-gray-900 mb-1">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      minLength={3}
                      maxLength={200}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow"
                      placeholder="How can we help?"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-medium text-gray-900 mb-1">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      minLength={10}
                      maxLength={2000}
                      rows={4}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-shadow resize-none"
                      placeholder="Tell us more about your inquiry..."
                    />
                  </div>

                  <div className="my-4">
                    <div ref={turnstileContainerRef} className="cf-turnstile" aria-label="Security verification" />
                    {!turnstileReady && !error && <p className="text-xs text-gray-500 mt-2">Loading verification...</p>}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="text-red-600 text-sm font-medium text-center" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 font-semibold py-2.5 text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: Map + Support */}
            <div className="space-y-4">
              {/* Map Placeholder */}
              <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center">
                  <div className="text-center p-6">
                    <MapPin className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Our Location</h3>
                    <p className="text-sm text-gray-600">
                      ABC Place, 5th Floor
                      <br />
                      Westlands, Nairobi
                      <br />
                      Kenya
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Card */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 md:p-5 shadow-sm border border-slate-200">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Have Questions?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Check out our FAQ page for answers to commonly asked questions about sponsorships and donations.
                </p>
                <a
                  href="/faq"
                  className="inline-flex items-center gap-1.5 text-sm text-slate-700 font-medium hover:text-yellow-600 transition-colors"
                >
                  Visit our FAQ page
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              </div>

              {/* Quick Support */}
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 md:p-5 shadow-sm border border-yellow-200">
                <h3 className="text-base font-semibold text-gray-900 mb-2">Quick Support</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Need immediate assistance? Our support team is available to help you right away.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <a
                    href="mailto:support@destinypal.org"
                    className="flex-1 px-3 py-2 bg-white hover:bg-gray-50 text-slate-700 text-sm font-medium rounded-lg transition-colors text-center border border-yellow-300"
                  >
                    Email
                  </a>
                  <a
                    href="tel:+254700123456"
                    className="flex-1 px-3 py-2 bg-white hover:bg-gray-50 text-slate-700 text-sm font-medium rounded-lg transition-colors text-center border border-yellow-300"
                  >
                    Call
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-800 to-slate-900 pt-8 md:pt-12 pb-4 md:pb-6">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-slate-800 fill-slate-800" />
                </div>
                <span className="text-base font-bold text-white">DestinyPal</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                DestinyPal empowers underprivileged individuals and communities through education, youth development,
                and community support programs.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Useful Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/sponsor" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                    Sponsor a Student
                  </a>
                </li>
                <li>
                  <a href="/donate" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                    Make a Donation
                  </a>
                </li>
                <li>
                  <a href="/career" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                    Career
                  </a>
                </li>
                <li>
                  <a href="/news" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                    News and Updates
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">Get In Touch</h3>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-300">
                    DestinyPal, Nairobi
                    <br />
                    Westlands, ABC Place, 5th Floor
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <a
                    href="mailto:support@destinypal.org"
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
                  >
                    support@destinypal.org
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                  <a
                    href="tel:+254700123456"
                    className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
                  >
                    +254 700 123 456
                  </a>
                </div>
              </div>

              <div className="flex gap-2">
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-8 h-8 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700 pt-4 md:pt-6">
            <p className="text-center text-xs md:text-sm text-gray-400">© 2025 – DestinyPal | All Rights Reserved</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
