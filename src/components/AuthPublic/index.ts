// Auth Context & Provider
export { AuthProvider, useAuth } from "./AuthContext"
export { AuthGuard } from "./AuthGuard"

// Auth Router
export { AuthRouter } from "./AuthRouter"

// Login & OAuth
export { Login } from "./Login"
export { OAuthCallback } from "./OAuthCallback"

// Registration
export { RegisterSelector } from "./register/RegisterSelector"
export { SponsorRegister } from "./register/SponsorRegister"
export { InstitutionRegister } from "./register/InstitutionRegister"
export { StudentRegister } from "./register/StudentRegister"
export { HighSchoolStudentRegister } from "./register/HighSchoolStudentRegister"
export { UniversityStudentRegister } from "./register/UniversityStudentRegister"

// Password Recovery
export { ForgotPassword } from "./ForgotPassword"
export { ResetPassword } from "./ResetPassword"

// Verification
export { VerifyEmail } from "./VerifyEmail"
export { VerifySMS } from "./VerifySMS"

// Two-Factor Authentication
export { TwoFactorSetup } from "./TwoFactorSetup"
export { TwoFactorVerify } from "./TwoFactorVerify"

// Shared Components
export { PasswordStrengthMeter } from "./shared/PasswordStrengthMeter"
export { PhoneInput } from "./shared/PhoneInput"
export { CountrySelect } from "./shared/CountrySelect"

// Types
export * from "./types"

// Constants
export * from "./constants"
