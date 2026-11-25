// Идентификатор сессии ленты хранится в sessionStorage:
// после F5 пользователь продолжает с той же порцией из Redis, а в новой вкладке стартует новая сессия.
const FEED_SESSION_KEY = 'cctv.feed_session';

export const getFeedSession = (): string => {
  try {
    return sessionStorage.getItem(FEED_SESSION_KEY) ?? '';
  } catch {
    return '';
  }
};

export const setFeedSession = (sessionId: string): void => {
  try {
    sessionStorage.setItem(FEED_SESSION_KEY, sessionId);
  } catch {
    // Хранилище недоступно: сессия живёт только в Redux
  }
};
