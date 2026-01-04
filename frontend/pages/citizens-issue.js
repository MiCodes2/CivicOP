import { useEffect } from 'react';
import { useRouter } from 'next/router';

/**
 * Citizens Issue Page
 * This page redirects to the home page with the report form open
 * URL: /citizens-issue or https://civicopindia.com/citizens-issue
 */
export default function CitizensIssue() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page with query param to open report form
    router.replace('/?report=true');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">Opening Issue Report Form...</p>
      </div>
    </div>
  );
}
