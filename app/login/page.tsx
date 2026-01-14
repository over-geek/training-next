'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthService } from '@/lib/auth-service';
import { OAUTH_BASE_URL, API_ENDPOINTS } from '@/lib/api-config';
import { AlertCircle, Loader2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push('/dashboard');
    }

    const errorParam = searchParams.get('error');
    const messageParam = searchParams.get('message');
    
    if (errorParam && messageParam) {
      setError(decodeURIComponent(messageParam));
    }
  }, [router, searchParams]);

  const handleAzureLogin = () => {
    setError('');
    window.location.href = `${OAUTH_BASE_URL}${API_ENDPOINTS.AUTH.OAUTH_AZURE}`;
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Welcome Banner */}
      <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-blue-600 to-blue-800 p-8 xl:p-12 flex-col justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <Image
              src="/assets/icps-logo.svg"
              alt="ICPS Logo"
              width={32}
              height={32}
              className="w-8 h-8"
            />
          </div>
          <h1 className="text-2xl font-bold text-white">Training Portal</h1>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-3xl xl:text-4xl font-bold text-white leading-tight">
            Welcome back to your
            <br />
            training dashboard
          </h2>
          <p className="text-blue-100 text-lg max-w-md">
            Access your personalized training programs, track your progress, and stay connected with your learning journey.
          </p>
        </div>

        <div className="text-blue-200 text-sm">
          © 2024 ICPS Training Portal. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 lg:w-2/5 flex items-center justify-center p-6 lg:p-8 bg-gray-50">
        <div className="w-full max-w-sm">
          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1 pb-6">
              <div className="flex items-center justify-center mb-4 lg:hidden">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Image
                    src="/assets/icps-logo.svg"
                    alt="ICPS Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6 text-white"
                  />
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-center">Sign in to your account</CardTitle>
              <CardDescription className="text-center text-sm">
                Use your Microsoft account to access the training portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-start space-x-2 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Authentication Failed</p>
                    <p className="text-xs text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              )}
              <Button
                onClick={handleAzureLogin}
                className="w-full bg-[#0078D4] hover:bg-[#106EBE] text-white"
                size="lg"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0 0h10.927v10.927H0V0z" fill="#f25022"/>
                  <path d="M12.073 0H23v10.927H12.073V0z" fill="#7fba00"/>
                  <path d="M0 12.073h10.927V23H0V12.073z" fill="#00a4ef"/>
                  <path d="M12.073 12.073H23V23H12.073V12.073z" fill="#ffb900"/>
                </svg>
                Sign in with Microsoft
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}