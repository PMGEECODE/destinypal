import { useState, useEffect } from "react"
import {
  Heart,
  Users,
  Building2,
  GraduationCap,
  Shield,
  TrendingUp,
  ChevronRight,
  Star,
  ArrowRight,
  CheckCircle,
  Globe,
  Award,
  Menu,
  X,
  Sparkles,
  DollarSign,
} from "lucide-react"

interface LandingPageProps {
  onNavigateToLogin: () => void
  onNavigateToRegister: () => void
  onNavigateToAbout: () => void
  onNavigateToContact: () => void
  onNavigateToDonate?: () => void
}

const STATS = [
  { value: "5,000+", label: "Students Supported", icon: Users },
  { value: "1,200+", label: "Active Sponsors", icon: Heart },
  { value: "50+", label: "Partner Institutions", icon: Building2 },
  { value: "92%", label: "Graduation Rate", icon: GraduationCap },
]

const FEATURES = [
  {
    icon: Shield,
    title: "Verified Students",
    description:
      "All students are thoroughly verified through their educational institutions with complete documentation.",
  },
  {
    icon: TrendingUp,
    title: "Track Your Impact",
    description: "Get regular updates on your sponsored students' progress, grades, and achievements.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with students across multiple countries and institutions throughout Africa.",
  },
  {
    icon: Award,
    title: "100% Transparent",
    description: "Every donation is tracked and reported. See exactly where your contribution goes.",
  },
]

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Sponsor",
    quote: "DestinyPal made it incredibly easy to support a student's education. The progress updates are wonderful.",
    rating: 5,
  },
  {
    name: "James O.",
    role: "University Student",
    quote: "Thanks to my sponsor, I was able to complete my engineering degree. Forever grateful!",
    rating: 5,
  },
  {
    name: "Grace K.",
    role: "Institution Partner",
    quote: "The platform has helped us connect deserving students with sponsors efficiently.",
    rating: 5,
  },
]

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Account",
    description: "Sign up as a sponsor, student, or institution in minutes.",
  },
  {
    step: "02",
    title: "Browse Students",
    description: "Explore verified student profiles and their educational needs.",
  },
  {
    step: "03",
    title: "Make an Impact",
    description: "Choose a student to sponsor and track their journey to success.",
  },
]

const CAROUSEL_IMAGES = [
  {
    url: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Empowering Dreams Through Education",
    subtitle: "Supporting students across Africa"
  },
  {
    url: "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Building Brighter Futures",
    subtitle: "One student at a time"
  },
  {
    url: "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Creating Opportunities",
    subtitle: "Through the power of sponsorship"
  },
  {
    url: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Transforming Communities",
    subtitle: "With education for all"
  },
]

