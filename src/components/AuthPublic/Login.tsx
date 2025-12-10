// // // import type React from "react"
// // // import { useState } from "react"
// // // import { useAuth } from "./AuthContext"
// // // import { validateEmail } from "./utils/validation"
// // // import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle } from "lucide-react"

// // // interface LoginProps {
// // //   onForgotPassword?: () => void
// // //   onRegister?: () => void
// // //   onSuccess?: () => void
// // //   onTwoFactorRequired?: () => void
// // // }

// // // export function Login({ onForgotPassword, onRegister, onSuccess, onTwoFactorRequired }: LoginProps) {
// // //   const { login, isLoading, error, clearError } = useAuth()

// // //   const [email, setEmail] = useState("")
// // //   const [password, setPassword] = useState("")
// // //   const [showPassword, setShowPassword] = useState(false)
// // //   const [rememberMe, setRememberMe] = useState(false)
// // //   const [formError, setFormError] = useState("")

// // //   const handleSubmit = async (e: React.FormEvent) => {
// // //     e.preventDefault()
// // //     setFormError("")
// // //     clearError()

// // //     if (!email.trim()) {
// // //       setFormError("Email is required")
// // //       return
// // //     }
// // //     if (!validateEmail(email)) {
// // //       setFormError("Please enter a valid email address")
// // //       return
// // //     }
// // //     if (!password) {
// // //       setFormError("Password is required")
// // //       return
// // //     }

// // //     try {
// // //       const result = await login(email, password)

// // //       if (result.requiresTwoFactor) {
// // //         onTwoFactorRequired?.()
// // //       } else {
// // //         onSuccess?.()
// // //       }
// // //     } catch (err: any) {
// // //       setFormError(err.message || "Login failed. Please try again.")
// // //     }
// // //   }

// // //   const displayError = formError || error

// // //   return (
// // //     <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col lg:flex-row lg:items-stretch">
// // //       {/* Left Section - Hero (Hidden on Mobile) */}
// // //       <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:justify-center lg:items-center lg:p-12 lg:bg-gradient-to-br lg:from-blue-600 lg:to-cyan-600 lg:text-white">
// // //         <div className="max-w-lg">
// // //           <div className="mb-8">
// // //             <h2 className="text-4xl font-bold mb-4">Welcome to DestinyPal</h2>
// // //             <p className="text-xl text-blue-50 leading-relaxed">
// // //               Transforming lives through education. Sign in to manage your account and track your impact.
// // //             </p>
// // //           </div>

// // //           <div className="space-y-6 mt-12">
// // //             <div className="flex gap-4">
// // //               <div className="flex-shrink-0">
// // //                 <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/30">
// // //                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
// // //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
// // //                   </svg>
// // //                 </div>
// // //               </div>
// // //               <div>
// // //                 <h3 className="text-lg font-semibold mb-1">Secure Access</h3>
// // //                 <p className="text-blue-100">Your account is protected with industry-standard encryption</p>
// // //               </div>
// // //             </div>

// // //             <div className="flex gap-4">
// // //               <div className="flex-shrink-0">
// // //                 <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/30">
// // //                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
// // //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
// // //                   </svg>
// // //                 </div>
// // //               </div>
// // //               <div>
// // //                 <h3 className="text-lg font-semibold mb-1">Real Impact</h3>
// // //                 <p className="text-blue-100">Track the difference you're making in students' lives</p>
// // //               </div>
// // //             </div>

// // //             <div className="flex gap-4">
// // //               <div className="flex-shrink-0">
// // //                 <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-blue-500/30">
// // //                   <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20">
// // //                     <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
// // //                   </svg>
// // //                 </div>
// // //               </div>
// // //               <div>
// // //                 <h3 className="text-lg font-semibold mb-1">24/7 Support</h3>
// // //                 <p className="text-blue-100">Our team is here to help whenever you need assistance</p>
// // //               </div>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Right Section - Login Form */}
// // //       <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 lg:p-12">
// // //         <div className="w-full max-w-sm">
// // //           {/* Mobile Header */}
// // //           <div className="lg:hidden mb-6 sm:mb-8">
// // //             <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
// // //               <span className="text-xl font-bold text-white">D</span>
// // //             </div>
// // //             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign in</h1>
// // //             <p className="text-sm sm:text-base text-slate-600 mt-1">Access your DestinyPal account</p>
// // //           </div>

// // //           {/* Desktop Header */}
// // //           <div className="hidden lg:block mb-8">
// // //             <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign in to your account</h1>
// // //             <p className="text-slate-600">Continue managing your impact</p>
// // //           </div>

// // //           {/* Login Card */}
// // //           <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:shadow-xl lg:p-8">
// // //             {/* Error Display */}
// // //             {displayError && (
// // //               <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs sm:text-sm">
// // //                 <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
// // //                 <span>{displayError}</span>
// // //               </div>
// // //             )}

// // //             {/* Login Form */}
// // //             <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
// // //               {/* Email Field */}
// // //               <div>
// // //                 <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
// // //                   Email address
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
// // //                   <input
// // //                     id="email"
// // //                     type="email"
// // //                     value={email}
// // //                     onChange={(e) => setEmail(e.target.value)}
// // //                     placeholder="you@example.com"
// // //                     className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
// // //                     disabled={isLoading}
// // //                   />
// // //                 </div>
// // //               </div>

// // //               {/* Password Field */}
// // //               <div>
// // //                 <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
// // //                   Password
// // //                 </label>
// // //                 <div className="relative">
// // //                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
// // //                   <input
// // //                     id="password"
// // //                     type={showPassword ? "text" : "password"}
// // //                     value={password}
// // //                     onChange={(e) => setPassword(e.target.value)}
// // //                     placeholder="Enter your password"
// // //                     className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
// // //                     disabled={isLoading}
// // //                   />
// // //                   <button
// // //                     type="button"
// // //                     onClick={() => setShowPassword(!showPassword)}
// // //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
// // //                     tabIndex={-1}
// // //                     disabled={isLoading}
// // //                   >
// // //                     {showPassword ? (
// // //                       <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
// // //                     ) : (
// // //                       <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
// // //                     )}
// // //                   </button>
// // //                 </div>
// // //               </div>

