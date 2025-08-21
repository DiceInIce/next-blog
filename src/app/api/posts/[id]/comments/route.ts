import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/posts/[id]/comments
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = Number(id)
    if (Number.isNaN(postId)) {
      return NextResponse.json({ error: 'Неверный ID поста' }, { status: 400 })
    }

    const comments = await (prisma.comment as any).findMany({
      where: { postId },
      include: { author: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json(comments)
  } catch (e) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// POST /api/posts/[id]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value || null
    if (!token) {
      return NextResponse.json({ error: 'Требуется авторизация' }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: 'Недействительный токен' }, { status: 401 })
    }
    const userId = Number(decoded.userId)

    const { id } = await params
    const postId = Number(id)
    if (Number.isNaN(postId)) {
      return NextResponse.json({ error: 'Неверный ID поста' }, { status: 400 })
    }

    const { content } = await request.json()
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: 'Пустой комментарий' }, { status: 400 })
    }

    const post = await prisma.post.findUnique({ where: { id: postId } })
    if (!post) {
      return NextResponse.json({ error: 'Пост не найден' }, { status: 404 })
    }

    const created = await (prisma.comment as any).create({
      data: { postId, authorId: userId, content: content.trim() },
      include: { author: { select: { id: true, name: true } } }
    })
    return NextResponse.json({ message: 'Комментарий добавлен', comment: created }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}


