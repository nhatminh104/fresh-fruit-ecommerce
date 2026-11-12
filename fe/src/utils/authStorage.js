const ACCESS_TOKEN_KEY = 'fresh.accessToken';
const REFRESH_TOKEN_KEY = 'fresh.refreshToken';

// sessionStorage: phiên chỉ tồn tại trong tab hiện tại — đóng tab/trình duyệt là mất,
// không lưu lại phiên đăng nhập như localStorage.
const storage = () => (typeof window !== 'undefined' ? window.sessionStorage : null);

export function getAccessToken() {
  return storage()?.getItem(ACCESS_TOKEN_KEY) || null;
}

export function getRefreshToken() {
  return storage()?.getItem(REFRESH_TOKEN_KEY) || null;
}

export function setAuthTokens({ accessToken, refreshToken } = {}) {
  const target = storage();
  if (!target) return;
  if (accessToken) target.setItem(ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) target.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearAuthTokens() {
  const target = storage();
  if (!target) return;
  target.removeItem(ACCESS_TOKEN_KEY);
  target.removeItem(REFRESH_TOKEN_KEY);
}
