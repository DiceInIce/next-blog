import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name } = body;

    // Валидация данных
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Необходимо указать username, email и password' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли пользователь с таким username или email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким username или email уже существует' },
        { status: 409 }
      );
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Создаем нового пользователя
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        name: name || null
      },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return NextResponse.json(
      {
        message: 'Пользователь успешно зарегистрирован',
        user
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}
