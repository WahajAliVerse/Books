import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import { useLocation } from '@docusaurus/router';
import useBaseUrl from '@docusaurus/useBaseUrl';
import { useThemeConfig } from '@docusaurus/theme-common';
import { useHideableNavbar, useLockBodyScroll } from '@docusaurus/theme-common/internal';
import { translatePage, restorePage } from '../utils/translationUtils';

import styles from './Navbar.module.css';

function Navbar() {
  const location = useLocation();
  const [currentLang, setCurrentLang] = useState('en'); // Default to English
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarShown, setSidebarShown] = useState(false);

  const themeConfig = useThemeConfig();
  const { navbar: { hideOnScroll, logo: navbarLogo } } = themeConfig;
  const { navbarRef, isNavbarVisible } = useHideableNavbar(hideOnScroll);
  useLockBodyScroll(sidebarShown);

  // Navbar logo properties
  const logoLink = navbarLogo?.href || '/';
  const logoLinkProps = navbarLogo?.target ? { target: navbarLogo.target } : {};
  const logoImageUrl = navbarLogo?.src ? navbarLogo.src : '/img/logo.svg';
  const logoAlt = navbarLogo?.alt || 'Physical AI & Humanoid Robotics';

  const toggleLanguage = async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      if (currentLang === 'en') {
        // Switch to Urdu
        await translatePage('ur');
        setCurrentLang('ur');
      } else {
        // Switch back to English
        restorePage();
        setCurrentLang('en');
      }
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <nav
      ref={navbarRef}
      className={clsx(
        'navbar',
        'navbar--fixed-top',
        !isNavbarVisible && styles.navbarHidden,
        sidebarShown && 'navbar-sidebar--show',
      )}>
      <div className="navbar__inner">
        <div className="navbar__items">
          <Link className="navbar__brand" to={logoLink} {...logoLinkProps}>
            {logoImageUrl != null ? (
              <img
                key={location.pathname}
                className="navbar__logo"
                src={logoImageUrl}
                alt={logoAlt}
              />
            ) : null}
            <span className={clsx('navbar__title', !logoImageUrl && 'navbar__title--flex')}>Physical AI & Humanoid Robotics</span>
          </Link>
          <Link className="navbar__item navbar__link" href="/docs/intro">
            Book Chapters
          </Link>
        </div>
        <div className="navbar__items navbar__items--right">
          <Link className="navbar__item navbar__link" href="/chatbot">
            Chatbot
          </Link>
          <Link className="navbar__item navbar__link" href="/profile">
            Profile
          </Link>
          <button
            className={clsx('navbar__item navbar__link translation-button', isLoading ? 'loading' : '')}
            onClick={toggleLanguage}
            aria-label={currentLang === 'en' ? "Switch to Urdu" : "Switch to English"}
            disabled={isLoading}
          >
            {isLoading ? (
              <span>Translating...</span>
            ) : (
              currentLang === 'en' ? 'اردو' : 'English'
            )}
          </button>
          <Link className="navbar__item navbar__link" href="https://github.com/facebook/docusaurus">
            GitHub
          </Link>
        </div>
      </div>

      <div
        role="presentation"
        className="navbar-sidebar__backdrop"
        onClick={() => setSidebarShown(false)}
      />
    </nav>
  );
}

export default Navbar;