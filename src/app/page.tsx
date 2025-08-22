'use client'

import { useState } from 'react'
import { Box, Container, Heading, Stack, Button, Link, Text, HStack, Image } from '@chakra-ui/react'
import { LuInfo, LuPlus, LuLogOut, LuUser } from 'react-icons/lu'
import CreatePostModal from '@/components/CreatePostModal'
import PostList from '@/components/PostList'
import Toast from '@/components/Toast'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ColorModeButton, useColorMode } from '@/components/ui/color-mode'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

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
  const { user, logout } = useAuth()
  const router = useRouter()

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

  const handleLogout = () => {
    logout()
    setToast({
      message: 'Вы успешно вышли из системы',
      type: 'success',
      isVisible: true
    })
    
    // Перенаправляем на страницу авторизации
    setTimeout(() => {
      router.push('/auth')
    }, 1000) // Небольшая задержка, чтобы пользователь увидел уведомление
  }

  return (
    <ProtectedRoute>
      <Box minH="100vh" bg={bgColor} py={8}>
        <Container maxW="6xl" px={4}>
          <Stack gap={8}>
            <Box w="full">
              <Stack direction="row" justify="space-between" align="center" mb={6}>
                <HStack gap={3} align="center">
                  <Image src={colorMode === 'dark' ? '/logo-dark.svg' : '/logo-light.svg'} alt="Черновик" boxSize="28px" />
                  <Heading size="lg" color={textColor}>
                    Черновик
                  </Heading>
                </HStack>

                <Stack direction="row">
                  {user?.username ? (
                    <Link href={`/users/${user.username}`} _hover={{ textDecoration: 'none' }} role="group" mr={2}>
                      <Text
                        color={textColor}
                        fontSize="sm"
                        fontWeight="bold"
                        transition="color 0.15s ease, text-decoration-color 0.15s ease"
                        _groupHover={{
                          color: colorMode === 'dark' ? 'blue.300' : 'blue.600',
                          textDecoration: 'underline',
                          textDecorationColor: colorMode === 'dark' ? 'blue.300' : 'blue.600'
                        }}
                      >
                        {user?.name || user.username}
                      </Text>
                    </Link>
                  ) : (
                    <Text color={textColor} fontSize="sm" fontWeight="bold" mr={2} mt={2}>
                      {user?.name || user?.username}
                    </Text>
                  )}
                  <Button
                    colorScheme="red"
                    variant="outline"
                    size="md"
                    onClick={handleLogout}
                    transition="transform 0.15s ease, box-shadow 0.15s ease"
                    _hover={{ transform: 'translateY(-1px)', boxShadow: 'md' }}
                    _active={{ transform: 'translateY(0)', boxShadow: 'sm' }}
                  >
                    <LuLogOut style={{ marginRight: '8px' }} />
                    Выйти
                  </Button>
                </Stack>
              </Stack>

              <PostList key={refreshKey} />
            </Box>
          </Stack>
        </Container>

        <Container maxW="6xl" px={4} mt={6}>
          <Stack direction="row" justify="space-between">
            <Stack direction="row">
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
            </Stack>
            
            <Text color={textColor} fontSize="sm" fontWeight="bold" mt={2}>Developed by
              <Link href="https://github.com/DiceInIce" _hover={{ textDecoration: 'none' }} ml={1}>DiceInIce</Link>
            </Text>
          </Stack>
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
    </ProtectedRoute>
  )
}
