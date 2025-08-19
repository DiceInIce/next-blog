'use client'

import { useState } from 'react'
import { Box, Container, Heading, SimpleGrid, VStack, HStack, Button, Link } from '@chakra-ui/react'
import { LuInfo } from 'react-icons/lu'
import CreatePostForm from '@/components/CreatePostForm'
import PostList from '@/components/PostList'
import { ColorModeButton, useColorMode } from '@/components/ui/color-mode'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const { colorMode } = useColorMode()

  // Цвета для темной/светлой темы с значениями по умолчанию
  const bgColor = colorMode === 'dark' ? 'gray.900' : 'gray.50'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'

  const handlePostCreated = () => {
    // Обновляем ключ, чтобы заставить PostList перезагрузить данные
    setRefreshKey(prev => prev + 1)
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="6xl" px={4}>
        <VStack gap={8}>
          {/* Навигация */}
          <HStack justify="space-between" w="full" mb={4}>
            <Heading
              size="2xl"
              textAlign="center"
              color={textColor}
              fontWeight="bold"
            >
              Блог на Next.js
            </Heading>
            <Box />
            <HStack gap={2}>
              <ColorModeButton size="md" />
              <Link href="/about" _hover={{ textDecoration: 'none' }}>
                <Button
                  colorScheme="blue"
                  variant="ghost"
                  size="md"
                >
                  <LuInfo style={{ marginRight: '8px' }} />
                  О проекте
                </Button>
              </Link>
            </HStack>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8} w="full">
            {/* Форма создания поста */}
            <Box>
              <CreatePostForm onPostCreated={handlePostCreated} />
            </Box>
            
            {/* Список постов */}
            <Box>
              <PostList key={refreshKey} />
            </Box>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}
