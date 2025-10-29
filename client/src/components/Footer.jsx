// src/components/Footer.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import styles from "../assets/css/Footer.module.css";

// SVG Icons for social media
const TwitterIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const GitHubIcon = () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.165 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.001 10.001 0 0022 12c0-5.523-4.477-10-10-10z" clipRule="evenodd" />
    </svg>
);

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.gridContainer}>
          
          {/* Brand and Social Column */}
          <div className={styles.brandColumn}>
            <h2 className={styles.logoText}>
              Community<span className={styles.logoAccent}>Connect</span>
            </h2>
            <p className={styles.tagline}>
              Connecting communities, one resource at a time.
            </p>
            <div className={styles.socialIcons}>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <TwitterIcon />
              </a>
              <a href="https://github.com/Gambit142/Community_Connect" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>
                <GitHubIcon />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className={styles.linkHeading}>Quick Links</h3>
            <ul className={styles.linkList}>
              <li><Link to="/about" className={styles.footerLink}>About Us</Link></li>
              <li><Link to="/posts" className={styles.footerLink}>Resources</Link></li>
              <li><Link to="/events" className={styles.footerLink}>Events</Link></li>
              <li><Link to="/contact" className={styles.footerLink}>Contact</Link></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className={styles.linkHeading}>Get Involved</h3>
            <ul className={styles.linkList}>
              <li><Link to="/posts/create" className={styles.footerLink}>Share a Resource</Link></li>
              <li><Link to="/events/create" className={styles.footerLink}>Host an Event</Link></li>
              <li><Link to="/auth/signup" className={styles.footerLink}>Become a Member</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className={styles.linkHeading}>Legal</h3>
            <ul className={styles.linkList}>
              <li><Link to="/privacy" className={styles.footerLink}>Privacy Policy</Link></li>
              <li><Link to="/terms" className={styles.footerLink}>Terms of Service</Link></li>
            </ul>
          </div>

          {/* Get in Touch */}
          <div>
            <h3 className={styles.linkHeading}>Get in Touch</h3>
            <ul className={styles.linkList}>
                <li className={styles.footerLink}>Brampton, ON, Canada</li>
                <li className={styles.footerLink}>info@communityconnect.com</li>
            </ul>
          </div>

        </div>
        <div className={styles.bottomBar}>
          &copy; {new Date().getFullYear()} Community Connect. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}