'use client'

import { useState } from 'react'
import { Box, Container, Heading, VStack, HStack, Button, Link } from '@chakra-ui/react'
import { LuInfo, LuPlus } from 'react-icons/lu'
import CreatePostModal from '@/components/CreatePostModal'
import PostList from '@/components/PostList'
import Toast from '@/components/Toast'
import { ColorModeButton, useColorMode } from '@/components/ui/color-mode'

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
    isVisible: boolean
  }>({
    message: '',
    type: 'success',
    isVisible: false
  })
  const { colorMode } = useColorMode()

  // Цвета для темной/светлой темы с значениями по умолчанию
  const bgColor = colorMode === 'dark' ? 'gray.900' : 'gray.50'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'

  const handlePostCreated = () => {
    // Обновляем ключ, чтобы заставить PostList перезагрузить данные
    setRefreshKey(prev => prev + 1)
    
    // Показываем уведомление об успехе
    setToast({
      message: 'Пост успешно создан!',
      type: 'success',
      isVisible: true
    })
  }

  const openCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const closeCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }))
  }

  const showError = (message: string) => {
    setToast({
      message,
      type: 'error',
      isVisible: true
    })
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="6xl" px={4}>
        <VStack gap={8}>
          <Box w="full">
            <HStack justify="space-between" align="center" mb={6}>
              <Heading size="lg" color={textColor}>
                Блог на Next.js
              </Heading>
              <HStack>
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
              <Button
                colorScheme="blue"
                size="md"
                onClick={openCreateModal}
                _hover={{ transform: 'scale(1.05)' }}
                transition="all 0.2s"
              >
                <LuPlus style={{ marginRight: '8px' }} />
                Создать
              </Button>
            </HStack>
            
            <PostList key={refreshKey} />
          </Box>
        </VStack>
      </Container>

      {/* Модальное окно создания поста */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={closeCreateModal}
        onPostCreated={handlePostCreated}
        onError={showError}
      />
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={closeToast}
      />
    </Box>
  )
}
