import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './BottomNavBar.css';

export const BottomNavBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isFeedActive = location.pathname.startsWith('/feed');
  const isCatalogActive = location.pathname === '/' || location.pathname.startsWith('/catalog');

  return (
    <nav className="bottom-nav-bar" aria-label="Нижняя навигация">
      {/* 1. Лента (доступна) */}
      <button
        type="button"
        className={`nav-tab-item ${isFeedActive ? 'active' : 'inactive'}`}
        onClick={() => navigate('/feed/1')}
        title="Лента видеокамер"
      >
        <div className="nav-tab-icon">
          <svg width="21" height="13" viewBox="0 0 21 13" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.8344 7.41691L18.6225 10.6087C18.6915 10.6547 18.7717 10.681 18.8545 10.685C18.9373 10.6889 19.0197 10.6704 19.0928 10.6312C19.1659 10.5921 19.227 10.5339 19.2696 10.4628C19.3122 10.3917 19.3348 10.3103 19.3348 10.2274V2.71441C19.3348 2.63376 19.3136 2.55454 19.2732 2.48474C19.2328 2.41493 19.1747 2.35702 19.1048 2.31685C19.0348 2.27668 18.9555 2.25567 18.8749 2.25594C18.7942 2.25622 18.7151 2.27776 18.6454 2.31841L13.8344 5.12524M2.83348 1H12.0009C13.0135 1 13.8344 1.82081 13.8344 2.83333V10.1667C13.8344 11.1792 13.0135 12 12.0009 12H2.83348C1.82088 12 1 11.1792 1 10.1667V2.83333C1 1.82081 1.82088 1 2.83348 1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="nav-tab-title">Лента</div>
      </button>

      {/* 2. Добавление (недоступна в ЛР5) */}
      <button
        type="button"
        className="nav-tab-item inactive disabled"
        disabled
        title="Добавление камеры (недоступно в ЛР5)"
      >
        <div className="nav-tab-icon">
          <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6.50044 10.1674H13.8344M10.1674 6.50044V13.8344M19.3348 10.1674C19.3348 15.2304 15.2304 19.3348 10.1674 19.3348C5.10438 19.3348 1 15.2304 1 10.1674C1 5.10438 5.10438 1 10.1674 1C15.2304 1 19.3348 5.10438 19.3348 10.1674Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="nav-tab-title">Добавление</div>
      </button>

      {/* 3. Плитка (доступна) */}
      <button
        type="button"
        className={`nav-tab-item ${isCatalogActive ? 'active' : 'inactive'}`}
        onClick={() => navigate('/')}
        title="Плитка каталога"
      >
        <div className="nav-tab-icon">
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.25 1V17.5M1 9.25H17.5M2.83333 1H15.6667C16.6792 1 17.5 1.82081 17.5 2.83333V15.6667C17.5 16.6792 16.6792 17.5 15.6667 17.5H2.83333C1.82081 17.5 1 16.6792 1 15.6667V2.83333C1 1.82081 1.82081 1 2.83333 1Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <div className="nav-tab-title">Плитка</div>
      </button>

      {/* 4. Войти (недоступна в ЛР5) */}
      <button
        type="button"
        className="nav-tab-item inactive disabled"
        disabled
        title="Вход в систему (недоступно в ЛР5)"
      >
        <div className="nav-tab-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="nav-tab-title">Войти</div>
      </button>
    </nav>
  );
};
