import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET /api/posts/[id]/likes — получить количество лайков и лайкнут ли текущий
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = Number(id)
    if (Number.isNaN(postId)) {
      return NextResponse.json({ error: 'Неверный ID поста' }, { status: 400 })
    }

    const token = request.cookies.get('token')?.value || null
    const decoded = token ? verifyToken(token) : null
    const userId = decoded?.userId ? Number(decoded.userId) : null

    const count = await (prisma.postLike as any).count({ where: { postId } })
    let likedByMe = false
    if (userId) {
      const existing = await (prisma.postLike as any).findUnique({ where: { userId_postId: { userId, postId } } })
      likedByMe = Boolean(existing)
    }
    return NextResponse.json({ count, likedByMe })
  } catch (e) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}

// POST /api/posts/[id]/likes — toggle лайка
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

    const existing = await (prisma.postLike as any).findUnique({ where: { userId_postId: { userId, postId } } })
    if (existing) {
      await (prisma.postLike as any).delete({ where: { userId_postId: { userId, postId } } })
      const count = await (prisma.postLike as any).count({ where: { postId } })
      return NextResponse.json({ message: 'Лайк удален', liked: false, count })
    } else {
      await (prisma.postLike as any).create({ data: { userId, postId } })
      const count = await (prisma.postLike as any).count({ where: { postId } })
      return NextResponse.json({ message: 'Пост лайкнут', liked: true, count })
    }
  } catch (e) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}


