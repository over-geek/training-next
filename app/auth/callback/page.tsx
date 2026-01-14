'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthService } from '@/lib/auth-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get token from URL query parameter
        const token = searchParams.get('token');
        
        if (!token) {
          setStatus('error');
          setErrorMessage('No authentication token received from the server.');
          return;
        }

        // Store the token using AuthService
        AuthService.setOAuthToken(token);
        
        setStatus('success');
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
        
      } catch (error) {
        console.error('Authentication error:', error);
        setStatus('error');
        setErrorMessage('Failed to complete authentication. Please try again.');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  const handleRetry = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-800">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-2xl">Authentication</CardTitle>
          <CardDescription>
            {status === 'loading' && 'Processing your login...'}
            {status === 'success' && 'Login successful!'}
            {status === 'error' && 'Authentication failed'}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600">Please wait while we complete your login...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Successfully authenticated!</p>
                <p className="text-sm text-gray-600 mt-1">Redirecting you to the dashboard...</p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center space-y-4 w-full">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-center">
                <p className="font-medium text-gray-900">Authentication Error</p>
                <p className="text-sm text-gray-600 mt-1">{errorMessage}</p>
              </div>
              <Button onClick={handleRetry} className="w-full mt-4">
                Return to Login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