// // //               {/* Remember Me & Forgot Password */}
// // //               <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
// // //                 <label className="flex items-center gap-2 cursor-pointer">
// // //                   <input
// // //                     type="checkbox"
// // //                     checked={rememberMe}
// // //                     onChange={(e) => setRememberMe(e.target.checked)}
// // //                     className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
// // //                     disabled={isLoading}
// // //                   />
// // //                   <span className="text-slate-600">Remember me</span>
// // //                 </label>
// // //                 <button
// // //                   type="button"
// // //                   onClick={onForgotPassword}
// // //                   className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
// // //                   disabled={isLoading}
// // //                 >
// // //                   Forgot?
// // //                 </button>
// // //               </div>

// // //               {/* Submit Button */}
// // //               <button
// // //                 type="submit"
// // //                 disabled={isLoading}
// // //                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-6"
// // //               >
// // //                 {isLoading ? (
// // //                   <>
// // //                     <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
// // //                     <span>Signing in...</span>
// // //                   </>
// // //                 ) : (
// // //                   "Sign in"
// // //                 )}
// // //               </button>
// // //             </form>

// // //             {/* Register Link */}
// // //             <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
// // //               Don't have an account?{" "}
// // //               <button
// // //                 onClick={onRegister}
// // //                 disabled={isLoading}
// // //                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
// // //               >
// // //                 Create one
// // //               </button>
// // //             </p>
// // //           </div>

// // //           {/* Footer */}
// // //           <p className="mt-5 sm:mt-6 text-center text-xs text-slate-500 px-2">
// // //             By signing in, you agree to our{" "}
// // //             <a href="#" className="text-blue-600 hover:underline">
// // //               Terms of Service
// // //             </a>{" "}
// // //             and{" "}
// // //             <a href="#" className="text-blue-600 hover:underline">
// // //               Privacy Policy
// // //             </a>
// // //           </p>
// // //         </div>
// // //       </div>
// // //     </div>
// // //   )
// // // }

// // "use client"

// // import type React from "react"
// // import { useState, useEffect } from "react"
// // import { useAuth } from "./AuthContext"
// // import { validateEmail } from "./utils/validation"
// // import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react"

// // interface LoginProps {
// //   onForgotPassword?: () => void
// //   onRegister?: () => void
// //   onSuccess?: () => void
// //   onTwoFactorRequired?: () => void
// //   onNavigateToTerms?: () => void
// //   onNavigateToPrivacy?: () => void
// //   onNavigateToAbout?: () => void
// //   onNavigateToContact?: () => void
// //   onNavigateToLanding?: () => void
// // }

// // interface CarouselImage {
// //   url: string
// //   title: string
// //   description: string
// // }

// // const CAROUSEL_IMAGES: CarouselImage[] = [
// //   {
// //     url: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Connecting Students",
// //     description: "Bridging the gap between aspiring students and opportunity",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Education Empowerment",
// //     description: "Transforming lives through quality education and mentorship",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Sponsor Impact",
// //     description: "Your support creates lasting change in communities",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Institutional Excellence",
// //     description: "Partnering with leading institutions for excellence",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Success Stories",
// //     description: "Celebrating achievements and building futures",
// //   },
// // ]

// // export function Login({
// //   onForgotPassword,
// //   onRegister,
// //   onSuccess,
// //   onTwoFactorRequired,
// //   onNavigateToTerms,
// //   onNavigateToPrivacy,
// //   onNavigateToLanding,
// // }: LoginProps) {
// //   const { login, isLoading, error, clearError } = useAuth()

// //   const [email, setEmail] = useState("")
// //   const [password, setPassword] = useState("")
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [rememberMe, setRememberMe] = useState(false)
// //   const [formError, setFormError] = useState("")
// //   const [currentImageIndex, setCurrentImageIndex] = useState(0)

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
// //     }, 5000)

// //     return () => clearInterval(interval)
// //   }, [])

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setFormError("")
// //     clearError()

// //     if (!email.trim()) {
// //       setFormError("Email is required")
// //       return
// //     }
// //     if (!validateEmail(email)) {
// //       setFormError("Please enter a valid email address")
// //       return
// //     }
// //     if (!password) {
// //       setFormError("Password is required")
// //       return
// //     }

// //     try {
// //       const result = await login(email, password)

// //       if (result.requiresTwoFactor) {
// //         onTwoFactorRequired?.()
// //       } else {
// //         onSuccess?.()
// //       }
// //     } catch (err: any) {
// //       setFormError(err.message || "Login failed. Please try again.")
// //     }
// //   }

// //   const displayError = formError || error

// //   return (
// //     <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col lg:flex-row lg:items-stretch">
// //       {/* Left Section - Image Carousel (Hidden on Mobile) */}
// //       <div className="hidden lg:flex lg:w-1/2 lg:relative lg:overflow-hidden">
// //         {CAROUSEL_IMAGES.map((image, index) => (
// //           <div
// //             key={index}
// //             className={`absolute inset-0 transition-opacity duration-1000 ${
// //               index === currentImageIndex ? "opacity-100" : "opacity-0"
// //             }`}
// //           >
// //             <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-full object-cover" />
// //           </div>
// //         ))}

// //         {/* Dark Overlay */}
// //         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-blue-600/50 to-cyan-600/40" />

// //         {/* Content */}
// //         <div className="relative z-10 flex flex-col justify-center items-center p-12">
// //           <div className="max-w-lg text-center">
// //             <div className="mb-8">
// //               <h2 className="text-5xl font-bold text-white mb-4">Welcome to DestinyPal</h2>
// //               <p className="text-xl text-blue-50 leading-relaxed">
// //                 Connecting students with opportunity through institutions and sponsors
// //               </p>
// //             </div>

