import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { BottomNavBar } from './components/BottomNavBar';
import './AppLayout.css';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const isFeed = location.pathname.startsWith('/feed');

  return (
    <div className="mobile-viewport-wrapper">
      <div className={`mobile-viewport ${isFeed ? 'feed-viewport' : ''}`}>
        <main className="mobile-main-content">
          <Outlet />
        </main>
        <BottomNavBar />
      </div>
    </div>
  );
};
