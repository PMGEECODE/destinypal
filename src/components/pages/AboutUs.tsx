import { Heart, Users, GraduationCap, Building2, Target, Eye, Award, ArrowLeft, BookOpen, Lightbulb } from "lucide-react"

interface AboutUsProps {
  onBack?: () => void
}

const STATS = [
  { icon: Users, value: "5,000+", label: "Students Supported" },
  { icon: Heart, value: "1,200+", label: "Active Sponsors" },
  { icon: Building2, value: "50+", label: "Partner Institutions" },
  { icon: GraduationCap, value: "92%", label: "Graduation Rate" },
]

const TEAM_MEMBERS = [
  {
    name: "Dr. Sarah Kimani",
    role: "Founder & Chief Executive Officer",
    bio: "Former educator with 20+ years of experience in educational development across East Africa.",
    image: "https://images.pexels.com/photos/3184287/pexels-photo-3184287.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "James Ochieng",
    role: "Chief Operations Officer",
    bio: "Expert in nonprofit operations with a passion for sustainable educational solutions.",
    image: "https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "Grace Muthoni",
    role: "Head of Partnerships",
    bio: "Building bridges between institutions, sponsors, and students for maximum impact.",
    image: "https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
  {
    name: "David Wanjiru",
    role: "Technology Director",
    bio: "Leading our digital transformation to connect more students with opportunities.",
    image: "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400",
  },
]

const VALUES = [
  {
    icon: Target,
    title: "Mission-Driven",
    description: "Every decision we make is guided by our commitment to educational access and student success.",
  },
  {
    icon: Eye,
    title: "Transparency",
    description: "We maintain complete transparency in how funds are allocated and how impact is measured.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We strive for excellence in everything we do, from student support to sponsor relations.",
  },
  {
    icon: Heart,
    title: "Compassion",
    description: "We approach every student's journey with empathy, understanding, and genuine care.",
  },
]

const IMPACT_STORIES = [
  {
    image: "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Student Success",
    description: "Empowering bright minds to achieve their full academic potential"
  },
  {
    image: "https://images.pexels.com/photos/8500514/pexels-photo-8500514.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Community Support",
    description: "Building networks of sponsors who believe in educational transformation"
  },
  {
    image: "https://images.pexels.com/photos/8500536/pexels-photo-8500536.jpeg?auto=compress&cs=tinysrgb&w=800",
    title: "Educational Excellence",
    description: "Partnering with institutions committed to quality education"
  },
]

export function AboutUs({ onBack }: AboutUsProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50/40 to-orange-50">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-orange-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center gap-3 sm:gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl hover:bg-orange-100 transition-all duration-300 active:scale-95"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5 text-slate-700" />
              </button>
            )}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-xl shadow-lg">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                DestinyPal
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Background */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.pexels.com/photos/5212320/pexels-photo-5212320.jpeg?auto=compress&cs=tinysrgb&w=1600"
            alt="Students learning together"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-orange-50/80 via-amber-50/90 to-orange-50"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg mb-6 sm:mb-8">
              <Lightbulb className="w-4 h-4 text-orange-600" />
              <span className="text-xs sm:text-sm font-semibold text-orange-800">Transforming Lives Since 2020</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight">
              Transforming Lives Through
              <span className="block mt-2 bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                The Power of Education
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-700 leading-relaxed mb-8 sm:mb-10 px-4">
              DestinyPal is a platform dedicated to connecting deserving students with sponsors and institutions, creating
              pathways to educational success and brighter futures for all.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl sm:rounded-2xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 text-sm sm:text-base">
                Join Our Mission
              </button>
              <button className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-orange-600 rounded-xl sm:rounded-2xl font-semibold border-2 border-orange-300 hover:bg-orange-50 hover:shadow-lg transition-all duration-300 text-sm sm:text-base">
                Watch Our Story
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* Stats Section */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {STATS.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 text-center shadow-lg border border-orange-200/50 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Icon className="w-5 h-5 sm:w-7 sm:h-7" />
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-orange-600 to-amber-600 bg-clip-text text-transparent mb-1 sm:mb-2">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 font-medium">{stat.label}</p>
              </div>
            )
          })}
        </section>

        {/* Impact Stories with Images */}
        <section>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Our Impact in Action</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              See how we are making a real difference in communities across the region
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {IMPACT_STORIES.map((story, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-orange-100"
              >
                <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/20 to-transparent"></div>
                </div>
                <div className="p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{story.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{story.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story Section */}
        <section className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          <div className="order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-full mb-4 sm:mb-6">
              <BookOpen className="w-4 h-4 text-orange-600" />
              <span className="text-xs sm:text-sm font-semibold text-orange-800">Our Journey</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">The Story Behind DestinyPal</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full mb-5 sm:mb-7"></div>

            <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                Founded in 2020, DestinyPal emerged from a simple yet powerful observation: countless talented students
                across Africa lack access to quality education not due to ability, but due to financial constraints.
              </p>
              <p>
                Our founder, Dr. Sarah Kimani, witnessed firsthand how financial barriers prevented promising students
                from pursuing their dreams. This inspired her to create a platform that would bridge the gap between
                those who want to help and those who need support.
              </p>
              <p>
                Today, DestinyPal has grown into a comprehensive platform connecting sponsors, students, and educational
                institutions. We have facilitated thousands of sponsorships and helped students across multiple
                countries achieve their educational goals.
              </p>
              <p className="font-semibold text-orange-700 bg-orange-50 p-4 rounded-xl border-l-4 border-orange-600">
                Every student we support represents a family lifted, a community strengthened, and a future brightened.
              </p>
            </div>
          </div>

          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/8500544/pexels-photo-8500544.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students collaborating on educational project"
                className="w-full h-64 sm:h-80 lg:h-96 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-orange-900/30 to-transparent"></div>
            </div>

            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white p-4 sm:p-6 rounded-2xl shadow-2xl border border-orange-200 max-w-xs">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-3 rounded-xl">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-900">Our Purpose</p>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1">Education for everyone</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="bg-gradient-to-br from-white via-orange-50/30 to-white rounded-3xl p-6 sm:p-10 lg:p-14 shadow-2xl border border-orange-200/50">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 lg:gap-16">
            <div className="relative">
              <div className="absolute -top-3 -left-3 w-20 h-20 bg-gradient-to-br from-orange-500/20 to-amber-500/20 rounded-full blur-2xl"></div>
              <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-orange-100">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-2xl mb-5 sm:mb-6 shadow-lg">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 sm:mb-5">Our Mission</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  To democratize access to education by creating a transparent, efficient, and impactful platform that
                  connects sponsors with students in need, ensuring every donation makes a meaningful difference in a
                  student's educational journey.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-full blur-2xl"></div>
              <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-orange-100">
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-2xl mb-5 sm:mb-6 shadow-lg">
                  <Eye className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-4 sm:mb-5">Our Vision</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  A world where no student is denied education due to financial constraints. We envision communities
                  transformed through the power of education, where every young person has the opportunity to pursue their
                  dreams and contribute to society.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Our Core Values</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              The principles that guide everything we do at DestinyPal
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {VALUES.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-xl sm:rounded-2xl mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-3">{value.title}</h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{value.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Team Section */}
        <section>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">Meet Our Leadership Team</h2>
            <div className="w-16 sm:w-20 h-1.5 bg-gradient-to-r from-orange-600 to-amber-600 rounded-full mx-auto mb-3 sm:mb-4"></div>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              A dedicated team of professionals committed to making educational access a reality for all students
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
            {TEAM_MEMBERS.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-orange-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 group"
              >
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
                </div>
                <div className="p-5 sm:p-6 text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-1 sm:mb-2">{member.name}</h3>
                  <p className="text-xs sm:text-sm text-orange-600 font-semibold mb-3 sm:mb-4">{member.role}</p>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Video Section */}
        <section className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-0">
            <div className="relative h-64 sm:h-80 lg:h-full min-h-[300px] bg-gradient-to-br from-orange-600 to-amber-700">
              <img
                src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Students celebrating success"
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
                  <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-600 border-b-8 border-b-transparent ml-1"></div>
                </button>
              </div>
            </div>
            <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
                See Our Impact Through Student Stories
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed mb-6 sm:mb-8">
                Watch how DestinyPal has transformed the lives of students across Africa. From struggling to afford school fees to graduating with honors, these are the stories that drive our mission forward every single day.
              </p>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-fit">
                <span>Watch Full Documentary</span>
                <ArrowLeft className="w-5 h-5 rotate-180" />
              </button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-amber-600 to-orange-700 rounded-3xl p-8 sm:p-12 lg:p-16 text-center shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/30 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 sm:mb-8">
              <Heart className="w-4 h-4 text-white" />
              <span className="text-xs sm:text-sm font-semibold text-white">Make a Difference Today</span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">Join Our Mission</h2>
            <p className="text-base sm:text-lg md:text-xl text-orange-50 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-4">
              Whether you are a sponsor looking to make a difference, a student seeking support, or an institution wanting
              to partner with us, we would love to hear from you and explore how we can work together.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-5 px-4">
              <button
                onClick={onBack}
                className="px-6 sm:px-10 py-3 sm:py-4 bg-white text-orange-600 rounded-xl sm:rounded-2xl font-bold hover:bg-orange-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-sm sm:text-base"
              >
                Become a Sponsor
              </button>
              <button
                className="px-6 sm:px-10 py-3 sm:py-4 bg-orange-800/40 backdrop-blur-sm text-white border-2 border-white/50 rounded-xl sm:rounded-2xl font-bold hover:bg-orange-800/60 transition-all duration-300 hover:shadow-xl text-sm sm:text-base"
              >
                Apply for Support
              </button>
              <button
                className="px-6 sm:px-10 py-3 sm:py-4 bg-transparent border-2 border-white text-white rounded-xl sm:rounded-2xl font-bold hover:bg-white/10 transition-all duration-300 text-sm sm:text-base"
              >
                Partner With Us
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 to-slate-800 text-slate-400 py-8 sm:py-12 mt-12 sm:mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 sm:mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-600 p-2 rounded-xl">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-white">DestinyPal</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connecting students with opportunities and transforming lives through education.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Quick Links</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Our Impact</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Get Involved</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Students</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Apply for Support</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Success Stories</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Resources</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQs</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">For Sponsors</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Become a Sponsor</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Impact Reports</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Sponsor Portal</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Partnership Opportunities</a></li>
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