// //             {/* Carousel Content */}
// //             <div className="mt-16 space-y-4">
// //               <h3 className="text-3xl font-bold text-white">{CAROUSEL_IMAGES[currentImageIndex].title}</h3>
// //               <p className="text-lg text-blue-50">{CAROUSEL_IMAGES[currentImageIndex].description}</p>
// //             </div>

// //             {/* Carousel Indicators */}
// //             <div className="mt-12 flex justify-center gap-2">
// //               {CAROUSEL_IMAGES.map((_, index) => (
// //                 <button
// //                   key={index}
// //                   onClick={() => setCurrentImageIndex(index)}
// //                   className={`h-2 rounded-full transition-all ${
// //                     index === currentImageIndex ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/60"
// //                   }`}
// //                   aria-label={`Go to slide ${index + 1}`}
// //                 />
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Right Section - Login Form */}
// //       <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 lg:p-12">
// //         <div className="w-full max-w-sm">
// //           {onNavigateToLanding && (
// //             <button
// //               onClick={onNavigateToLanding}
// //               className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
// //             >
// //               <ArrowLeft className="w-4 h-4" />
// //               <span className="text-sm font-medium">Back to Home</span>
// //             </button>
// //           )}

// //           {/* Mobile Header */}
// //           <div className="lg:hidden mb-6 sm:mb-8">
// //             <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
// //               <span className="text-xl font-bold text-white">D</span>
// //             </div>
// //             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign in</h1>
// //             <p className="text-sm sm:text-base text-slate-600 mt-1">Access your DestinyPal account</p>
// //           </div>

// //           {/* Desktop Header */}
// //           <div className="hidden lg:block mb-8">
// //             <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign in to your account</h1>
// //             <p className="text-slate-600">Continue managing your impact</p>
// //           </div>

// //           {/* Login Card */}
// //           <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:shadow-xl lg:p-8">
// //             {/* Error Display */}
// //             {displayError && (
// //               <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs sm:text-sm">
// //                 <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
// //                 <span>{displayError}</span>
// //               </div>
// //             )}

// //             {/* Login Form */}
// //             <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
// //               {/* Email Field */}
// //               <div>
// //                 <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
// //                   Email address
// //                 </label>
// //                 <div className="relative">
// //                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
// //                   <input
// //                     id="email"
// //                     type="email"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     placeholder="you@example.com"
// //                     className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
// //                     disabled={isLoading}
// //                   />
// //                 </div>
// //               </div>

// //               {/* Password Field */}
// //               <div>
// //                 <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
// //                   Password
// //                 </label>
// //                 <div className="relative">
// //                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
// //                   <input
// //                     id="password"
// //                     type={showPassword ? "text" : "password"}
// //                     value={password}
// //                     onChange={(e) => setPassword(e.target.value)}
// //                     placeholder="Enter your password"
// //                     className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
// //                     disabled={isLoading}
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
// //                     tabIndex={-1}
// //                     disabled={isLoading}
// //                   >
// //                     {showPassword ? (
// //                       <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
// //                     ) : (
// //                       <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
// //                     )}
// //                   </button>
// //                 </div>
// //               </div>

// //               {/* Remember Me & Forgot Password */}
// //               <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
// //                 <label className="flex items-center gap-2 cursor-pointer">
// //                   <input
// //                     type="checkbox"
// //                     checked={rememberMe}
// //                     onChange={(e) => setRememberMe(e.target.checked)}
// //                     className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
// //                     disabled={isLoading}
// //                   />
// //                   <span className="text-slate-600">Remember me</span>
// //                 </label>
// //                 <button
// //                   type="button"
// //                   onClick={onForgotPassword}
// //                   className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
// //                   disabled={isLoading}
// //                 >
// //                   Forgot?
// //                 </button>
// //               </div>

// //               {/* Submit Button */}
// //               <button
// //                 type="submit"
// //                 disabled={isLoading}
// //                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-6"
// //               >
// //                 {isLoading ? (
// //                   <>
// //                     <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
// //                     <span>Signing in...</span>
// //                   </>
// //                 ) : (
// //                   "Sign in"
// //                 )}
// //               </button>
// //             </form>

// //             {/* Register Link */}
// //             <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
// //               Don't have an account?{" "}
// //               <button
// //                 onClick={onRegister}
// //                 disabled={isLoading}
// //                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
// //               >
// //                 Create one
// //               </button>
// //             </p>
// //           </div>

// //           <p className="mt-5 sm:mt-6 text-center text-xs text-slate-500 px-2">
// //             By signing in, you agree to our{" "}
// //             <button onClick={onNavigateToTerms} className="text-blue-600 hover:underline">
// //               Terms of Service
// //             </button>{" "}
// //             and{" "}
// //             <button onClick={onNavigateToPrivacy} className="text-blue-600 hover:underline">
// //               Privacy Policy
// //             </button>
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // "use client"

// // import type React from "react"
// // import { useState, useEffect } from "react"
// // import { useAuth } from "./AuthContext"
// // import { validateEmail } from "./utils/validation"
// // import { Eye, EyeOff, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from "lucide-react"

// // interface LoginProps {
// //   onForgotPassword?: () => void
// //   onRegister?: () => void
// //   onSuccess?: () => void
// //   onTwoFactorRequired?: () => void
// //   onNavigateToTerms?: () => void
// //   onNavigateToPrivacy?: () => void
// //   onNavigateToAbout?: () => void
// //   onNavigateToContact?: () => void
// //   onNavigateToLanding?: () => void
// // }

// // interface CarouselImage {
// //   url: string
// //   title: string
// //   description: string
// // }

// // const CAROUSEL_IMAGES: CarouselImage[] = [
// //   {
// //     url: "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Connecting Students",
// //     description: "Bridging the gap between aspiring students and opportunity",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Education Empowerment",
// //     description: "Transforming lives through quality education and mentorship",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Sponsor Impact",
// //     description: "Your support creates lasting change in communities",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Institutional Excellence",
// //     description: "Partnering with leading institutions for excellence",
// //   },
// //   {
// //     url: "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1200&h=700&fit=crop",
// //     title: "Success Stories",
// //     description: "Celebrating achievements and building futures",
// //   },
// // ]

