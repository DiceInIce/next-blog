import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET метод для получения поста по ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID поста' },
        { status: 400 }
      )
    }

    const include: any = {
      author: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      tags: { include: { tag: true } },
      comments: {
        include: {
          author: { select: { id: true, name: true } }
        },
        orderBy: { createdAt: 'asc' }
      },
      _count: { select: { comments: true, likes: true } }
    }
    const post = await (prisma.post as any).findUnique({
      where: { id },
      include
    })

    if (!post) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// PUT метод для обновления поста
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию и получаем пользователя из cookies
    const token = request.cookies.get('token')?.value || null;
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }
    const currentUserId = Number(decoded.userId);

    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID поста' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { title, content, tags } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Необходимо указать title и content' },
        { status: 400 }
      )
    }

    // Проверяем, что пост принадлежит текущему пользователю
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== currentUserId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для изменения этого поста' },
        { status: 403 }
      )
    }

    // Обновляем пост
    const updated = await prisma.post.update({
      where: { id },
      data: { title, content },
    })

    // Если переданы теги — переустановим связи
    if (Array.isArray(tags)) {
      await (prisma as any).postTag.deleteMany({ where: { postId: id } })
      const uniqueTagNames = Array.from(new Set(tags.map((t: string) => t.trim()).filter(Boolean)))
      const tagRecords = await Promise.all(
        uniqueTagNames.map(async (name) => {
          const existing = await (prisma as any).tag.findUnique({ where: { name } })
          if (existing) return existing
          return (prisma as any).tag.create({ data: { name } })
        })
      )
      if (tagRecords.length > 0) {
        await (prisma as any).postTag.createMany({
          data: tagRecords.map((t: { id: number }) => ({ postId: id, tagId: t.id })),
          skipDuplicates: true
        })
      }
    }

    const updatedPost = await (prisma.post as any).findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        tags: { include: { tag: true } },
        comments: { include: { author: { select: { id: true, name: true } } } },
        _count: { select: { comments: true, likes: true } }
      } as any
    })

    return NextResponse.json({
      message: 'Пост успешно обновлен',
      post: updatedPost
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}

// DELETE метод для удаления поста
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Проверяем авторизацию и права через cookies
    const token = request.cookies.get('token')?.value || null;
    if (!token) {
      return NextResponse.json(
        { error: 'Требуется авторизация' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: 'Недействительный токен' },
        { status: 401 }
      );
    }
    const currentUserId = Number(decoded.userId);

    const { id: idParam } = await params
    const id = parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Неверный ID поста' },
        { status: 400 }
      )
    }

    // Проверяем, что пост принадлежит текущему пользователю
    const existingPost = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true }
    })

    if (!existingPost) {
      return NextResponse.json(
        { error: 'Пост не найден' },
        { status: 404 }
      )
    }

    if (existingPost.authorId !== currentUserId) {
      return NextResponse.json(
        { error: 'Недостаточно прав для удаления этого поста' },
        { status: 403 }
      )
    }

    // Удаляем зависимые сущности, затем сам пост (во избежание FK-ошибок)
    await prisma.$transaction([
      prisma.postTag.deleteMany({ where: { postId: id } }),
      prisma.comment.deleteMany({ where: { postId: id } }),
      prisma.postLike.deleteMany({ where: { postId: id } }),
      prisma.post.delete({ where: { id } })
    ])

    return NextResponse.json({
      message: 'Пост успешно удален'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
