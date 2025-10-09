'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AuthService, type LoginCredentials, type ApiError } from '@/lib/auth-service';
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);

  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  useEffect(() => {
    if (AuthService.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await AuthService.login(formData);
      router.push('/dashboard');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);

    try {
      await AuthService.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess(true);
      setForgotPasswordEmail('');
    } catch (err) {
      const apiError = err as ApiError;
      setForgotPasswordError(apiError.message || 'Failed to send reset email. Please try again.');
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const resetForgotPasswordDialog = () => {
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);
    setShowForgotPasswordDialog(false);
  };

  return (
    <div className="min-h-screen flex">
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
                Enter your credentials to access your training portal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Dialog open={showForgotPasswordDialog} onOpenChange={setShowForgotPasswordDialog}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                        onClick={() => setShowForgotPasswordDialog(true)}
                      >
                        Forgot your password?
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Reset your password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we&apos;ll send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      
                      {forgotPasswordSuccess ? (
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2 p-3 rounded-lg bg-green-50 border border-green-200">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <p className="text-sm text-green-700">
                              Password reset email sent! Check your inbox for further instructions.
                            </p>
                          </div>
                          <Button
                            onClick={resetForgotPasswordDialog}
                            className="w-full"
                          >
                            Close
                          </Button>
                        </div>
                      ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          {forgotPasswordError && (
                            <div className="flex items-center space-x-2 p-3 rounded-lg bg-red-50 border border-red-200">
                              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                              <p className="text-sm text-red-700">{forgotPasswordError}</p>
                            </div>
                          )}
                          
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email address</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              required
                              placeholder="Enter your email"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              disabled={forgotPasswordLoading}
                            />
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={resetForgotPasswordDialog}
                              className="flex-1"
                              disabled={forgotPasswordLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1"
                              disabled={forgotPasswordLoading}
                            >
                              {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>
                          </div>
                        </form>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
