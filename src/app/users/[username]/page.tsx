import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { Box, Container, Heading, Text, Stack, Badge, SimpleGrid, Link as ChakraLink } from '@chakra-ui/react'
import { ColorModeButton } from '@/components/ui/color-mode'
import Link from 'next/link'
import UserPostsToggle from '@/components/UserPostsToggle'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: { posts: true, comments: true, likes: true }
      }
    }
  })

  if (!user) return notFound()

  // NOTE: Chakra useColorMode is a client hook; we'll inline minimal styles instead
  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: 'gray.900' }} py={12}>
      <Container maxW="5xl" px={4}>
        <Stack direction="row" justify="space-between" align="center" mb={8}>
          <Link href="/">
            <ChakraLink color="blue.500">← Назад</ChakraLink>
          </Link>
          <ColorModeButton size="md" />
        </Stack>

        <Box bg="white" _dark={{ bg: 'gray.800' }} shadow="md" rounded="xl" p={8}>
          <Stack gap={3}>
            <Heading size="xl" color="gray.900" _dark={{ color: 'white' }}>
              {user.name || user.username}
            </Heading>
            <Text color="gray.600" _dark={{ color: 'gray.300' }}>@{user.username}</Text>
            <Text color="gray.600" _dark={{ color: 'gray.300' }}>{user.email}</Text>

            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} pt={4}>
              <Box>
                <UserPostsToggle username={user.username} count={user._count.posts} />
              </Box>
              <Box>
                <Badge colorScheme="green" variant="subtle" p={2} rounded="md">Комментариев: {user._count.comments}</Badge>
              </Box>
              <Box>
                <Badge colorScheme="purple" variant="subtle" p={2} rounded="md">Лайков: {user._count.likes}</Badge>
              </Box>
            </SimpleGrid>
          </Stack>
        </Box>
      </Container>
    </Box>
  )
}


