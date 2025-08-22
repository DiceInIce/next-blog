'use client'

import { useEffect, useState } from 'react'
import { Box, Stack, Heading, Text, HStack, Input, Button, Spinner } from '@chakra-ui/react'
import { useAuth } from '@/hooks/useAuth'

interface CommentItem {
  id: number
  content: string
  createdAt: string
  author: { id: number; name: string | null }
}

export default function CommentsSection({ postId }: { postId: number }) {
  const { isAuthenticated } = useAuth()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const load = async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, { cache: 'no-store' })
      if (!res.ok) {
        setError('Не удалось загрузить комментарии')
      } else {
        const data = await res.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      setError('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content })
      })
      if (res.ok) {
        setContent('')
        await load()
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.error || 'Не удалось добавить комментарий')
      }
    } catch (e) {
      setError('Ошибка сети')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box mt={10}>
      <Heading size="md" mb={4}>Комментарии</Heading>

      {isAuthenticated && (
        <Box >
          <HStack gap={2} align="start">
            <Input
              placeholder="Написать комментарий..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button colorScheme="blue" onClick={handleSubmit} loading={isSubmitting}>
              Отправить
            </Button>
          </HStack>
        </Box>
      )}

      {isLoading ? (
        <HStack mt={4}><Spinner size="sm" /><Text>Загрузка...</Text></HStack>
      ) : error ? (
        <Text color="red.500" mt={4}>{error}</Text>
      ) : (
        <Stack gap={4} align="stretch" mt={4}>
          {comments.length === 0 ? (
            <Text color="gray.600" _dark={{ color: 'gray.300' }}>Пока нет комментариев</Text>
          ) : comments.map(c => (
            <Box key={c.id} bg="gray.50" _dark={{ bg: 'gray.800', borderColor: 'gray.700' }} p={3} rounded="md" border="1px solid" borderColor="gray.200">
              <Text fontWeight="bold">{c.author?.name || 'Аноним'}</Text>
              <Text mt={1}>{c.content}</Text>
              <Text fontSize="xs" color="gray.500" mt={1}>{new Date(c.createdAt).toLocaleString('ru-RU')}</Text>
            </Box>
          ))}
        </Stack>
      )}


    </Box>
  )
}