export function LandingPage({
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToDonate = () => alert('Donate functionality coming soon!'),
}: LandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="bg-green-600 p-2 rounded-xl shadow-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">DestinyPal</span>
            </div>

            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                onClick={onNavigateToAbout}
                className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm lg:text-base"
              >
                About
              </button>
              <button
                onClick={onNavigateToContact}
                className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm lg:text-base"
              >
                Contact
              </button>
              <button
                onClick={onNavigateToDonate}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm lg:text-base inline-flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Donate
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-gray-600 hover:text-green-600 font-medium transition-colors text-sm lg:text-base"
              >
                Log in
              </button>
              <button
                onClick={onNavigateToRegister}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm lg:text-base"
              >
                Get Started
              </button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-gray-600" /> : <Menu className="w-6 h-6 text-gray-600" />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onNavigateToAbout()
                    setMobileMenuOpen(false)
                  }}
                  className="px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    onNavigateToContact()
                    setMobileMenuOpen(false)
                  }}
                  className="px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Contact
                </button>
                <button
                  onClick={() => {
                    onNavigateToDonate()
                    setMobileMenuOpen(false)
                  }}
                  className="mx-4 mt-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md inline-flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Donate
                </button>
                <button
                  onClick={() => {
                    onNavigateToLogin()
                    setMobileMenuOpen(false)
                  }}
                  className="px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    onNavigateToRegister()
                    setMobileMenuOpen(false)
                  }}
                  className="mx-4 mt-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md"
                >
                  Get Started
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          {CAROUSEL_IMAGES.map((image, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={image.url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80"></div>
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-900/20 to-white"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-sm text-green-700 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg border border-green-200">
              <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              Transforming Education Across Africa
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6 drop-shadow-2xl">
              {CAROUSEL_IMAGES[currentImageIndex].title}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium mb-3 sm:mb-4 drop-shadow-lg">
              {CAROUSEL_IMAGES[currentImageIndex].subtitle}
            </p>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto drop-shadow-lg px-4">
              DestinyPal bridges the gap between students in need and sponsors who want to make a lasting impact
              through education. Join our community and change lives today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <button
                onClick={onNavigateToRegister}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <Sparkles className="w-5 h-5" />
                Start Sponsoring Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onNavigateToAbout}
                className="w-full sm:w-auto bg-white/90 backdrop-blur-sm hover:bg-white border-2 border-white text-gray-900 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                Learn More
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-8 sm:mt-12">
            {CAROUSEL_IMAGES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentImageIndex ? "bg-green-600 w-8 sm:w-12 shadow-lg" : "bg-white/40 w-2 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {STATS.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-600 text-white rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-green-600 mb-1 sm:mb-2">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4 sm:mb-6 border border-green-200">
              <Award className="w-4 h-4 text-green-600" />
              <span className="text-xs sm:text-sm font-semibold text-green-800">Why Choose Us</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Why Choose DestinyPal?</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-green-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              We've built a platform that makes educational sponsorship simple, transparent, and impactful.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-green-300 transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-green-600 text-white rounded-xl sm:rounded-2xl mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">{feature.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16 lg:py-24">
        <div className="absolute inset-0 z-0 opacity-10">
          <img
            src="https://images.pexels.com/photos/8500544/pexels-photo-8500544.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Students background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">How It Works</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-green-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Getting started with DestinyPal is simple. Here's how you can make a difference today.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="text-center bg-white/5 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 hover:-translate-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-green-600 text-white rounded-2xl sm:rounded-3xl text-xl sm:text-3xl font-bold mb-5 sm:mb-6 shadow-2xl">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <button
              onClick={onNavigateToRegister}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-2xl hover:shadow-green-500/50 hover:-translate-y-1 inline-flex items-center gap-2"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full mb-4 sm:mb-6 border border-green-200">
              <Star className="w-4 h-4 text-green-600 fill-green-600" />
              <span className="text-xs sm:text-sm font-semibold text-green-800">Testimonials</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">What Our Community Says</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-green-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from sponsors, students, and institutions who are part of the DestinyPal family.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-green-300 transition-all duration-300 hover:-translate-y-2">
                <div className="flex gap-1 mb-4 sm:mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 fill-green-500" />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 leading-relaxed italic">"{testimonial.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-green-600 font-medium">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-green-600 py-12 sm:py-16 lg:py-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-700/30 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 sm:mb-8">
            <Heart className="w-4 h-4 text-white" />
            <span className="text-xs sm:text-sm font-semibold text-white">Make a Difference Today</span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">Ready to Make a Difference?</h2>
          <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow">
            Join thousands of sponsors and help students achieve their dreams through education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <button
              onClick={onNavigateToRegister}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-green-600 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-2xl hover:shadow-white/50 hover:-translate-y-1 inline-flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Become a Sponsor
            </button>
            <button
              onClick={onNavigateToContact}
              className="w-full sm:w-auto border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all backdrop-blur-sm text-base sm:text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-green-600 p-2 rounded-xl shadow-lg">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DestinyPal</span>
              </div>
              <p className="text-sm leading-relaxed">
                Transforming lives through education by connecting students with sponsors and institutions.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Platform</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button onClick={onNavigateToLogin} className="hover:text-green-400 transition-colors">
                    Login
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToRegister} className="hover:text-green-400 transition-colors">
                    Register
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button onClick={onNavigateToAbout} className="hover:text-green-400 transition-colors">
                    About Us
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateToContact} className="hover:text-green-400 transition-colors">
                    Contact
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li>
                  <button className="hover:text-green-400 transition-colors">Privacy Policy</button>
                </li>
                <li>
                  <button className="hover:text-green-400 transition-colors">Terms of Service</button>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} DestinyPal. All rights reserved.</p>
            <p className="text-xs text-slate-500 mt-2">
              Empowering education, one student at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <LandingPage
      onNavigateToLogin={() => console.log('Navigate to login')}
      onNavigateToRegister={() => console.log('Navigate to register')}
      onNavigateToAbout={() => console.log('Navigate to about')}
      onNavigateToContact={() => console.log('Navigate to contact')}
      onNavigateToDonate={() => console.log('Navigate to donate')}
    />
  );
}

export default App;
