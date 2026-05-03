import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { GraduationCap, Mail, Lock, Chrome } from 'lucide-react';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, signup, googleSignIn } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(email, password);
        toast.success('Account created successfully!');
      } else {
        await login(email, password);
        toast.success('Signed in successfully!');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await googleSignIn();
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-stretch bg-white">
      {/* Left side - Splash */}
      <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 p-12 flex-col justify-between text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <GraduationCap size={32} />
            </div>
            <span className="text-2xl font-bold tracking-tight">Bright Student Pro</span>
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-6">
            Run your tutoring practice with calm.
          </h1>
          <p className="text-xl text-indigo-100 max-w-md">
            Manage students, track classes, and record payments all in one beautiful dashboard.
          </p>
        </div>
        
        <div className="relative z-10">
          <p className="text-sm text-indigo-200">
            &copy; 2026 Bright Student Pro. All rights reserved.
          </p>
        </div>

        {/* Abstract background shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-700 rounded-full blur-3xl opacity-50" />
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <Card className="w-full max-w-md border-none shadow-xl bg-white rounded-2xl overflow-hidden">
          <CardHeader className="space-y-1 pb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                <GraduationCap size={20} />
              </div>
              <span className="text-lg font-bold text-slate-900">Bright Student Pro</span>
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isSignUp ? 'Create your account' : 'Sign in'}
            </CardTitle>
            <CardDescription className="text-slate-500">
              {isSignUp 
                ? 'Join Bright Student Pro to start managing your tutoring classes.' 
                : 'Welcome back! Enter your credentials to access your dashboard.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 py-6"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    className="pl-10 py-6"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              <Button type="submit" className="w-full py-6 text-base bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full py-6 border-slate-200 text-slate-600 hover:bg-slate-50" 
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <Chrome className="mr-2 h-5 w-5 text-indigo-600" />
              Google
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-2">
            <p className="text-sm text-center text-slate-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button 
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 font-semibold hover:underline"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
