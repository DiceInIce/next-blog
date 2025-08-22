'use client'

import { Box, Container, Heading, Text, Stack, Badge, HStack } from '@chakra-ui/react'
import Link from 'next/link'
import CommentsSection from '@/components/CommentsSection'

export interface PostViewProps {
  post: {
    id: number
    title: string
    content: string
    createdAt: string
    author: { username?: string | null; name?: string | null; email: string }
    tags: string[]
  }
}

export default function PostView({ post }: PostViewProps) {
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={12}>
      <Container maxW="5xl" px={4}>
        <Stack gap={8}>
          <Link href="/">← Назад</Link>

          <Box bg="white" _dark={{ bg: 'gray.800' }} shadow="md" rounded="xl" p={8}>
            <Stack gap={4}>
              <Heading size="2xl" color="gray.900" _dark={{ color: 'white' }}>{post.title}</Heading>
              <HStack gap={3} color="gray.600" _dark={{ color: 'gray.300' }}>
                <Box w="28px" h="28px" rounded="full" bg="gray.200" _dark={{ bg: 'gray.600' }} />
                <Text>
                  Автор: {post.author.username ? (
                    <Link href={`/users/${post.author.username}`}>{post.author.name || `@${post.author.username}`}</Link>
                  ) : (
                    post.author.name || post.author.email
                  )}
                </Text>
                <Text>· {new Date(post.createdAt).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}</Text>
              </HStack>

              <Box h="1px" bg="gray.200" _dark={{ bg: 'gray.700' }} />

              <Text fontSize="lg" color="gray.800" _dark={{ color: 'gray.100' }} whiteSpace="pre-wrap">
                {post.content}
              </Text>

              {post.tags.length > 0 && (
                <HStack gap={2} wrap="wrap">
                  {post.tags.map((name) => (
                    <Badge key={name} colorScheme="blue">#{name}</Badge>
                  ))}
                </HStack>
              )}
            </Stack>
          </Box>

          <Box id="comments">
            <CommentsSection postId={post.id} />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}


