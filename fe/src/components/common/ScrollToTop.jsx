import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Cuộn lên đầu trang mỗi khi chuyển route (User/Admin/Auth đều dùng chung).
export default function ScrollToTop() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
  }, [pathname, search]);
  return null;
}
