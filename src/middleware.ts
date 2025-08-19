import { NextRequest, NextResponse } from 'next/server';

// Простая функция проверки JWT токена для middleware
function verifyTokenInMiddleware(token: string): any {
  try {
    // Простая проверка формата JWT (3 части, разделенные точками)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Декодируем payload (вторая часть)
    const payload = JSON.parse(atob(parts[1]));
    
    // Проверяем срок действия
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  // Проверяем только API маршруты для постов
  if (request.nextUrl.pathname.startsWith('/api/posts')) {
    // Для GET запросов (просмотр постов) авторизация не требуется
    if (request.method === 'GET') {
      return NextResponse.next();
    }
    
    // Для POST и DELETE запросов (создание и удаление постов) проверяем авторизацию
    if (request.method === 'POST' || request.method === 'DELETE') {
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (!token) {
        return NextResponse.json(
          { error: 'Требуется авторизация' },
          { status: 401 }
        );
      }

      const decoded = verifyTokenInMiddleware(token);

      if (!decoded) {
        return NextResponse.json(
          { error: 'Недействительный токен' },
          { status: 401 }
        );
      }

      // Проверяем структуру токена
      if (!decoded.userId || !decoded.username) {
        return NextResponse.json(
          { error: 'Недействительная структура токена' },
          { status: 401 }
        );
      }

      // Добавляем информацию о пользователе в заголовки для использования в API
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-user-id', decoded.userId.toString());
      requestHeaders.set('x-username', decoded.username);

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // Для других методов возвращаем ошибку
    return NextResponse.json(
      { error: 'Метод не поддерживается' },
      { status: 405 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/posts/:path*',
};
