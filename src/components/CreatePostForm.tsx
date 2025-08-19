'use client'

import { useState } from 'react'
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  Heading,
  Text,
} from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'

interface CreatePostFormProps {
  onPostCreated?: () => void
}

export default function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const { colorMode } = useColorMode()

  // Цвета для темной/светлой темы с значениями по умолчанию
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
        setMessage('Пост успешно создан!')
        setMessageType('success')
        setTitle('')
        setContent('')
        setAuthorId('')
        
        // Вызываем callback для обновления списка постов
        onPostCreated?.()
      } else {
        setMessage(`Ошибка: ${data.error}`)
        setMessageType('error')
      }
    } catch (error) {
      setMessage('Ошибка при создании поста')
      setMessageType('error')
      console.error('Ошибка:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Box maxW="2xl" mx="auto" p={6} bg={bgColor} rounded="lg" shadow="md">
      <Heading size="lg" mb={6} color={textColor}>
        Создать новый пост
      </Heading>
      
      <form onSubmit={handleSubmit}>
        <VStack gap={4}>
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
            />
          </Box>

          <Button
            type="submit"
            loading={isLoading}
            colorScheme="blue"
            size="md"
            w="full"
            mt={2}
          >
            {isLoading ? 'Создание...' : 'Создать пост'}
          </Button>
        </VStack>
      </form>

      {message && (
        <Box 
          mt={4} 
          p={3} 
          borderRadius="md"
          bg={messageType === 'success' ? 
            (colorMode === 'dark' ? 'green.900' : 'green.100') : 
            (colorMode === 'dark' ? 'red.900' : 'red.100')
          }
          color={messageType === 'success' ? 
            (colorMode === 'dark' ? 'green.200' : 'green.700') : 
            (colorMode === 'dark' ? 'red.200' : 'red.700')
          }
          border="1px solid"
          borderColor={messageType === 'success' ? 
            (colorMode === 'dark' ? 'green.700' : 'green.300') : 
            (colorMode === 'dark' ? 'red.700' : 'red.300')
          }
        >
          {message}
        </Box>
      )}
    </Box>
  )
}
