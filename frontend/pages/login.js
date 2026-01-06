import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { authHelpers, dbHelpers } from '../lib/supabase';

export default function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Sign in with email or username
      await authHelpers.signInWithEmailOrUsername(emailOrUsername, password);
      
      // Get current user details to check role
      const user = await authHelpers.getUser();
      if (user) {
        // Fetch user profile from database to get role
        const { data, error: dbError } = await dbHelpers.getUserById(user.id);
        
        if (dbError) throw dbError;
        
        // Redirect based on user role
        if (data?.role === 'admin') {
          router.push('/governance');
        } else {
          router.push('/');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your email/username and password.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-0" style={{ backgroundColor: 'var(--theme-bg)' }}>
      <div className="max-w-md w-full space-y-8 mx-auto px-4">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to CivicOp
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Report issues or access governance dashboard
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="emailOrUsername" className="sr-only">Email or Username</label>
              <input
                id="emailOrUsername"
                name="emailOrUsername"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-water focus:border-water focus:z-10 sm:text-sm"
                placeholder="Email or username (e.g., civic_admin)"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-water focus:border-water focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-water hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          )}

          <div className="text-center">
            <Link href="/register" className="text-water hover:text-water/90">
              Don&apos;t have an account? Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}