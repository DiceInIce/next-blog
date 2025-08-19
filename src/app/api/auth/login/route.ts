import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Валидация данных
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать username и password' },
        { status: 400 }
      );
    }

    // Ищем пользователя по username
    const user = await prisma.user.findUnique({
      where: { username }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Неверный username или пароль' },
        { status: 401 }
      );
    }

    // Проверяем пароль
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Неверный username или пароль' },
        { status: 401 }
      );
    }

    // Создаем JWT токен
    const token = createToken({
      userId: user.id,
      username: user.username
    });

    // Готовим данные пользователя
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    };

    // Формируем ответ и устанавливаем httpOnly cookie
    const response = NextResponse.json({
      message: 'Успешная авторизация',
      user: userData
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 дней
    });

    return response;

  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
