import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useI18n } from '../i18n';

export const LoginPage: React.FC = () => {
  const { login, logout } = useAuth();
  const { locale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const isArabic = locale === 'ar';
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;

  const navigateForRole = (role: string) => {
    navigate(from || (role === 'ADMIN' ? '/admin' : '/technician'), { replace: true });
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(emailOrPhone, password);
      if (user.role === 'CUSTOMER') {
        await logout();
        throw new Error(isArabic ? 'تسجيل دخول العملاء غير متاح. استخدم نموذج طلب الإصلاح.' : 'Customer sign-in is unavailable. Please use the public repair request form.');
      }
      navigateForRole(user.role);
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : (isArabic ? 'تعذر تسجيل الدخول.' : 'Unable to sign in.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 mx-auto flex items-center justify-center shadow-lg">
          <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-black text-white">{isArabic ? 'دخول الموظفين' : 'Staff sign in'}</h1>
        <p className="text-sm text-slate-500">
          {isArabic ? 'تسجيل الدخول مخصص لفريق العمل.' : 'Sign in to access the technician or admin workspace.'}
        </p>
      </div>

      <form onSubmit={handleLogin} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        {error && <p className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 text-sm" role="alert">{error}</p>}
        <div>
          <label htmlFor="staff-identity" className="block text-sm font-medium text-slate-300 mb-1">
            {isArabic ? 'البريد الإلكتروني أو الهاتف' : 'Email or phone number'}
          </label>
          <input
            id="staff-identity"
            type="text"
            autoComplete="username"
            value={emailOrPhone}
            onChange={(event) => setEmailOrPhone(event.currentTarget.value)}
            required
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm"
          />
        </div>
        <div>
          <label htmlFor="staff-password" className="block text-sm font-medium text-slate-300 mb-1">
            {isArabic ? 'كلمة المرور' : 'Password'}
          </label>
          <input
            id="staff-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-800 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full min-h-12 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (isArabic ? 'جارٍ تسجيل الدخول...' : 'Signing in…') : (isArabic ? 'تسجيل الدخول' : 'Sign in')}
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
};
