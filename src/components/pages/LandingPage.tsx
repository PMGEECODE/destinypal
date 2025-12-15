import { useState, useEffect } from "react";
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
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Instagram,
} from "lucide-react";

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
  onNavigateToAbout: () => void;
  onNavigateToContact: () => void;
  onNavigateToDonate?: () => void;
}

const STATS = [
  { value: "5,000+", label: "Students Supported", icon: Users },
  { value: "1,200+", label: "Active Sponsors", icon: Heart },
  { value: "50+", label: "Partner Institutions", icon: Building2 },
  { value: "92%", label: "Graduation Rate", icon: GraduationCap },
];

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
    description:
      "Get regular updates on your sponsored students' progress, grades, and achievements.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description:
      "Connect with students across multiple countries and institutions throughout Africa.",
  },
  {
    icon: Award,
    title: "100% Transparent",
    description:
      "Every donation is tracked and reported. See exactly where your contribution goes.",
  },
];

const TESTIMONIALS = [
  {
    name: "Sarah M.",
    role: "Sponsor",
    quote:
      "DestinyPal made it incredibly easy to support a student's education. The progress updates are wonderful.",
    rating: 5,
  },
  {
    name: "James O.",
    role: "University Student",
    quote:
      "Thanks to my sponsor, I was able to complete my engineering degree. Forever grateful!",
    rating: 5,
  },
  {
    name: "Grace K.",
    role: "Institution Partner",
    quote:
      "The platform has helped us connect deserving students with sponsors efficiently.",
    rating: 5,
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Create Account",
    description: "Sign up as a sponsor, student, or institution in minutes.",
  },
  {
    step: "02",
    title: "Browse Students",
    description:
      "Explore verified student profiles and their educational needs.",
  },
  {
    step: "03",
    title: "Make an Impact",
    description:
      "Choose a student to sponsor and track their journey to success.",
  },
];

const CAROUSEL_IMAGES = [
  {
    url: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Empowering Dreams Through Education",
    subtitle: "Supporting students across Africa",
  },
  {
    url: "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Building Brighter Futures",
    subtitle: "One student at a time",
  },
  {
    url: "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Creating Opportunities",
    subtitle: "Through the power of sponsorship",
  },
  {
    url: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
    title: "Transforming Communities",
    subtitle: "With education for all",
  },
];

