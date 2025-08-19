import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST метод для создания нового поста
export async function POST(request: NextRequest) {
  try {
    // Получаем ID пользователя из заголовков (установленных middleware)
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    // 1. Получаем данные из тела запроса
    const body = await request.json()
    const { title, content } = body

    // 2. Валидация данных
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Необходимо указать title и content' },
        { status: 400 }
      )
    }

    // 3. Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // 4. Создаем новый пост в базе данных
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(userId)
      },
      // 5. Возвращаем созданный пост с информацией об авторе
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      }
    })

    // 6. Возвращаем успешный ответ
    return NextResponse.json(
      {
        message: 'Пост успешно создан',
        post
      },
      { status: 201 }
    )

  } catch (error) {
    // 7. Обработка ошибок
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// GET метод для получения всех постов
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(posts)
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
