'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Check, X, Loader2 } from 'lucide-react';

interface FormData {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  birthday: string;
  pronouns: string;
  agreeTerms: boolean;
  agreeGuidelines: boolean;
  newsletterOptIn: boolean;
  smsOptIn: boolean;
  honeypot: string; // Spam protection
}

export default function EnhancedSignupForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Username availability check
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    birthday: '',
    pronouns: '',
    agreeTerms: false,
    agreeGuidelines: false,
    newsletterOptIn: false,
    smsOptIn: false,
    honeypot: '', // If filled, it's a bot
  });

  // Real-time username check
  const checkUsernameAvailability = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const response = await fetch(`/api/auth/check-username?username=${encodeURIComponent(username)}`);
      const data = await response.json();
      setUsernameAvailable(data.available);
    } catch {
      setUsernameAvailable(null);
    } finally {
      setCheckingUsername(false);
    }
  };

  const handleUsernameChange = (username: string) => {
    setFormData({ ...formData, username });
    
    // Debounce the check
    if (username.length >= 3) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(username);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setUsernameAvailable(null);
    }
  };

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.password.length > 0;

  // Calculate age from birthday
  const getAge = (birthday: string) => {
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isUnder18 = formData.birthday ? getAge(formData.birthday) < 18 : false;

  // Step 1 validation
  const canProceedToStep2 = 
    formData.username.length >= 3 &&
    usernameAvailable === true &&
    formData.fullName.length >= 2 &&
    formData.email.includes('@') &&
    formData.password.length >= 8 &&
    passwordsMatch;

  // Step 2 validation
  const canSubmit =
    formData.phoneNumber.length >= 10 &&
    formData.birthday !== '' &&
    formData.agreeTerms &&
    formData.agreeGuidelines;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check
    if (formData.honeypot !== '') {
      // Silent fail for bots
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/signup-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          displayName: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          password: formData.password,
          birthday: formData.birthday,
          pronouns: formData.pronouns,
          newsletterOptIn: formData.newsletterOptIn,
          smsOptIn: formData.smsOptIn,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.redirect === 'login') {
          setError(data.error || 'An account with this email or phone already exists.');
          setTimeout(() => {
            router.push('/login?message=account_exists');
          }, 2000);
          return;
        }
        throw new Error(data.error || 'Failed to create account');
      }

      if (data.onWaitlist) {
        router.push('/login?message=waitlist');
      } else {
        router.push('/login?message=signup_success');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white border-2 border-black rounded-lg p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          {step === 1 ? "Let's start with the basics" : "Almost there!"}
        </h2>

        {/* Progress indicator */}
        <div className="flex gap-2 mb-6">
          <div className={`flex-1 h-2 rounded ${step >= 1 ? 'bg-black' : 'bg-gray-200'}`} />
          <div className={`flex-1 h-2 rounded ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border-2 border-red-500 rounded text-red-800 text-sm">
            {error}
          </div>
        )}

        {/* Honeypot field (hidden from users) */}
        <input
          type="text"
          name="website"
          value={formData.honeypot}
          onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
          style={{ position: 'absolute', left: '-9999px' }}
          tabIndex={-1}
          autoComplete="off"
        />

        {step === 1 && (
          <>
            {/* Username */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Username *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                  placeholder="Choose a unique username"
                  minLength={3}
                  required
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkingUsername && <Loader2 size={16} className="animate-spin text-gray-400" />}
                  {!checkingUsername && usernameAvailable === true && (
                    <Check size={16} className="text-green-600" />
                  )}
                  {!checkingUsername && usernameAvailable === false && (
                    <X size={16} className="text-red-600" />
                  )}
                </div>
              </div>
              {usernameAvailable === false && (
                <p className="text-xs text-red-600 mt-1">This username is already taken</p>
              )}
              {usernameAvailable === true && (
                <p className="text-xs text-green-600 mt-1">Username is available!</p>
              )}
            </div>

            {/* Full Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Your full name"
                required
              />
            </div>

            {/* Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {/* Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black pr-10"
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i <= passwordStrength
                            ? passwordStrength <= 2
                              ? 'bg-red-500'
                              : passwordStrength <= 3
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {passwordStrength <= 2 && 'Weak password'}
                    {passwordStrength === 3 && 'Moderate password'}
                    {passwordStrength >= 4 && 'Strong password'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black pr-10"
                  placeholder="Re-enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-xs text-red-600 mt-1">Passwords do not match</p>
              )}
              {passwordsMatch && (
                <p className="text-xs text-green-600 mt-1">Passwords match!</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={!canProceedToStep2}
              className="w-full py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          </>
        )}

        {step === 2 && (
          <>
            {/* Phone Number */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="(555) 123-4567"
                required
              />
            </div>

            {/* Birthday */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-1">
                Birthday *
              </label>
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                required
              />
              {isUnder18 && (
                <p className="text-sm text-gray-600 mt-2 p-2 bg-gray-100 rounded border border-gray-300">
                  You&apos;ll be added to our waitlist. We&apos;ll contact you when you&apos;re eligible to join!
                </p>
              )}
            </div>

            {/* Pronouns */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-black mb-1">
                Pronouns (Optional)
              </label>
              <input
                type="text"
                value={formData.pronouns}
                onChange={(e) => setFormData({ ...formData, pronouns: e.target.value })}
                className="w-full px-3 py-2 border-2 border-black rounded focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g., they/them, she/her, he/him"
              />
            </div>

            {/* Agreements */}
            <div className="space-y-3 mb-6">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeGuidelines}
                  onChange={(e) => setFormData({ ...formData, agreeGuidelines: e.target.checked })}
                  className="mt-1 w-4 h-4"
                  required
                />
                <span className="text-sm text-black">
                  I agree to follow the{' '}
                  <Link href="/community-guidelines" target="_blank" className="underline hover:text-gray-700">
                    Community Guidelines
                  </Link>{' '}
                  *
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                  className="mt-1 w-4 h-4"
                  required
                />
                <span className="text-sm text-black">
                  I agree to the{' '}
                  <Link href="/terms" target="_blank" className="underline hover:text-gray-700">
                    Terms & Conditions
                  </Link>{' '}
                  *
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.newsletterOptIn}
                  onChange={(e) => setFormData({ ...formData, newsletterOptIn: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <span className="text-sm text-black">
                  I&apos;d like to receive email newsletters (optional)
                </span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.smsOptIn}
                  onChange={(e) => setFormData({ ...formData, smsOptIn: e.target.checked })}
                  className="mt-1 w-4 h-4"
                />
                <span className="text-sm text-black">
                  I&apos;d like to receive SMS updates (optional)
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 py-3 border-2 border-black text-black rounded font-medium hover:bg-gray-100 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isLoading}
                className="flex-1 py-3 bg-black text-white rounded font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <Loader2 size={18} className="animate-spin" />}
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </>
        )}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-black font-medium hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
