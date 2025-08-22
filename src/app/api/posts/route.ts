import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-zа-я0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugify(title)
  let slug = base
  let i = 1
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const existing = await prisma.post.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${base}-${i}`
    i += 1
  }
}

// POST метод для создания нового поста
export async function POST(request: NextRequest) {
  try {
    // Читаем токен из httpOnly cookies
    const token = request.cookies.get('token')?.value || null;
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId || !decoded.username) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }

    const userId = Number(decoded.userId);

    // 1. Получаем данные из тела запроса
    const body = await request.json()
    const { title, content, tags = [], status = 'PUBLISHED' } = body as {
      title: string
      content: string
      tags?: string[]
      status?: 'DRAFT' | 'PUBLISHED'
    }

    // 2. Валидация данных
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Необходимо указать title и content' },
        { status: 400 }
      )
    }

    // 3. Проверяем, существует ли пользователь
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    const slug = await generateUniqueSlug(title)

    // Подготавливаем теги: создаем при необходимости, получаем их id
    const uniqueTagNames = Array.from(new Set((tags || []).map((t) => t.trim()).filter(Boolean)))
    const tagRecords = await Promise.all(
      uniqueTagNames.map(async (name) => {
        const existing = await prisma.tag.findUnique({ where: { name } })
        if (existing) return existing
        return prisma.tag.create({ data: { name } })
      })
    )

    // 4. Создаем новый пост в базе данных
    const createdPost = await prisma.post.create({
      data: {
        title,
        slug,
        content,
        status,
        authorId: userId
      }
    })

    if (tagRecords.length > 0) {
      await prisma.postTag.createMany({
        data: tagRecords.map((t) => ({ postId: createdPost.id, tagId: t.id })),
        skipDuplicates: true
      })
    }

    const post = await prisma.post.findUnique({
      where: { id: createdPost.id },
      include: {
        author: {
          select: { id: true, name: true, email: true, username: true }
        },
        tags: { include: { tag: true } },
        _count: { select: { comments: true, likes: true } }
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
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') || ''
    const tag = searchParams.get('tag') || ''
    const cursorParam = searchParams.get('cursor')
    const limitParam = searchParams.get('limit')
    const status = searchParams.get('status') || 'PUBLISHED'

    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 50)

    const where: any = {
      AND: [] as any[]
    }
    if (status === 'PUBLISHED') {
      where.status = 'PUBLISHED'
    }
    if (q) {
      where.AND.push({ OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { content: { contains: q, mode: 'insensitive' } }
      ] })
    }
    if (tag) {
      where.AND.push({ tags: { some: { tag: { name: tag } } } })
    }

    const commonInclude = {
      author: { select: { id: true, name: true, email: true, username: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } },
      comments: {
        include: { author: { select: { id: true, name: true, username: true } } },
        orderBy: { createdAt: 'desc' },
        take: 2
      }
    } as const

    // Если нет фильтров/пагинации — оставим прежнее поведение для обратной совместимости
    const hasAdvanced = q || tag || cursorParam || limitParam || status !== 'PUBLISHED'
    if (!hasAdvanced) {
      const posts = await prisma.post.findMany({
        where: { status: 'PUBLISHED' },
        include: commonInclude,
        orderBy: { createdAt: 'desc' },
        take: 20
      })
      return NextResponse.json(posts)
    }

    let items
    let nextCursor: number | null = null
    if (cursorParam) {
      const cursor = Number(cursorParam)
      items = await prisma.post.findMany({
        where,
        include: commonInclude,
        orderBy: { id: 'desc' },
        cursor: { id: cursor },
        skip: 1,
        take: limit
      })
    } else {
      items = await prisma.post.findMany({
        where,
        include: commonInclude,
        orderBy: { id: 'desc' },
        take: limit
      })
    }
    if (items.length === limit) {
      nextCursor = items[items.length - 1].id
    }
    return NextResponse.json({ items, nextCursor })
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
