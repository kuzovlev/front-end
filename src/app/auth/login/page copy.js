'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/store/use-auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { z } from 'zod';

// Zod validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateField = (name, value) => {
    try {
      const validationSchema = loginSchema.shape[name];
      validationSchema.parse(value);
      setErrors(prev => ({ ...prev, [name]: undefined }));
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(prev => ({
          ...prev,
          [name]: error.errors[0]?.message || 'Invalid input'
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate all fields
      const validatedData = loginSchema.parse(formData);
      
      // Attempt login
      const role = await login(validatedData);
      toast.success('Logged in successfully!');
      
      // Redirect based on role
      if (role === 'ADMIN' || role === 'VENDOR') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors = {};
        error.errors.forEach((err) => {
          newErrors[err.path[0]] = err.message;
        });
        setErrors(newErrors);
        // Show all validation errors in toast
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      } else {
        console.error('Login failed:', error);
        // Display the error message from the API response
        toast.error(error.response?.data?.message || error.message || 'Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-center" />
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-zinc-900 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
            alt="Bus Travel"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 to-transparent"></div>
        </div>
        <div className="relative z-10 text-white max-w-xl">
          <h1 className="text-4xl font-bold mb-4">Welcome Back!</h1>
          <p className="text-lg text-gray-300">Sign in to access your account and manage your bookings with ease.</p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8 bg-zinc-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href="/" className="flex items-center justify-center gap-2 mb-8">
            <span className="text-2xl font-bold text-yellow-500">
              {process.env.NEXT_PUBLIC_APP_NAME}
            </span>
          </Link>
          <h2 className="text-2xl font-semibold text-white">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-400">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email Address
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 bg-zinc-800/50 border-zinc-700 text-white ${
                  errors.email ? 'border-red-500' : ''
                }`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={`bg-zinc-800/50 border-zinc-700 text-white ${
                    errors.password ? 'border-red-500' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-yellow-500 hover:text-yellow-400"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-zinc-900 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-center text-sm text-gray-400">
              New to {process.env.NEXT_PUBLIC_APP_NAME}?{' '}
              <Link href="/auth/register" className="text-yellow-500 hover:text-yellow-400 font-medium">
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
} 