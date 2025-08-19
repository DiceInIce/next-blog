'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Text,
  CloseButton,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
  onError?: (message: string) => void
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, onError }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const { colorMode } = useColorMode()

  // Обработка клавиши Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // Цвета для темной/светлой темы
  const bgColor = colorMode === 'dark' ? 'gray.800' : 'white'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'
  const labelColor = colorMode === 'dark' ? 'gray.300' : 'gray.700'
  const inputBgColor = colorMode === 'dark' ? 'gray.700' : 'white'
  const inputBorderColor = colorMode === 'dark' ? 'gray.600' : 'gray.300'
  const inputTextColor = colorMode === 'dark' ? 'white' : 'gray.800'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          authorId: parseInt(authorId)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Очищаем форму
        setTitle('')
        setContent('')
        setAuthorId('')
        
        // Сразу закрываем модальное окно
        onClose()
        
        // Вызываем callback для обновления списка постов
        onPostCreated?.()
      } else {
        setMessage(`Ошибка: ${data.error}`)
        setMessageType('error')
        // Передаем ошибку на главную страницу
        onError?.(`Ошибка: ${data.error}`)
      }
    } catch (error) {
      setMessage('Ошибка при создании поста')
      setMessageType('error')
      // Передаем ошибку на главную страницу
      onError?.('Ошибка при создании поста')
      console.error('Ошибка:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Очищаем форму при закрытии
    setTitle('')
    setContent('')
    setAuthorId('')
    setMessage('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bottom="0"
      bg="rgba(0, 0, 0, 0.5)"
      zIndex={1000}
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={4}
      onClick={handleClose}
      opacity={isOpen ? 1 : 0}
      visibility={isOpen ? 'visible' : 'hidden'}
      transition="opacity 0.2s ease-in-out, visibility 0.2s ease-in-out"
    >
      <Box
        bg={bgColor}
        borderRadius="lg"
        shadow="xl"
        maxW="2xl"
        w="full"
        maxH="90vh"
        overflowY="auto"
        position="relative"
        onClick={(e) => e.stopPropagation()}
        transform={isOpen ? 'scale(1)' : 'scale(0.95)'}
        opacity={isOpen ? 1 : 0}
        transition="transform 0.2s ease-in-out, opacity 0.2s ease-in-out"
      >
        {/* Заголовок */}
        <Box
          p={6}
          borderBottom="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
          position="relative"
        >
          <Text fontSize="xl" fontWeight="bold" color={textColor}>
            Создать новый пост
          </Text>
          <CloseButton
            position="absolute"
            top={4}
            right={4}
            onClick={handleClose}
            color={textColor}
          />
        </Box>
        
        {/* Содержимое */}
        <Box p={6}>
          <form onSubmit={handleSubmit}>
            <VStack gap={4}>
              {message && messageType === 'error' && (
                <Box 
                  w="full"
                  p={3} 
                  borderRadius="md"
                  bg={colorMode === 'dark' ? 'red.900' : 'red.100'}
                  color={colorMode === 'dark' ? 'red.200' : 'red.700'}
                  border="1px solid"
                  borderColor={colorMode === 'dark' ? 'red.700' : 'red.300'}
                >
                  {message}
                </Box>
              )}

              <Box w="full">
                <label htmlFor="authorId" style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: labelColor === 'gray.300' ? '#d1d5db' : '#374151', 
                  display: 'block', 
                  marginBottom: '8px' 
                }}>
                  ID автора *
                </label>
                <Input
                  type="number"
                  id="authorId"
                  value={authorId}
                  onChange={(e) => setAuthorId(e.target.value)}
                  placeholder="Введите ID пользователя"
                  size="md"
                  required
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  color={inputTextColor}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  disabled={isLoading}
                />
                <Text fontSize="xs" color={colorMode === 'dark' ? 'gray.400' : 'gray.500'} mt={1}>
                  Для тестирования используйте ID: 1
                </Text>
              </Box>

              <Box w="full">
                <label htmlFor="title" style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: labelColor === 'gray.300' ? '#d1d5db' : '#374151', 
                  display: 'block', 
                  marginBottom: '8px' 
                }}>
                  Заголовок *
                </label>
                <Input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Введите заголовок поста"
                  size="md"
                  required
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  color={inputTextColor}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  disabled={isLoading}
                />
              </Box>

              <Box w="full">
                <label htmlFor="content" style={{ 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  color: labelColor === 'gray.300' ? '#d1d5db' : '#374151', 
                  display: 'block', 
                  marginBottom: '8px' 
                }}>
                  Содержание *
                </label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                  placeholder="Введите содержание поста"
                  size="md"
                  required
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  color={inputTextColor}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  disabled={isLoading}
                />
              </Box>
            </VStack>
          </form>
        </Box>

        {/* Футер с кнопками */}
        <Box
          p={6}
          borderTop="1px solid"
          borderColor={colorMode === 'dark' ? 'gray.600' : 'gray.200'}
          display="flex"
          justifyContent="flex-end"
          gap={3}
        >
          <Button variant="ghost" onClick={handleClose} disabled={isLoading}>
            Отмена
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            loading={isLoading}
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Создание...' : 'Создать пост'}
          </Button>
        </Box>
      </Box>
    </Box>
  )
}