// // export function Login({
// //   onForgotPassword,
// //   onRegister,
// //   onSuccess,
// //   onTwoFactorRequired,
// //   onNavigateToTerms,
// //   onNavigateToPrivacy,
// //   onNavigateToLanding,
// // }: LoginProps) {
// //   const { login, isLoading, error, clearError } = useAuth()

// //   const [email, setEmail] = useState("")
// //   const [password, setPassword] = useState("")
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [rememberMe, setRememberMe] = useState(false)
// //   const [formError, setFormError] = useState("")
// //   const [currentImageIndex, setCurrentImageIndex] = useState(0)

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
// //     }, 5000)

// //     return () => clearInterval(interval)
// //   }, [])

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setFormError("")
// //     clearError()

// //     if (!email.trim()) {
// //       setFormError("Email is required")
// //       return
// //     }
// //     if (!validateEmail(email)) {
// //       setFormError("Please enter a valid email address")
// //       return
// //     }
// //     if (!password) {
// //       setFormError("Password is required")
// //       return
// //     }

// //     try {
// //       const result = await login(email, password)

// //       if (result.requiresTwoFactor) {
// //         onTwoFactorRequired?.()
// //       } else {
// //         onSuccess?.()
// //       }
// //     } catch (err: any) {
// //       setFormError(err.message || "Login failed. Please try again.")
// //     }
// //   }

// //   const displayError = formError || error

// //   return (
// //     <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex flex-col lg:flex-row lg:items-stretch">
// //       {/* Left Section - Image Carousel (Hidden on Mobile) */}
// //       <div className="hidden lg:flex lg:w-1/2 lg:relative lg:overflow-hidden">
// //         {CAROUSEL_IMAGES.map((image, index) => (
// //           <div
// //             key={index}
// //             className={`absolute inset-0 transition-opacity duration-1000 ${
// //               index === currentImageIndex ? "opacity-100" : "opacity-0"
// //             }`}
// //           >
// //             <img src={image.url || "/placeholder.svg"} alt={image.title} className="w-full h-full object-cover" />
// //           </div>
// //         ))}

// //         {/* Dark Overlay */}
// //         <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 via-blue-600/50 to-cyan-600/40" />

// //         {/* Content */}
// //         <div className="relative z-10 flex flex-col justify-center items-center p-12">
// //           <div className="max-w-lg text-center">
// //             <div className="mb-8">
// //               <h2 className="text-5xl font-bold text-white mb-4">Welcome to DestinyPal</h2>
// //               <p className="text-xl text-blue-50 leading-relaxed">
// //                 Connecting students with opportunity through institutions and sponsors
// //               </p>
// //             </div>

// //             {/* Carousel Content */}
// //             <div className="mt-16 space-y-4">
// //               <h3 className="text-3xl font-bold text-white">{CAROUSEL_IMAGES[currentImageIndex].title}</h3>
// //               <p className="text-lg text-blue-50">{CAROUSEL_IMAGES[currentImageIndex].description}</p>
// //             </div>

// //             {/* Carousel Indicators */}
// //             <div className="mt-12 flex justify-center gap-2">
// //               {CAROUSEL_IMAGES.map((_, index) => (
// //                 <button
// //                   key={index}
// //                   onClick={() => setCurrentImageIndex(index)}
// //                   className={`h-2 rounded-full transition-all ${
// //                     index === currentImageIndex ? "bg-white w-8" : "bg-white/40 w-2 hover:bg-white/60"
// //                   }`}
// //                   aria-label={`Go to slide ${index + 1}`}
// //                 />
// //               ))}
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Right Section - Login Form */}
// //       <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-6 py-8 sm:py-12 lg:p-12">
// //         <div className="w-full max-w-sm">
// //           {onNavigateToLanding && (
// //             <button
// //               onClick={onNavigateToLanding}
// //               className="mb-4 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
// //             >
// //               <ArrowLeft className="w-4 h-4" />
// //               <span className="text-sm font-medium">Back to Home</span>
// //             </button>
// //           )}

// //           {/* Mobile Header */}
// //           <div className="lg:hidden mb-6 sm:mb-8">
// //             <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
// //               <span className="text-xl font-bold text-white">D</span>
// //             </div>
// //             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Sign in</h1>
// //             <p className="text-sm sm:text-base text-slate-600 mt-1">Access your DestinyPal account</p>
// //           </div>

// //           {/* Desktop Header */}
// //           <div className="hidden lg:block mb-8">
// //             <h1 className="text-3xl font-bold text-slate-900 mb-2">Sign in to your account</h1>
// //             <p className="text-slate-600">Continue managing your impact</p>
// //           </div>

// //           {/* Login Card */}
// //           <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:shadow-xl lg:p-8">
// //             {/* Error Display */}
// //             {displayError && (
// //               <div className="mb-4 sm:mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700 text-xs sm:text-sm">
// //                 <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
// //                 <span>{displayError}</span>
// //               </div>
// //             )}

// //             {/* Login Form */}
// //             <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
// //               {/* Email Field */}
// //               <div>
// //                 <label htmlFor="email" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
// //                   Email address
// //                 </label>
// //                 <div className="relative">
// //                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
// //                   <input
// //                     id="email"
// //                     type="email"
// //                     value={email}
// //                     onChange={(e) => setEmail(e.target.value)}
// //                     placeholder="you@example.com"
// //                     className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
// //                     disabled={isLoading}
// //                   />
// //                 </div>
// //               </div>

