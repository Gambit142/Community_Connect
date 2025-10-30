import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header'; 
import Footer from './Footer';
import styles from '../assets/css/UserLayout.module.css'; // Correct path to CSS

export default function UserLayout() {
  return (
    <div className={styles.wrapper}>
      <Header />
      <main className={styles.mainContent}>
        {/* The Outlet component renders the matched child route's component */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}