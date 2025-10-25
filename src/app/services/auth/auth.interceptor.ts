import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('jwt_token');

  // Endpoints PÚBLICOS (no adjuntar Authorization)
  const isLogin = req.method === 'POST' && req.url.endsWith('/api/auth/login');
  const isRegister = req.method === 'POST' && req.url.endsWith('/api/users/register');
  // Listado público de usuarios (UserSearchDTO): GET /api/users y GET /api/users?... solo lista
  const isPublicUsersList =
    req.method === 'GET' && (req.url === '/api/users' || req.url.startsWith('/api/users?'));

  if (isLogin || isRegister || isPublicUsersList) {
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned);
  }

  return next(req);
};