// //               {/* Password Field */}
// //               <div>
// //                 <label htmlFor="password" className="block text-xs sm:text-sm font-medium text-slate-700 mb-1.5">
// //                   Password
// //                 </label>
// //                 <div className="relative">
// //                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
// //                   <input
// //                     id="password"
// //                     type={showPassword ? "text" : "password"}
// //                     value={password}
// //                     onChange={(e) => setPassword(e.target.value)}
// //                     placeholder="Enter your password"
// //                     className="w-full pl-9 sm:pl-10 pr-10 sm:pr-12 py-2 sm:py-2.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow disabled:bg-slate-50 disabled:text-slate-500"
// //                     disabled={isLoading}
// //                   />
// //                   <button
// //                     type="button"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
// //                     tabIndex={-1}
// //                     disabled={isLoading}
// //                   >
// //                     {showPassword ? (
// //                       <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
// //                     ) : (
// //                       <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
// //                     )}
// //                   </button>
// //                 </div>
// //               </div>

// //               {/* Remember Me & Forgot Password */}
// //               <div className="flex items-center justify-between pt-1 text-xs sm:text-sm">
// //                 <label className="flex items-center gap-2 cursor-pointer">
// //                   <input
// //                     type="checkbox"
// //                     checked={rememberMe}
// //                     onChange={(e) => setRememberMe(e.target.checked)}
// //                     className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
// //                     disabled={isLoading}
// //                   />
// //                   <span className="text-slate-600">Remember me</span>
// //                 </label>
// //                 <button
// //                   type="button"
// //                   onClick={onForgotPassword}
// //                   className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
// //                   disabled={isLoading}
// //                 >
// //                   Forgot?
// //                 </button>
// //               </div>

// //               {/* Submit Button */}
// //               <button
// //                 type="submit"
// //                 disabled={isLoading}
// //                 className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 sm:py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base mt-6"
// //               >
// //                 {isLoading ? (
// //                   <>
// //                     <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
// //                     <span>Signing in...</span>
// //                   </>
// //                 ) : (
// //                   "Sign in"
// //                 )}
// //               </button>
// //             </form>

// //             {/* Register Link */}
// //             <p className="mt-5 sm:mt-6 text-center text-xs sm:text-sm text-slate-600">
// //               Don't have an account?{" "}
// //               <button
// //                 onClick={onRegister}
// //                 disabled={isLoading}
// //                 className="text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
// //               >
// //                 Create one
// //               </button>
// //             </p>
// //           </div>

// //           <p className="mt-5 sm:mt-6 text-center text-xs text-slate-500 px-2">
// //             By signing in, you agree to our{" "}
// //             <button onClick={onNavigateToTerms} className="text-blue-600 hover:underline">
// //               Terms of Service
// //             </button>{" "}
// //             and{" "}
// //             <button onClick={onNavigateToPrivacy} className="text-blue-600 hover:underline">
// //               Privacy Policy
// //             </button>
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// // "use client"

// // import type React from "react"
// // import { useState, useEffect } from "react"
// // import { useAuth } from "./AuthContext"
// // import { validateEmail } from "./utils/validation"
// // import {
// //   Eye,
// //   EyeOff,
// //   Mail,
// //   Lock,
// //   Loader2,
// //   AlertCircle,
// //   ArrowLeft,
// // } from "lucide-react"

// // interface LoginProps {
// //   onForgotPassword?: () => void
// //   onRegister?: () => void
// //   onSuccess?: () => void
// //   onTwoFactorRequired?: () => void
// //   onNavigateToTerms?: () => void
// //   onNavigateToPrivacy?: () => void
// //   onNavigateToLanding?: () => void
// // }

// // const CAROUSEL_IMAGES = [
// //   "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// //   "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// //   "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// //   "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// //   "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// // ]

// // export function Login({
// //   onForgotPassword,
// //   onRegister,
// //   onSuccess,
// //   onTwoFactorRequired,
// //   onNavigateToTerms,
// //   onNavigateToPrivacy,
// //   onNavigateToLanding,
// // }: LoginProps) {
// //   const { login, isLoading, error, clearError } = useAuth()

// //   const [email, setEmail] = useState("")
// //   const [password, setPassword] = useState("")
// //   const [showPassword, setShowPassword] = useState(false)
// //   const [rememberMe, setRememberMe] = useState(false)
// //   const [formError, setFormError] = useState("")
// //   const [currentImageIndex, setCurrentImageIndex] = useState(0)

// //   useEffect(() => {
// //     const interval = setInterval(() => {
// //       setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length)
// //     }, 6000)
// //     return () => clearInterval(interval)
// //   }, [])

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault()
// //     setFormError("")
// //     clearError()

// //     if (!email.trim()) return setFormError("Email is required")
// //     if (!validateEmail(email)) return setFormError("Please enter a valid email address")
// //     if (!password) return setFormError("Password is required")

// //     try {
// //       const result = await login(email, password)
// //       if (result.requiresTwoFactor) {
// //         onTwoFactorRequired?.()
// //       } else {
// //         onSuccess?.()
// //       }
// //     } catch (err: any) {
// //       setFormError(err.message || "Login failed. Please try again.")
// //     }
// //   }

// //   const displayError = formError || error

// //   return (
// //     <div className="min-h-screen flex items-center justify-center lg:justify-end relative overflow-hidden">
// //       {/* Full-screen Background Carousel */}
// //       <div className="absolute inset-0">
// //         {CAROUSEL_IMAGES.map((src, idx) => (
// //           <img
// //             key={idx}
// //             src={src}
// //             alt="Students and education"
// //             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
// //               idx === currentImageIndex ? "opacity-100" : "opacity-0"
// //             }`}
// //           />
// //         ))}
// //         {/* Elegant dark gradient overlay - left to right */}
// //         <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
// //       </div>

// //       {/* Hero Text - Clean, Modern, No Circle */}
// //       <div className="absolute inset-0 flex items-center pointer-events-none">
// //         <div className="max-w-2xl pl-8 sm:pl-12 lg:pl-20 text-white">
// //           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
// //             Welcome to <span className="text-blue-400">DestinyPal</span>
// //           </h1>
// //           <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-blue-100 font-light">
// //             Connecting students with opportunity through institutions and sponsors
// //           </p>
// //           <p className="mt-10 sm:mt-12 text-2xl sm:text-3xl lg:text-4xl font-bold">
// //             Your support creates lasting change
// //           </p>
// //         </div>
// //       </div>

