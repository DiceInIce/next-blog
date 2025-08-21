'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Input,
  Textarea,
  Stack,
  Text,
  CloseButton,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'
import { useAuth } from '@/hooks/useAuth'

interface CreatePostModalProps {
  isOpen: boolean
  onClose: () => void
  onPostCreated?: () => void
  onError?: (message: string) => void
}

export default function CreatePostModal({ isOpen, onClose, onPostCreated, onError }: CreatePostModalProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const { colorMode } = useColorMode()
  const { isAuthenticated } = useAuth()

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



    if (!isAuthenticated) {
      setMessage('Ошибка: Требуется авторизация')
      setMessageType('error')
      setIsLoading(false)
      return
    }

    try {
      const headers = {
        'Content-Type': 'application/json'
      };



      const response = await fetch('/api/posts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        }),
        credentials: 'include'
      })



      if (!response.ok) {
        // Проверяем Content-Type ответа
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          // Если это JSON, парсим как обычно
          try {
            const data = await response.json();
            setMessage(`Ошибка: ${data.error || 'Неизвестная ошибка'}`)
            setMessageType('error')
            onError?.(`Ошибка: ${data.error || 'Неизвестная ошибка'}`)
          } catch (parseError) {
            setMessage('Ошибка: Сервер вернул неверный формат ответа')
            setMessageType('error')
          }
        } else {
          // Если это не JSON (например, HTML страница ошибки), показываем общую ошибку
          const responseText = await response.text();
          
          if (response.status === 401) {
            setMessage('Ошибка: Требуется повторная авторизация')
            setMessageType('error')
            onError?.('Ошибка: Требуется повторная авторизация')
          } else {
            setMessage(`Ошибка сервера (${response.status}): Попробуйте позже`)
            setMessageType('error')
            onError?.(`Ошибка сервера (${response.status}): Попробуйте позже`)
          }
        }
      } else {
        try {
          const data = await response.json()
          
          // Очищаем форму
          setTitle('')
          setContent('')
          setTags('')
          
          // Сразу закрываем модальное окно
          onClose()
          
          // Вызываем callback для обновления списка постов
          onPostCreated?.()
        } catch (parseError) {
          // Даже если не удалось распарсить ответ, считаем операцию успешной
          setTitle('')
          setContent('')
          setTags('')
          onClose()
          onPostCreated?.()
        }
      }
    } catch (error) {
      setMessage('Ошибка при создании поста')
      setMessageType('error')
      onError?.('Ошибка при создании поста')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    // Очищаем форму при закрытии
    setTitle('')
    setContent('')
    setTags('')
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
            <Stack gap={4}>
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
                <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color={labelColor}>
                  Заголовок *
                </Text>
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
                <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color={labelColor}>
                  Содержание *
                </Text>
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

              <Box w="full">
                <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color={labelColor}>
                  Теги (через запятую)
                </Text>
                <Input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="например: nextjs, prisma, ui"
                  size="md"
                  bg={inputBgColor}
                  borderColor={inputBorderColor}
                  color={inputTextColor}
                  _placeholder={{ color: colorMode === 'dark' ? 'gray.400' : 'gray.500' }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                  disabled={isLoading}
                />
              </Box>
            </Stack>
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
