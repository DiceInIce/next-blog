import { NextRequest, NextResponse } from 'next/server';

// Edge Runtime: нельзя использовать jsonwebtoken. Делаем лёгкую проверку структуры/exp.
function base64UrlDecode(input: string): string {
  // JWT использует base64url ("-" и "_" вместо "+" и "/" и без паддинга)
  let output = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = output.length % 4;
  if (pad === 2) output += '==';
  else if (pad === 3) output += '=';
  else if (pad !== 0) throw new Error('Invalid base64url string');
  return atob(output);
}

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    if (payload && payload.exp && payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Разрешаем доступ к странице авторизации и статическим файлам
  // Разрешаем любые запросы к статическим ресурсам (файлы с расширением)
  const isStaticAsset = /\.[A-Za-z0-9]+$/.test(pathname);
  if (pathname === '/auth' || 
      pathname.startsWith('/_next/') || 
      pathname === '/favicon.ico' ||
      isStaticAsset) {
    return NextResponse.next();
  }
  
  // Проверяем авторизацию для страниц (не API роутов)
  // Для страниц используем только cookies, так как заголовки Authorization не передаются при навигации
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    // Перенаправляем на страницу авторизации
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  const decoded = decodeJwtPayload(token);
  
  if (!decoded) {
    // Если токен недействителен, перенаправляем на авторизацию
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  // Проверяем структуру токена
  if (!decoded.userId || !decoded.username) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
