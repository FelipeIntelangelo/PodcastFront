import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  // Exclude login and register endpoints from adding the Authorization header
  const excludedUrls = ['/api/auth/login', '/api/users/register'];
  if (excludedUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(cloned);
  }

  return next(req);
};