// //       {/* Login Card - Floating on the right */}
// //       <div className="relative z-10 w-full max-w-md mx-4 lg:mx-12 lg:mr-20">
// //         {/* Optional Back Button */}
// //         {onNavigateToLanding && (
// //           <button
// //             onClick={onNavigateToLanding}
// //             className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
// //           >
// //             <ArrowLeft className="w-5 h-5" />
// //             Back to Home
// //           </button>
// //         )}

// //         {/* Login Card */}
// //         <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
// //           {/* Mobile Header */}
// //           <div className="lg:hidden text-center mb-8">
// //             <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
// //             <p className="text-gray-600 mt-2">Sign in to your DestinyPal account</p>
// //           </div>

// //           {/* Desktop Header */}
// //           <div className="hidden lg:block mb-8">
// //             <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
// //             <p className="text-gray-600 mt-1">Continue making an impact</p>
// //           </div>

// //           {/* Error Alert */}
// //           {displayError && (
// //             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
// //               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
// //               <span>{displayError}</span>
// //             </div>
// //           )}

// //           {/* Form */}
// //           <form onSubmit={handleSubmit} className="space-y-6">
// //             {/* Email */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Email address
// //               </label>
// //               <div className="relative">
// //                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
// //                 <input
// //                   type="email"
// //                   value={email}
// //                   onChange={(e) => setEmail(e.target.value)}
// //                   placeholder="you@example.com"
// //                   className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition placeholder-gray-400"
// //                   disabled={isLoading}
// //                 />
// //               </div>
// //             </div>

// //             {/* Password */}
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-2">
// //                 Password
// //               </label>
// //               <div className="relative">
// //                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
// //                 <input
// //                   type={showPassword ? "text" : "password"}
// //                   value={password}
// //                   onChange={(e) => setPassword(e.target.value)}
// //                   placeholder="••••••••"
// //                   className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
// //                   disabled={isLoading}
// //                 />
// //                 <button
// //                   type="button"
// //                   onClick={() => setShowPassword(!showPassword)}
// //                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
// //                   tabIndex={-1}
// //                 >
// //                   {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
// //                 </button>
// //               </div>
// //             </div>

// //             {/* Remember me + Forgot */}
// //             <div className="flex items-center justify-between text-sm">
// //               <label className="flex items-center gap-2 cursor-pointer">
// //                 <input
// //                   type="checkbox"
// //                   checked={rememberMe}
// //                   onChange={(e) => setRememberMe(e.target.checked)}
// //                   className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
// //                   disabled={isLoading}
// //                 />
// //                 <span className="text-gray-600">Remember me</span>
// //               </label>
// //               <button
// //                 type="button"
// //                 onClick={onForgotPassword}
// //                 className="text-blue-600 hover:text-blue-700 font-medium transition"
// //                 disabled={isLoading}
// //               >
// //                 Forgot password?
// //               </button>
// //             </div>

// //             {/* Submit */}
// //             <button
// //               type="submit"
// //               disabled={isLoading}
// //               className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2 text-base"
// //             >
// //               {isLoading ? (
// //                 <>
// //                   <Loader2 className="w-5 h-5 animate-spin" />
// //                   Signing in...
// //                 </>
// //               ) : (
// //                 "Sign in"
// //               )}
// //             </button>
// //           </form>

// //           {/* Register Link */}
// //           <p className="mt-6 text-center text-sm text-gray-600">
// //             Don't have an account?{" "}
// //             <button
// //               onClick={onRegister}
// //               disabled={isLoading}
// //               className="font-medium text-blue-600 hover:text-blue-700 transition"
// //             >
// //               Create one
// //             </button>
// //           </p>

// //           {/* Terms & Privacy */}
// //           <p className="mt-8 text-center text-xs text-gray-500 leading-relaxed">
// //             By signing in, you agree to our{" "}
// //             <button onClick={onNavigateToTerms} className="text-blue-600 hover:underline">
// //               Terms of Service
// //             </button>{" "}
// //             and{" "}
// //             <button onClick={onNavigateToPrivacy} className="text-blue-600 hover:underline">
// //               Privacy Policy
// //             </button>
// //           </p>
// //         </div>
// //       </div>
// //     </div>
// //   )
// // }

// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useAuth } from "./AuthContext";
// import { validateEmail } from "./utils/validation";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   Loader2,
//   AlertCircle,
//   ArrowLeft,
// } from "lucide-react";

// import Logo from "../logo/Logo";

// interface LoginProps {
//   onForgotPassword?: () => void;
//   onRegister?: () => void;
//   onSuccess?: () => void;
//   onTwoFactorRequired?: () => void;
//   onNavigateToTerms?: () => void;
//   onNavigateToPrivacy?: () => void;
//   onNavigateToLanding?: () => void;
// }

// // Fixed: CAROUSEL_IMAGES is now defined inside the component file
// const CAROUSEL_IMAGES = [
//   "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// ];

// export function Login({
//   onForgotPassword,
//   onRegister,
//   onSuccess,
//   onTwoFactorRequired,
//   onNavigateToTerms,
//   onNavigateToPrivacy,
//   onNavigateToLanding,
// }: LoginProps) {
//   const { login, isLoading, error, clearError } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
//     }, 6000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError("");
//     clearError();

//     if (!email.trim()) return setFormError("Email is required");
//     if (!validateEmail(email))
//       return setFormError("Please enter a valid email address");
//     if (!password) return setFormError("Password is required");

//     try {
//       const result = await login(email, password);
//       if (result.requiresTwoFactor) onTwoFactorRequired?.();
//       else onSuccess?.();
//     } catch (err: any) {
//       setFormError(err.message || "Login failed. Please try again.");
//     }
//   };

//   const displayError = formError || error;

//   return (
//     <div className="min-h-screen flex items-center justify-center lg:justify-end relative overflow-hidden">
//       {/* Background Carousel */}
//       <div className="absolute inset-0">
//         {CAROUSEL_IMAGES.map((src, idx) => (
//           <img
//             key={idx}
//             src={src}
//             alt="Education & opportunity"
//             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
//               idx === currentImageIndex ? "opacity-100" : "opacity-0"
//             }`}
//           />
//         ))}
//         <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
//       </div>

