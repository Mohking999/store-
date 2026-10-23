import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone } from 'lucide-react';
import { useI18n } from '../../i18n';

export const Footer: React.FC = () => {
  const { locale } = useI18n();

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-copy">
          <Link to="/" className="site-brand" aria-label="PhoneFix — home">
            <span className="site-brand-mark"><Smartphone size={18} aria-hidden="true" /></span>
            <span className="site-brand-name">PhoneFix</span>
          </Link>
          <p>{locale === 'ar' ? 'خدمة إصلاح هواتف بسيطة وموثوقة.' : 'Simple, reliable phone repairs.'}</p>
        </div>
        <nav className="site-footer-links" aria-label={locale === 'ar' ? 'روابط' : 'Links'}>
          <Link to="/">{locale === 'ar' ? 'الموقع العام' : 'Public website'}</Link>
          <Link to="/login">{locale === 'ar' ? 'دخول الموظفين' : 'Staff sign in'}</Link>
        </nav>
      </div>
    </footer>
  );
};
