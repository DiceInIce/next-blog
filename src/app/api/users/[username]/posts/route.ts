import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params
    const { searchParams } = new URL(request.url)
    const limitParam = searchParams.get('limit')
    const limit = Math.min(Math.max(Number(limitParam) || 20, 1), 50)

    const user = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    })
    if (!user) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 })
    }

    const include = {
      author: { select: { id: true, name: true, email: true, username: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } }
    }

    const items = await prisma.post.findMany({
      where: { authorId: user.id, status: 'PUBLISHED' },
      include,
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}