//       {/* Hero Text */}
//       <div className="absolute inset-0 flex items-center pointer-events-none">
//         <div className="max-w-2xl pl-8 sm:pl-12 lg:pl-20 text-white">
//           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
//             Welcome to <span className="text-blue-400">DestinyPal</span>
//           </h1>
//           <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-blue-100 font-light">
//             Connecting students with opportunity through institutions and
//             sponsors
//           </p>
//           <p className="mt-10 sm:mt-12 text-2xl sm:text-3xl lg:text-4xl font-bold">
//             Your support creates lasting change
//           </p>
//         </div>
//       </div>

//       {/* Login Card */}
//       <div className="relative z-10 w-full max-w-md mx-4 lg:mx-12 lg:mr-20">
//         {onNavigateToLanding && (
//           <button
//             onClick={onNavigateToLanding}
//             className="mb-6 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-medium"
//           >
//             <ArrowLeft className="w-5 h-5" />
//             Back to Home
//           </button>
//         )}

//         <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
//           {/* Logo + Header */}

//           <div className="text-center mb-8">
//             <div className="mx-auto w-20 h-20 mb-4">
//               <Logo size={80} className="w-full h-full" />
//             </div>

//             <div className="lg:hidden">
//               <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
//               <p className="text-gray-600 mt-1">Sign in to continue</p>
//             </div>

//             <div className="hidden lg:block">
//               <h2 className="text-3xl font-bold text-gray-900 mt-2">Sign in</h2>
//               <p className="text-gray-600 text-sm">Continue making an impact</p>
//             </div>
//           </div>

//           {/* Error */}
//           {displayError && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
//               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//               <span>{displayError}</span>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@example.com"
//                   className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   tabIndex={-1}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="w-4 h-4 text-blue-600 rounded border-gray-300"
//                   disabled={isLoading}
//                 />
//                 <span className="text-gray-600">Remember me</span>
//               </label>
//               <button
//                 type="button"
//                 onClick={onForgotPassword}
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//                 disabled={isLoading}
//               >
//                 Forgot password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 "Sign in"
//               )}
//             </button>
//           </form>

//           <p className="mt-6 text-center text-sm text-gray-600">
//             Don't have an account?{" "}
//             <button
//               onClick={onRegister}
//               className="font-medium text-blue-600 hover:text-blue-700"
//             >
//               Create one
//             </button>
//           </p>

//           <p className="mt-8 text-center text-xs text-gray-500">
//             By signing in, you agree to our{" "}
//             <button
//               onClick={onNavigateToTerms}
//               className="text-blue-600 hover:underline"
//             >
//               Terms of Service
//             </button>{" "}
//             and{" "}
//             <button
//               onClick={onNavigateToPrivacy}
//               className="text-blue-600 hover:underline"
//             >
//               Privacy Policy
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";
// import { useAuth } from "./AuthContext";
// import { validateEmail } from "./utils/validation";
// import {
//   Eye,
//   EyeOff,
//   Mail,
//   Lock,
//   Loader2,
//   AlertCircle,
// } from "lucide-react";

// import Logo from "../logo/Logo";

// interface LoginProps {
//   onForgotPassword?: () => void;
//   onRegister?: () => void;
//   onSuccess?: () => void;
//   onTwoFactorRequired?: () => void;
//   onNavigateToTerms?: () => void;
//   onNavigateToPrivacy?: () => void;
//   onNavigateToLanding?: () => void;
// }

// const CAROUSEL_IMAGES = [
//   "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
//   "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
// ];

// export function Login({
//   onForgotPassword,
//   onRegister,
//   onSuccess,
//   onTwoFactorRequired,
//   onNavigateToTerms,
//   onNavigateToPrivacy,
// }: LoginProps) {
//   const { login, isLoading, error, clearError } = useAuth();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [rememberMe, setRememberMe] = useState(false);
//   const [formError, setFormError] = useState("");
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
//     }, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setFormError("");
//     clearError();

//     if (!email.trim()) return setFormError("Email is required");
//     if (!validateEmail(email))
//       return setFormError("Please enter a valid email address");
//     if (!password) return setFormError("Password is required");

//     try {
//       const result = await login(email, password);
//       if (result.requiresTwoFactor) onTwoFactorRequired?.();
//       else onSuccess?.();
//     } catch (err: any) {
//       setFormError(err.message || "Login failed. Please try again.");
//     }
//   };

//   const displayError = formError || error;

//   return (
//     <div className="min-h-screen flex items-center justify-center lg:justify-end relative overflow-hidden">
//       {/* Background Carousel */}
//       <div className="absolute inset-0">
//         {CAROUSEL_IMAGES.map((src, idx) => (
//           <img
//             key={idx}
//             src={src}
//             alt="Education & opportunity"
//             className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
//               idx === currentImageIndex ? "opacity-100" : "opacity-0"
//             }`}
//           />
//         ))}
//         <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
//       </div>

//       {/* Hero Text */}
//       <div className="absolute inset-0 flex items-center pointer-events-none">
//         <div className="max-w-2xl pl-8 sm:pl-12 lg:pl-20 text-white">
//           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
//             Welcome to <span className="text-blue-400">DestinyPal</span>
//           </h1>
//           <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-blue-100 font-light">
//             Connecting students with opportunity through institutions and
//             sponsors
//           </p>
//           <p className="mt-10 sm:mt-12 text-2xl sm:text-3xl lg:text-4xl font-bold">
//             Your support creates lasting change
//           </p>
//         </div>
//       </div>

//       {/* Login Card */}
//       <div className="relative z-10 w-full max-w-md mx-4 lg:mx-12 lg:mr-20">
//         <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
//           {/* Logo + Header */}

//           <div className="text-center mb-8">
//             <div className="mx-auto w-20 h-20 mb-4">
//               <Logo size={80} className="w-full h-full" />
//             </div>

