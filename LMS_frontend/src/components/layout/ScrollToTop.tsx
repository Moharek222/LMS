import { useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, searchParams]);

  return null;
}

export default ScrollToTop;