const PARTNERS = [
  {
    name: "University of Nairobi",
    logo: "https://images.seeklogo.com/logo-png/54/1/university-of-nairobi-logo-png_seeklogo-544357.png",
  },
  {
    name: "Kenyatta University",
    logo: "https://images.seeklogo.com/logo-png/36/1/kenyatta-university-logo-png_seeklogo-361756.png",
  },
  {
    name: "Strathmore University",
    logo: "https://scontent.fmba3-1.fna.fbcdn.net/v/t39.30808-6/327326078_731000495108649_2552663170107391570_n.png?stp=dst-jpg_tt6&_nc_cat=103&ccb=1-7&_nc_sid=a5f93a&_nc_eui2=AeEXBnpu4nqrw7koZ-95okZ4oJcn0EzKoj2glyfQTMqiPfq2KWSRQs5sbR0YZrPrwg4S_pVZgKywkVLZITyuLgGm&_nc_ohc=lX23TIqXDVAQ7kNvwFwh8u9&_nc_oc=Adk88JXkwNlZvj03oqx9s_pdeqrmf0HS9aGmPgoYtCbaq2C_cNtpgS8A9Fl-7eYlAcQ&_nc_zt=23&_nc_ht=scontent.fmba3-1.fna&_nc_gid=OmLK670Rl1A-GPueTixuSg&oh=00_Afmbel1cxFkhYwGdZBQziXJbhkJPaMSdYnVP6dkjC_U5Vg&oe=69436D61",
  },
  {
    name: "Moi University",
    logo: "https://www.ivey.uwo.ca/media/3776304/moi_university_logo.png?width=310&height=310",
  },
  {
    name: "Technical University of Kenya",
    logo: "https://landportal.org/sites/default/files/2024-03/tuk-logo.png",
  },
  {
    name: "Jomo Kenyatta University",
    logo: "https://upload.wikimedia.org/wikipedia/en/thumb/4/45/Jomo_Kenyatta_University_Logo.jpg/250px-Jomo_Kenyatta_University_Logo.jpg",
  },
  {
    name: "Mount Kenya University",
    logo: "https://via.placeholder.com/200x100/1e293b/ffffff?text=MKU",
  },
  {
    name: "HELB",
    logo: "https://teachersupdates.news/wp-content/uploads/2025/01/97d3ec51793b267b-1-768x445.webp",
  },
  {
    name: "Safaricom",
    logo: "https://www.safaricom.co.ke/images/SAF-MAIN-LOGO.png",
  },
  {
    name: "KCB Bank",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-m8ZdAkg0fukM6aU39tsrliUs8kWEyBVfZw&s",
  },
  {
    name: "Equity Bank",
    logo: "https://seeklogo.com/images/E/equity-bank-logo-5E5E5E5E5E-seeklogo.com.png",
  },
  {
    name: "ABSA Bank Kenya",
    logo: "https://seeklogo.com/images/A/absa-logo-0A0A0A0A0A-seeklogo.com.png",
  },
  {
    name: "Ministry of Education Kenya",
    logo: "https://www.education.go.ke/sites/default/files/Ministry%20of%20Education%20Logo.png",
  },
];

const SPONSORS = [
  {
    name: "Dr. Jane Kamau",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    info: "Pediatrician & Education Advocate",
    tier: "Gold" as const,
    amount: "Sponsored 12 students",
  },
  {
    name: "Eng. Peter Omondi",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    info: "Tech Entrepreneur",
    tier: "Silver" as const,
    amount: "Sponsored 8 students",
  },
  {
    name: "Mary Wanjiku",
    image:
      "https://images.unsplash.com/photo-1580489940920-8e9048a7d1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    info: "Business Owner",
    tier: "Bronze" as const,
    amount: "Sponsored 5 students",
  },
  {
    name: "Prof. David Njoroge",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    info: "University Lecturer",
    tier: "Gold" as const,
    amount: "Sponsored 15 students",
  },
  {
    name: "Grace Achieng",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    info: "Lawyer & Philanthropist",
    tier: "Silver" as const,
    amount: "Sponsored 7 students",
  },
  {
    name: "Samuel Kiprop",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    info: "Agricultural Expert",
    tier: "Bronze" as const,
    amount: "Sponsored 4 students",
  },
];

