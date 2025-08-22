import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PostView from '@/components/PostView'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostPage({ params }: PageProps) {
  const { id: idParam } = await params
  const id = Number(idParam)
  if (Number.isNaN(id)) return notFound()

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: { select: { id: true, name: true, username: true, email: true } },
      tags: { include: { tag: true } },
      _count: { select: { comments: true, likes: true } }
    }
  })

  if (!post) return notFound()

  return (
    <PostView
      post={{
        id: post.id,
        title: post.title,
        content: post.content,
        createdAt: post.createdAt.toISOString(),
        author: { username: post.author.username, name: post.author.name, email: post.author.email },
        tags: post.tags.map((t) => t.tag.name)
      }}
    />
  )
}


