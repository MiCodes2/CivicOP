import { useState } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Placeholder: Implement login logic
    console.log('Login attempt:', { email, password });
    alert('Login functionality - Coming Soon!');
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
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-water focus:border-water focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-water hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water"
            >
              Sign in
            </button>
          </div>

          <div className="text-center">
            <a href="/register" className="text-water hover:text-water/90">
              Don't have an account? Sign up
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}