export function LandingPage({
  onNavigateToLogin,
  onNavigateToRegister,
  onNavigateToAbout,
  onNavigateToContact,
  onNavigateToDonate = () => alert("Donate functionality coming soon!"),
}: LandingPageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-slate-700 to-slate-800 p-2 rounded-xl shadow-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400" />
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">
                DestinyPal
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-4 lg:gap-6">
              <button
                onClick={onNavigateToAbout}
                className="text-gray-600 hover:text-slate-700 font-medium transition-colors text-sm lg:text-base"
              >
                About
              </button>
              <button
                onClick={onNavigateToContact}
                className="text-gray-600 hover:text-slate-700 font-medium transition-colors text-sm lg:text-base"
              >
                Contact
              </button>
              <button
                onClick={onNavigateToDonate}
                className="bg-slate-700 hover:bg-slate-800 text-yellow-400 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm lg:text-base inline-flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Donate
              </button>
              <button
                onClick={onNavigateToLogin}
                className="text-gray-600 hover:text-slate-700 font-medium transition-colors text-sm lg:text-base"
              >
                Log in
              </button>
              <button
                onClick={onNavigateToRegister}
                className="bg-slate-700 hover:bg-slate-800 text-yellow-400 px-5 py-2.5 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg text-sm lg:text-base"
              >
                Get Started
              </button>
            </nav>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    onNavigateToAbout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => {
                    onNavigateToContact();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Contact
                </button>
                <button
                  onClick={() => {
                    onNavigateToDonate();
                    setMobileMenuOpen(false);
                  }}
                  className="mx-4 mt-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 px-5 py-2.5 rounded-lg font-semibold shadow-md inline-flex items-center justify-center gap-2"
                >
                  <Heart className="w-4 h-4" />
                  Donate
                </button>
                <button
                  onClick={() => {
                    onNavigateToLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-2 text-left text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    onNavigateToRegister();
                    setMobileMenuOpen(false);
                  }}
                  className="mx-4 mt-2 bg-slate-700 hover:bg-slate-800 text-yellow-400 px-5 py-2.5 rounded-lg font-semibold shadow-md"
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
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white text-slate-700 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 shadow-lg border border-yellow-200">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              Transforming Education Across Africa
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-white leading-tight mb-4 sm:mb-6 drop-shadow-2xl">
              {CAROUSEL_IMAGES[currentImageIndex].title}
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-gray-100 font-medium mb-3 sm:mb-4 drop-shadow-lg">
              {CAROUSEL_IMAGES[currentImageIndex].subtitle}
            </p>

            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed mb-8 sm:mb-12 max-w-3xl mx-auto drop-shadow-lg px-4">
              DestinyPal bridges the gap between students in need and sponsors
              who want to make a lasting impact through education. Join our
              community and change lives today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4">
              <button
                onClick={onNavigateToRegister}
                className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-yellow-400 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-2xl hover:shadow-yellow-500/30 hover:-translate-y-1 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                <Sparkles className="w-5 h-5" />
                Start Sponsoring Now
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={onNavigateToAbout}
                className="w-full sm:w-auto bg-white hover:bg-gray-100 text-slate-700 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg"
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
                  index === currentImageIndex
                    ? "bg-yellow-400 w-8 sm:w-12 shadow-lg"
                    : "bg-white/40 w-2 hover:bg-white/60"
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
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-xl sm:rounded-2xl mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-700 mb-1 sm:mb-2">
                    {stat.value}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full mb-4 sm:mb-6 border border-slate-200">
              <Award className="w-4 h-4 text-slate-700" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Why Choose Us
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose DestinyPal?
            </h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-slate-700 to-yellow-400 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              We've built a platform that makes educational sponsorship simple,
              transparent, and impactful.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-xl sm:rounded-2xl mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2 sm:mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
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
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
              How It Works
            </h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-slate-700 to-yellow-400 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
              Getting started with DestinyPal is simple. Here's how you can make
              a difference today.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={index}
                className="text-center bg-white/5 rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 hover:bg-white/10 hover:border-yellow-400/30 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-800 text-yellow-400 rounded-2xl sm:rounded-3xl text-xl sm:text-3xl font-bold mb-5 sm:mb-6 shadow-2xl">
                  {item.step}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                  {item.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10 sm:mt-12">
            <button
              onClick={onNavigateToRegister}
              className="bg-slate-700 hover:bg-slate-800 text-yellow-400 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-2xl hover:shadow-yellow-500/30 hover:-translate-y-1 inline-flex items-center gap-2"
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
            <div className="inline-flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full mb-4 sm:mb-6 border border-slate-200">
              <Star className="w-4 h-4 text-slate-700 fill-slate-700" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800">
                Testimonials
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              What Our Community Says
            </h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-slate-700 to-yellow-400 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Real stories from sponsors, students, and institutions who are
              part of the DestinyPal family.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-yellow-300 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex gap-1 mb-4 sm:mb-5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-5 sm:mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center text-yellow-400 font-bold text-sm sm:text-base shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm sm:text-base">
                      {testimonial.name}
                    </p>
                    <p className="text-xs sm:text-sm text-slate-700 font-medium">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Our Trusted Partners
            </h2>
            <p className="text-gray-600">
              Collaborating with leading educational institutions and
              organizations across Africa
            </p>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex animate-scroll-rtl whitespace-nowrap"
              onMouseEnter={(e) =>
                (e.currentTarget.style.animationPlayState = "paused")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.animationPlayState = "running")
              }
            >
              {[...PARTNERS, ...PARTNERS, ...PARTNERS].map((partner, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 mx-6 sm:mx-10 flex items-center justify-center"
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="h-12 sm:h-16 object-contain transition-all duration-300 hover:scale-110"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Our Generous Sponsors
            </h2>
            <p className="text-gray-600">
              Meet the individuals making a real difference in students' lives
            </p>
          </div>

          <div className="overflow-hidden">
            <div
              className="flex animate-scroll-rtl-fast gap-6 whitespace-nowrap"
              onMouseEnter={(e) =>
                (e.currentTarget.style.animationPlayState = "paused")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.animationPlayState = "running")
              }
            >
              {[...SPONSORS, ...SPONSORS, ...SPONSORS].map((sponsor, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 w-72 bg-gradient-to-br from-slate-50 to-gray-100 rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  <div className="relative">
                    <img
                      src={sponsor.image}
                      alt={sponsor.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold text-white shadow-lg ${
                          sponsor.tier === "Gold"
                            ? "bg-yellow-500"
                            : sponsor.tier === "Silver"
                            ? "bg-gray-400"
                            : "bg-orange-600"
                        }`}
                      >
                        {sponsor.tier} Sponsor
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {sponsor.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{sponsor.info}</p>
                    <p className="text-sm font-medium text-slate-700">
                      {sponsor.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white pt-12 sm:pt-16 lg:pt-20 pb-0">
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-300/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-slate-100/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 sm:mb-8 border border-slate-200">
            <Heart className="w-4 h-4 text-slate-700" />
            <span className="text-xs sm:text-sm font-semibold text-slate-800">
              Make a Difference Today
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4 sm:mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of sponsors and help students achieve their dreams
            through education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 pb-12 sm:pb-16 lg:pb-20">
            <button
              onClick={onNavigateToRegister}
              className="w-full sm:w-auto bg-slate-700 hover:bg-slate-800 text-yellow-400 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all shadow-2xl hover:shadow-yellow-500/30 hover:-translate-y-1 inline-flex items-center justify-center gap-2 text-base sm:text-lg"
            >
              <CheckCircle className="w-5 h-5" />
              Become a Sponsor
            </button>
            <button
              onClick={onNavigateToContact}
              className="w-full sm:w-auto border-2 border-slate-300 text-slate-700 hover:bg-slate-100 hover:border-slate-400 px-8 py-4 rounded-xl sm:rounded-2xl font-bold transition-all text-base sm:text-lg"
            >
              Contact Us
            </button>
          </div>
        </div>
      </section>

      <footer className="bg-gradient-to-br from-slate-800 to-slate-900 pt-6 md:pt-12 pb-4 md:pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout - Compact and left-aligned */}
          <div className="md:hidden space-y-8">
            {/* Logo and Description - centered (as in reference image) */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Heart className="w-4 h-4 text-slate-800 fill-slate-800" />
                </div>
                <span className="text-base font-bold text-white">
                  DestinyPal
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                DestinyPal empowers underprivileged individuals and communities
                through education, youth development, and community support
                programs.
              </p>
            </div>

            {/* Useful Links and Get In Touch - two columns, left-aligned content */}
            <div className="grid grid-cols-2 gap-6">
              {/* Useful Links */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">
                  Useful Links
                </h3>
                <nav aria-label="Footer useful links">
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={onNavigateToRegister}
                        className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                        aria-label="Navigate to sponsor a student page"
                      >
                        Sponsor a Student
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onNavigateToDonate}
                        className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                        aria-label="Navigate to make a donation page"
                      >
                        Make a Donation
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onNavigateToAbout}
                        className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                        aria-label="Navigate to about us page"
                      >
                        About Us
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={onNavigateToContact}
                        className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                        aria-label="Navigate to contact us page"
                      >
                        Contact Us
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Get In Touch */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm">
                  Get In Touch
                </h3>
                <address className="not-italic space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <MapPin
                      className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <p className="text-gray-300">
                      DestinyPal, Nairobi
                      <br />
                      Westlands, ABC Place, 5th Floor
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail
                      className="w-4 h-4 text-yellow-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <a
                      href="mailto:support@destinypal.org"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                    >
                      support@destinypal.org
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone
                      className="w-4 h-4 text-yellow-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <a
                      href="tel:+254700123456"
                      className="text-yellow-400 hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                    >
                      +254 700 123 456
                    </a>
                  </div>
                </address>
              </div>
            </div>

            {/* Social Icons - centered */}
            <div className="flex justify-center gap-4">
              <a
                href="#"
                className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Follow us on Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Follow us on X (Twitter)"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Connect with us on LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Subscribe to our YouTube channel"
              >
                <Youtube className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                aria-label="Follow us on Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Desktop Layout - unchanged except accessibility improvements */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                  <Heart
                    className="w-4 h-4 text-slate-800 fill-slate-800"
                    aria-hidden="true"
                  />
                </div>
                <span className="text-base font-bold text-white">
                  DestinyPal
                </span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                DestinyPal empowers underprivileged individuals and communities
                through education, youth development, and community support
                programs.
              </p>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">
                Useful Links
              </h3>
              <nav aria-label="Footer useful links">
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={onNavigateToRegister}
                      className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                      aria-label="Navigate to sponsor a student page"
                    >
                      Sponsor a Student
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateToDonate}
                      className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                      aria-label="Navigate to make a donation page"
                    >
                      Make a Donation
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateToAbout}
                      className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                      aria-label="Navigate to about us page"
                    >
                      About Us
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={onNavigateToContact}
                      className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                      aria-label="Navigate to contact us page"
                    >
                      Contact Us
                    </button>
                  </li>
                </ul>
              </nav>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3 text-sm md:text-base">
                Get In Touch
              </h3>
              <address className="not-italic space-y-2 mb-4 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin
                    className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <p className="text-gray-300">
                    DestinyPal, Nairobi
                    <br />
                    Westlands, ABC Place, 5th Floor
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Mail
                    className="w-4 h-4 text-yellow-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="mailto:support@destinypal.org"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                  >
                    support@destinypal.org
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone
                    className="w-4 h-4 text-yellow-400 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <a
                    href="tel:+254700123456"
                    className="text-yellow-400 hover:text-yellow-300 transition-colors focus:outline-none focus:underline"
                  >
                    +254 700 123 456
                  </a>
                </div>
              </address>

              <div className="flex gap-3">
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Follow us on X (Twitter)"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Connect with us on LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube className="w-4 h-4" />
                </a>
                <a
                  href="#"
                  className="w-9 h-9 bg-slate-700 hover:bg-yellow-400 text-white hover:text-slate-800 rounded-full flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-slate-700 pt-4 md:pt-6">
            <p className="text-center text-xs md:text-sm text-gray-400">
              © 2025 – DestinyPal | All Rights Reserved
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <LandingPage
      onNavigateToLogin={() => console.log("Navigate to login")}
      onNavigateToRegister={() => console.log("Navigate to register")}
      onNavigateToAbout={() => console.log("Navigate to about")}
      onNavigateToContact={() => console.log("Navigate to contact")}
      onNavigateToDonate={() => console.log("Navigate to donate")}
    />
  );
}

export default App;
