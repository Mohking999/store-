import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Globe2, LayoutDashboard, LogOut, Menu, Smartphone, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useI18n } from '../../i18n';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { locale, setLocale } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const dashboardPath = user?.role === 'ADMIN' ? '/admin' : '/technician';

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link to="/" className="site-brand" aria-label="PhoneFix — home">
          <span className="site-brand-mark"><Smartphone size={21} aria-hidden="true" /></span>
          <span className="site-brand-name">PhoneFix</span>
        </Link>

        <nav className="site-nav" aria-label="Staff navigation">
          {user && (
            <Link
              to={dashboardPath}
              className="site-nav-link"
              aria-current={location.pathname === dashboardPath ? 'page' : undefined}
            >
              <LayoutDashboard size={15} aria-hidden="true" />
              {locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}
            </Link>
          )}
          <Link to="/" className="site-nav-link">{locale === 'ar' ? 'الموقع' : 'Public site'}</Link>
        </nav>

        <div className="site-header-actions">
          <button
            type="button"
            className="site-action"
            onClick={() => setLocale(locale === 'ar' ? 'fr' : 'ar')}
            aria-label={locale === 'ar' ? 'Passer en français' : 'التبديل إلى العربية'}
          >
            <Globe2 size={15} aria-hidden="true" />
            <span>{locale === 'ar' ? 'Français' : 'العربية'}</span>
          </button>
          {user ? (
            <div className="site-user-wrap">
              <button type="button" className="site-action" aria-expanded={userOpen} onClick={() => setUserOpen((open) => !open)}>
                <span className="hidden sm:inline">{user.fullName}</span><ChevronDown size={14} aria-hidden="true" />
              </button>
              {userOpen && (
                <div className="site-dropdown">
                  <Link className="site-dropdown-item" to={dashboardPath} onClick={() => setUserOpen(false)}>
                    <span>{locale === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span><LayoutDashboard size={16} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    className="site-dropdown-item"
                    onClick={async () => {
                      setUserOpen(false);
                      await logout();
                      navigate('/');
                    }}
                  >
                    <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Log out'}</span><LogOut size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="site-login-button">{locale === 'ar' ? 'دخول الموظفين' : 'Staff sign in'}</Link>
          )}
          <button
            type="button"
            className="site-menu-button"
            aria-label={mobileOpen ? 'Close staff navigation' : 'Open staff navigation'}
            aria-expanded={mobileOpen}
            aria-controls="staff-mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X size={19} aria-hidden="true" /> : <Menu size={19} aria-hidden="true" />}
          </button>
        </div>
      </div>
      {mobileOpen && (
        <nav className="site-mobile-nav" id="staff-mobile-navigation" aria-label="Staff navigation">
          <Link to="/" className="site-nav-link" onClick={() => setMobileOpen(false)}>
            {locale === 'ar' ? 'الموقع' : 'Public site'}
          </Link>
        </nav>
      )}
    </header>
  );
};
