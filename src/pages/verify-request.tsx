export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
      <div className="bg-white shadow p-6 rounded text-center max-w-md">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-700">
          We’ve sent you a magic link. Click it to sign in and continue.
        </p>
      </div>
    </div>
  );
}
