'use client'

import { useState } from 'react'
import { Box, Stack, Badge, Spinner, Text, HStack, Link } from '@chakra-ui/react'
import NextLink from 'next/link'

interface UserPostsToggleProps {
  username: string
  count: number
}

interface PostItem {
  id: number
  title: string
  createdAt: string
}

export default function UserPostsToggle({ username, count }: UserPostsToggleProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [posts, setPosts] = useState<PostItem[]>([])

  const toggle = async () => {
    const next = !isOpen
    setIsOpen(next)
    if (next && posts.length === 0 && !isLoading) {
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/users/${username}/posts?limit=20`, { cache: 'no-store' })
        if (!res.ok) {
          setError('Не удалось загрузить посты')
        } else {
          const data = await res.json()
          const items: PostItem[] = Array.isArray(data) ? data : (data.items || [])
          setPosts(items)
        }
      } catch (e) {
        setError('Ошибка сети')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Box>
      <Badge
        colorScheme="blue"
        variant="subtle"
        p={2}
        rounded="md"
        cursor="pointer"
        onClick={toggle}
        _hover={{ bg: 'blue.100', _dark: { bg: 'blue.900' } }}
        title="Показать посты пользователя"
      >
        Постов: {count}
      </Badge>

      {isOpen && (
        <Box
          mt={4}
          bg="white"
          border="1px solid"
          borderColor="gray.200"
          rounded="md"
          p={4}
          _dark={{ bg: 'gray.700', borderColor: 'gray.600' }}
        >
          {isLoading ? (
            <HStack>
              <Spinner size="sm" />
              <Text>Загрузка...</Text>
            </HStack>
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : posts.length === 0 ? (
            <Text>У пользователя пока нет постов</Text>
          ) : (
            <Stack gap={3} align="stretch">
              {posts.map((p) => (
                <Box key={p.id}>
                  <Link as={NextLink} href={`/posts/${p.id}`} _hover={{ textDecoration: 'none' }}>
                    <Text fontWeight="bold" color="blue.600" _dark={{ color: 'blue.300' }}>
                      {p.title}
                    </Text>
                  </Link>
                  <Text fontSize="sm" color="gray.600" _dark={{ color: 'gray.300' }}>
                    {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      )}
    </Box>
  )
}