//             <div className="lg:hidden">
//               <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
//               <p className="text-gray-600 mt-1">Sign in to continue</p>
//             </div>

//             <div className="hidden lg:block">
//               <h2 className="text-3xl font-bold text-gray-900 mt-2">Sign in</h2>
//               <p className="text-gray-600 text-sm">Continue making an impact</p>
//             </div>
//           </div>

//           {/* Error */}
//           {displayError && (
//             <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
//               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
//               <span>{displayError}</span>
//             </div>
//           )}

//           {/* Form */}
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email address
//               </label>
//               <div className="relative">
//                 <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="you@example.com"
//                   className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   disabled={isLoading}
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   placeholder="••••••••"
//                   className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
//                   disabled={isLoading}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   tabIndex={-1}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="w-5 h-5" />
//                   ) : (
//                     <Eye className="w-5 h-5" />
//                   )}
//                 </button>
//               </div>
//             </div>

//             <div className="flex items-center justify-between text-sm">
//               <label className="flex items-center gap-2 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={rememberMe}
//                   onChange={(e) => setRememberMe(e.target.checked)}
//                   className="w-4 h-4 text-blue-600 rounded border-gray-300"
//                   disabled={isLoading}
//                 />
//                 <span className="text-gray-600">Remember me</span>
//               </label>
//               <button
//                 type="button"
//                 onClick={onForgotPassword}
//                 className="text-blue-600 hover:text-blue-700 font-medium"
//                 disabled={isLoading}
//               >
//                 Forgot password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={isLoading}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
//             >
//               {isLoading ? (
//                 <>
//                   <Loader2 className="w-5 h-5 animate-spin" />
//                   Signing in...
//                 </>
//               ) : (
//                 "Sign in"
//               )}
//             </button>
//           </form>

//           <p className="mt-6 text-center text-sm text-gray-600">
//             Don't have an account?{" "}
//             <button
//               onClick={onRegister}
//               className="font-medium text-blue-600 hover:text-blue-700"
//             >
//               Create one
//             </button>
//           </p>

//           <p className="mt-8 text-center text-xs text-gray-500">
//             By signing in, you agree to our{" "}
//             <button
//               onClick={onNavigateToTerms}
//               className="text-blue-600 hover:underline"
//             >
//               Terms of Service
//             </button>{" "}
//             and{" "}
//             <button
//               onClick={onNavigateToPrivacy}
//               className="text-blue-600 hover:underline"
//             >
//               Privacy Policy
//             </button>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { validateEmail } from "./utils/validation";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Logo from "../logo/Logo";

interface LoginProps {
  onForgotPassword?: () => void;
  onRegister?: () => void;
  onSuccess?: () => void;
  onTwoFactorRequired?: () => void;
  onNavigateToTerms?: () => void;
  onNavigateToPrivacy?: () => void;
  onNavigateToLanding?: () => void;
}

const CAROUSEL_IMAGES = [
  "https://images.pexels.com/photos/3807517/pexels-photo-3807517.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/5209399/pexels-photo-5209399.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/8349369/pexels-photo-8349369.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/4589881/pexels-photo-4589881.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
  "https://images.pexels.com/photos/7974170/pexels-photo-7974170.jpeg?auto=compress&cs=tinysrgb&w=1600&h=900&fit=crop",
];

export function Login({
  onForgotPassword,
  onRegister,
  onSuccess,
  onTwoFactorRequired,
  onNavigateToTerms,
  onNavigateToPrivacy,
}: LoginProps) {
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    if (!email.trim()) return setFormError("Email is required");
    if (!validateEmail(email))
      return setFormError("Please enter a valid email address");
    if (!password) return setFormError("Password is required");

    try {
      const result = await login(email, password);
      if (result.requiresTwoFactor) onTwoFactorRequired?.();
      else onSuccess?.();
    } catch (err: any) {
      setFormError(err.message || "Login failed. Please try again.");
    }
  };

  const displayError = formError || error;

  return (
    <div className="min-h-screen flex items-center justify-center lg:justify-end relative overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0">
        {CAROUSEL_IMAGES.map((src, idx) => (
          <img
            key={idx}
            src={src}
            alt="Education & opportunity"
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[2000ms] ease-in-out ${
              idx === currentImageIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
      </div>

      {/* Hero Text */}
      <div className="absolute inset-0 flex items-center pointer-events-none">
        <div className="max-w-2xl pl-8 sm:pl-12 lg:pl-20 text-white">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            Welcome to <span className="text-blue-400">DestinyPal</span>
          </h1>
          <p className="mt-4 text-lg sm:text-xl lg:text-2xl text-blue-100 font-light">
            Connecting students with opportunity through institutions and
            sponsors
          </p>
          <p className="mt-10 sm:mt-12 text-2xl sm:text-3xl lg:text-4xl font-bold">
            Your support creates lasting change
          </p>
        </div>
      </div>

      {/* Floating Logo */}
      <div className="absolute top-2 left-8 sm:top-12 sm:left-12 lg:top-20 lg:left-20 w-16 h-16 z-20 pointer-events-auto">
        <Logo size={64} className="w-full h-full" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4 lg:mx-12 lg:mr-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
          {/* Header */}

          <div className="text-center mb-8">
            <div className="lg:hidden">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-600 mt-1">Sign in to continue</p>
            </div>

            <div className="hidden lg:block">
              <h2 className="text-3xl font-bold text-gray-900">Sign in</h2>
              <p className="text-gray-600 text-sm">Continue making an impact</p>
            </div>
          </div>

          {/* Error */}
          {displayError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                  disabled={isLoading}
                />
                <span className="text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-blue-600 hover:text-blue-700 font-medium"
                disabled={isLoading}
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <button
              onClick={onRegister}
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Create one
            </button>
          </p>

          <p className="mt-8 text-center text-xs text-gray-500">
            By signing in, you agree to our{" "}
            <button
              onClick={onNavigateToTerms}
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </button>{" "}
            and{" "}
            <button
              onClick={onNavigateToPrivacy}
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
