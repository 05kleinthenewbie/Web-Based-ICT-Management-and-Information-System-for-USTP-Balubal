/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, User, School, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/Card';
import { useAuth, UserRole } from '@/src/context/AuthContext';
import { cn } from '@/src/lib/utils';

export default function Login() {
  const { user, login, signup, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [selectedRole, setSelectedRole] = React.useState<UserRole>('student');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signup(email, password, selectedRole, displayName || email.split('@')[0]);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mx-auto h-24 w-24 bg-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 p-2 overflow-hidden"
        >
          <img 
            src="https://artifact.stey.ai/8afb7959-61c9-4eb4-a80e-75df1baeeaf8/original_ustp_logo.png" 
            alt="USTP Logo"
            className="w-full h-full object-contain"
            referrerPolicy="no-referrer"
          />
        </motion.div>
        <h2 className="mt-4 text-xl font-black text-slate-900 tracking-tight uppercase">
          USTP <span className="text-orange-500">ICT - Management and Information System</span>
        </h2>
        <p className="mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Central Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Card className="border-slate-200 shadow-xl shadow-slate-200/50">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-sm font-bold text-center uppercase tracking-widest text-slate-700">
              {isSignUp ? 'New User Registration' : 'System Authentication'}
            </CardTitle>
            <CardDescription className="text-center text-[10px]">
              {isSignUp ? 'Create your authorized portal account' : 'Enter authorized credentials to access laboratory systems'}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form className="space-y-4" onSubmit={handleAuth}>
              {error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 text-[10px] p-2.5 rounded font-bold uppercase text-center">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                {(['student', 'faculty_staff', 'admin'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setSelectedRole(role)}
                    className={cn(
                      'flex flex-col items-center gap-1.5 p-2 rounded border-2 transition-all',
                      selectedRole === role
                        ? 'bg-[#0F172A] border-[#0F172A] text-white'
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100 text-slate-400'
                    )}
                  >
                    {role === 'admin' ? (
                      <ShieldCheck className={cn('w-4 h-4', selectedRole === role ? 'text-orange-500' : '')} />
                    ) : role === 'faculty_staff' ? (
                      <BookOpen className={cn('w-4 h-4', selectedRole === role ? 'text-orange-500' : '')} />
                    ) : (
                      <User className={cn('w-4 h-4', selectedRole === role ? 'text-orange-500' : '')} />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-widest">{role.split('_')[0]}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {isSignUp && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input
                      type="text"
                      required={isSignUp}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Juan Dela Cruz"
                      className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Portal Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@ustp.edu.ph"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Security Code</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/10 transition-all font-mono"
                  />
                  {!isSignUp && (
                    <div className="text-right mt-1">
                      <button type="button" className="text-[9px] font-bold text-orange-600 hover:text-orange-500 uppercase tracking-tight">
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <Button disabled={loading} type="submit" className="w-full h-11 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20">
                {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Access Platform'}
              </Button>
              
              <div className="text-center mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[10px] font-black text-slate-500 hover:text-orange-600 uppercase tracking-widest transition-colors"
                >
                  {isSignUp ? 'Already have an account? Login here' : 'Don\'t have an account? Sign up'}
                </button>
              </div>
            </form>

            <div className="mt-8 border-t border-slate-100 pt-4">
              <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">
                University of Science and Technology of Southern Philippines
              </p>
              <div className="bg-slate-50 rounded p-2 border border-slate-100">
                <p className="text-[8px] text-slate-400 font-bold uppercase text-center leading-tight">
                   Security Notice: Unauthorized access to laboratory systems is strictly monitored and logged.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

