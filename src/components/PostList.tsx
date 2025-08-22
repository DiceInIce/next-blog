'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Spinner,
  Input,
  Tag,
  HStack,
  Badge,
} from '@chakra-ui/react'
import Link from 'next/link'
import { useColorMode } from '@/components/ui/color-mode'
import { useAuth } from '@/hooks/useAuth'
import EditPostModal from '@/components/EditPostModal'
import CreatePostModal from '@/components/CreatePostModal'
import { LuPlus } from 'react-icons/lu'

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  author: {
    id: number
    name: string | null
    email: string
    username?: string
  }
  tags?: { tag: { id?: number; name: string } }[]
  _count?: { comments: number; likes: number }
  comments?: { content: string; createdAt: string; author: { id: number; name: string | null; username?: string } }[]
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { colorMode } = useColorMode()
  const { isAuthenticated, user } = useAuth()
  const [editingPost, setEditingPost] = useState<{ id: number; title: string; content: string } | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [nextCursor, setNextCursor] = useState<number | null>(null)
  const [likes, setLikes] = useState<Record<number, { count: number; likedByMe: boolean }>>({})
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Цвета для темной/светлой темы с значениями по умолчанию
  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'
  const subTextColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'
  const borderColor = colorMode === 'dark' ? 'gray.600' : 'gray.200'
  const cardBgColor = colorMode === 'dark' ? 'gray.700' : 'white'

  const fetchPosts = async (opts?: { reset?: boolean }) => {
    try {
      const params = new URLSearchParams()
      params.set('limit', '10')
      if (query) params.set('q', query)
      if (selectedTag) params.set('tag', selectedTag)
      if (!opts?.reset && nextCursor) params.set('cursor', String(nextCursor))
      const response = await fetch(`/api/posts?${params.toString()}`)
      if (response.ok) {
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json()
            if (Array.isArray(data)) {
              setPosts(opts?.reset ? data : [...posts, ...data])
              setNextCursor(null)
            } else {
              const items = (data.items || []) as Post[]
              setPosts(opts?.reset ? items : [...posts, ...items])
              setNextCursor(data.nextCursor ?? null)
            }
            // Инициализируем лайки
            if (isAuthenticated) {
              const ids = (Array.isArray(data) ? data : data.items || []).map((p: Post) => p.id)
              await Promise.all(ids.map(async (id: number) => {
                try {
                  const r = await fetch(`/api/posts/${id}/likes`, { credentials: 'include' })
                  if (r.ok) {
                    const ld = await r.json()
                    setLikes(prev => ({ ...prev, [id]: { count: ld.count ?? 0, likedByMe: !!ld.likedByMe } }))
                  }
                } catch {}
              }))
            } else {
              // Без авторизации используем только счетчик из _count
              const list = (Array.isArray(data) ? data : data.items || []) as Post[]
              const map: Record<number, { count: number; likedByMe: boolean }> = {}
              list.forEach(p => { map[p.id] = { count: p._count?.likes ?? 0, likedByMe: false } })
              setLikes(prev => ({ ...prev, ...map }))
            }
          } catch (parseError) {
            setError('Ошибка: Сервер вернул неверный формат данных')
          }
        } else {
          setError('Ошибка: Сервер вернул неожиданный тип данных')
        }
      } else {
        // Проверяем Content-Type ответа ошибки
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            setError(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`)
          } catch (parseError) {
            setError(`Ошибка сервера (${response.status}): Попробуйте позже`)
          }
        } else {
          setError(`Ошибка сервера (${response.status}): Попробуйте позже`)
        }
      }
    } catch (error) {
      setError('Ошибка сети: Проверьте подключение к интернету')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    setPosts([])
    setNextCursor(null)
    const timer = setTimeout(() => {
      fetchPosts({ reset: true }).finally(() => setIsLoading(false))
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedTag])

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) {
      return
    }

    if (!isAuthenticated) {
      setError('Требуется авторизация для удаления поста')
      return
    }

    try {
      const response = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== id))
        setLikes(prev => { const { [id]: _, ...rest } = prev; return rest })
      } else {
        // Проверяем Content-Type ответа ошибки
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json()
            setError(data.error || 'Ошибка при удалении поста')
          } catch (parseError) {
            setError(`Ошибка сервера (${response.status}): Не удалось удалить пост`)
          }
        } else {
          if (response.status === 401) {
            setError('Ошибка: Требуется повторная авторизация')
          } else {
            setError(`Ошибка сервера (${response.status}): Не удалось удалить пост`)
          }
        }
      }
    } catch (error) {
      setError('Ошибка сети: Не удалось удалить пост')
    }
  }

  const handleToggleLike = async (id: number) => {
    if (!isAuthenticated) {
      setError('Требуется авторизация для лайка')
      return
    }
    try {
      const r = await fetch(`/api/posts/${id}/likes`, { method: 'POST', credentials: 'include' })
      if (!r.ok) return
      const data = await r.json()
      setLikes(prev => ({ ...prev, [id]: { count: data.count ?? 0, likedByMe: !!data.liked } }))
    } catch {}
  }

  const handleOpenEdit = (post: Post) => {
    setEditingPost({ id: post.id, title: post.title, content: post.content })
    setIsEditOpen(true)
  }

  const handleCloseEdit = () => {
    setIsEditOpen(false)
    setEditingPost(null)
  }

  const handlePostUpdated = (updated: { id: number; title: string; content: string }) => {
    setPosts(prev => prev.map(p => p.id === updated.id ? { ...p, title: updated.title, content: updated.content } : p))
  }

  // Не возвращаем ранний лоадер, чтобы не терять фокус в поле ввода

  if (error) {
    return (
      <Box bg={bgColor} rounded="lg" shadow="md" p={6}>
        <Heading size="lg" mb={6} color={textColor}>Список постов</Heading>
        <Box 
          bg={colorMode === 'dark' ? 'red.900' : 'red.100'} 
          color={colorMode === 'dark' ? 'red.200' : 'red.700'} 
          p={3} 
          borderRadius="md" 
          border="1px solid" 
          borderColor={colorMode === 'dark' ? 'red.700' : 'red.300'}
          mb={4}
        >
          {error}
        </Box>
        <Button
          onClick={() => fetchPosts()}
          colorScheme="blue"
          size="md"
        >
          Попробовать снова
        </Button>
      </Box>
    )
  }

  return (
    <Box bg={bgColor} rounded="lg" shadow="md" p={6}>
      <Stack direction="row" justify="space-between" align="center" mb={4}>
        <Heading size="lg" color={textColor}>Список постов</Heading>
        {isAuthenticated && (
          <Button
            colorScheme="blue"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            transition="transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease"
            _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
            _active={{ transform: 'translateY(0)', boxShadow: 'sm' }}
          >
            <LuPlus style={{ marginRight: '2px' }} />Создать
          </Button>
        )}
      </Stack>
      <HStack gap={3} mb={6} align="stretch">
        <Input
          placeholder="Поиск по заголовку и содержимому..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg={cardBgColor}
        />
        {selectedTag && (
          <Tag.Root colorPalette="blue" size="md" w="10%">
            <Tag.Label>Тег: {selectedTag}</Tag.Label>
          </Tag.Root>
        )}
      </HStack>

      {posts.length === 0 ? (
        <Box textAlign="center" color={subTextColor} py={8}>
          {isLoading ? (
            <>
              <Spinner size="lg" color="blue.500" />
              <Text mt={4}>Загрузка...</Text>
            </>
          ) : (
            <Text fontSize="lg">Постов пока нет. Создайте первый пост!</Text>
          )}
        </Box>
      ) : (
        <Stack gap={4} align="stretch">
          {posts.map((post) => (
            <Box 
              key={post.id} 
              border="1px solid" 
              borderColor={borderColor} 
              rounded="lg" 
              p={4}
              bg={cardBgColor}
              _hover={{ shadow: "md" }}
              transition="all 0.2s"
            >
              <Stack direction="row" justify="space-between" align="flex-start" mb={2}>
                <Link href={`/posts/${post.id}`} style={{ textDecoration: 'none' }}>
                  <Heading size="md" color={textColor} maxW="100%" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap" _hover={{ color: colorMode === 'dark' ? 'blue.300' : 'blue.600' }}>
                    {post.title}
                  </Heading>
                </Link>
                {isAuthenticated && user?.id === post.author.id && (
                  <Stack direction="row">
                    <Button
                      onClick={() => handleOpenEdit(post)}
                      colorScheme="blue"
                      variant="ghost"
                      size="sm"
                    >
                      Редактировать
                    </Button>
                    <Button
                      onClick={() => handleDelete(post.id)}
                      colorScheme="red"
                      variant="ghost"
                      size="sm"
                    >
                      Удалить
                    </Button>
                  </Stack>
                )}
              </Stack>

              <Box mb={3}>
                <Text color={subTextColor}>
                  {post.content}
                </Text>
              </Box>

              {!!post.tags?.length && (
                <HStack gap={2} mb={3} wrap="wrap">
                  {post.tags.map((t, idx) => (
                    <Badge
                      key={`${post.id}-tag-${idx}-${t.tag.name}`}
                      colorScheme={selectedTag === t.tag.name ? 'blue' : 'gray'}
                      cursor="pointer"
                      onClick={() => setSelectedTag(selectedTag === t.tag.name ? '' : t.tag.name)}
                    >
                      #{t.tag.name}
                    </Badge>
                  ))}
                </HStack>
              )}

              

              <Stack direction="row" justify="space-between" fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                <Text>
                  Автор: {post.author.username ? (
                    <Link href={`/users/${post.author.username}`}>{post.author.name || `@${post.author.username}`}</Link>
                  ) : (
                    post.author.name || post.author.email
                  )}
                </Text>
                <HStack gap={3}>
                  <Link href={`/posts/${post.id}#comments`} style={{ textDecoration: 'none' }}>
                    <Button
                      size="xs"
                      variant="outline"
                      colorScheme="blue"
                    >
                      💬 {post._count?.comments ?? 0}
                    </Button>
                  </Link>
                  <Button
                    size="xs"
                    variant={likes[post.id]?.likedByMe ? 'solid' : 'outline'}
                    colorScheme="pink"
                    onClick={() => handleToggleLike(post.id)}
                  >
                    ❤ {likes[post.id]?.count ?? (post._count?.likes ?? 0)}
                  </Button>
                  <Text>{new Date(post.createdAt).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
                </HStack>
              </Stack>

              {!!post.comments?.length && (
                <Box mt={3}>
                  {(post._count?.comments ?? 0) > (post.comments?.length ?? 0) && (
                    <Link href={`/posts/${post.id}#comments`} style={{ textDecoration: 'none' }}>
                      <Text fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.600'} _hover={{ color: colorMode === 'dark' ? 'blue.300' : 'blue.600' }}>
                        Посмотреть все {post._count?.comments} комментариев
                      </Text>
                    </Link>
                  )}
                  <Stack gap={2} mt={2}>
                    {post.comments.map((c, i) => (
                      <Link key={`${post.id}-cprev-${i}`} href={`/posts/${post.id}#comments`} style={{ textDecoration: 'none' }}>
                        <HStack gap={2} align="start" _hover={{ bg: colorMode === 'dark' ? 'gray.600' : 'gray.100' }} p={2} rounded="md" transition="background 0.15s ease">
                          <Box w="18px" h="18px" rounded="full" bg={colorMode === 'dark' ? 'gray.500' : 'gray.300'} flexShrink={0} />
                          <Text
                            fontSize="sm"
                            color={textColor}
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis"
                          >
                            <Text as="span" fontWeight="bold">{c.author?.name || c.author?.username || 'Аноним'}</Text> {c.content}
                          </Text>
                        </HStack>
                      </Link>
                    ))}
                  </Stack>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      )}

      <HStack mt={6}>
        <Button
          onClick={() => { setIsLoading(true); fetchPosts({ reset: true }).finally(() => setIsLoading(false)) }}
          variant="outline"
          colorScheme="gray"
          size="md"
        >
          Обновить список
        </Button>
        {nextCursor && (
          <Button
            onClick={() => { setIsLoading(true); fetchPosts().finally(() => setIsLoading(false)) }}
            colorScheme="blue"
            size="md"
          >
            Загрузить ещё
          </Button>
        )}
      </HStack>

      <EditPostModal
        isOpen={isEditOpen}
        post={editingPost}
        onClose={handleCloseEdit}
        onPostUpdated={handlePostUpdated}
        onError={(msg) => setError(msg)}
      />
      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onPostCreated={() => { setIsCreateOpen(false); setIsLoading(true); fetchPosts({ reset: true }).finally(() => setIsLoading(false)) }}
        onError={(msg) => setError(msg)}
      />
    </Box>
  )
}
