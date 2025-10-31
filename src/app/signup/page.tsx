import EnhancedSignupForm from '@/components/auth/EnhancedSignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">Join Shared Thread</h1>
          <p className="text-gray-600">Create your account to get started</p>
        </div>
        <EnhancedSignupForm />
      </div>
    </div>
  );
}
