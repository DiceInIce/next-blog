'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  Spinner,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import { useAuth } from '@/hooks/useAuth'
import EditPostModal from '@/components/EditPostModal'

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  author: {
    id: number
    name: string | null
    email: string
  }
}

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const { colorMode } = useColorMode()
  const { isAuthenticated, user } = useAuth()
  const [editingPost, setEditingPost] = useState<{ id: number; title: string; content: string } | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  // Цвета для темной/светлой темы с значениями по умолчанию
  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'
  const subTextColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'
  const borderColor = colorMode === 'dark' ? 'gray.600' : 'gray.200'
  const cardBgColor = colorMode === 'dark' ? 'gray.700' : 'white'

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts')
      if (response.ok) {
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const data = await response.json()
            setPosts(data)
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
    fetchPosts()
  }, [])

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

  if (isLoading) {
    return (
      <Box bg={bgColor} rounded="lg" shadow="md" p={6}>
        <Heading size="lg" mb={6} color={textColor}>Список постов</Heading>
        <Box textAlign="center" color={subTextColor} py={8}>
          <Spinner size="lg" color="blue.500" />
          <Text mt={4}>Загрузка...</Text>
        </Box>
      </Box>
    )
  }

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
          onClick={fetchPosts}
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
      <Heading size="lg" mb={6} color={textColor}>Список постов</Heading>

      {posts.length === 0 ? (
        <Box textAlign="center" color={subTextColor} py={8}>
          <Text fontSize="lg">Постов пока нет. Создайте первый пост!</Text>
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
                <Heading size="md" color={textColor} maxW="70%">
                  {post.title}
                </Heading>
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

              <Stack direction="row" justify="space-between" fontSize="sm" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'}>
                <Text>Автор: {post.author.name || post.author.email}</Text>
                <Text>{new Date(post.createdAt).toLocaleDateString('ru-RU')}</Text>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Button
        onClick={fetchPosts}
        variant="outline"
        colorScheme="gray"
        size="md"
        w="full"
        mt={6}
      >
        Обновить список
      </Button>

      <EditPostModal
        isOpen={isEditOpen}
        post={editingPost}
        onClose={handleCloseEdit}
        onPostUpdated={handlePostUpdated}
        onError={(msg) => setError(msg)}
      />
    </Box>
  )
}
