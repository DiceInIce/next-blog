'use client'

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Badge,
  Link,
  Button,
  Icon,
  SimpleGrid,
} from '@chakra-ui/react'
import { LuGithub, LuExternalLink, LuCode, LuDatabase, LuPalette } from 'react-icons/lu'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ColorModeButton, useColorMode } from '@/components/ui/color-mode'

export default function AboutPage() {
  const { colorMode } = useColorMode()

  // Цвета для темной/светлой темы с значениями по умолчанию
  const bgColor = colorMode === 'dark' ? 'gray.900' : 'gray.50'
  const textColor = colorMode === 'dark' ? 'white' : 'gray.800'
  const cardBgColor = colorMode === 'dark' ? 'gray.800' : 'white'
  const subTextColor = colorMode === 'dark' ? 'gray.300' : 'gray.600'

  const features = [
    {
      icon: LuCode,
      title: 'Next.js 15',
      description: 'Современный React фреймворк с App Router'
    },
    {
      icon: LuDatabase,
      title: 'Prisma ORM',
      description: 'Типобезопасная работа с базой данных'
    },
    {
      icon: LuPalette,
      title: 'Chakra UI v3',
      description: 'Библиотека компонентов для быстрой разработки'
    }
  ]

  return (
    <ProtectedRoute>
      <Box minH="100vh" bg={bgColor} py={12}>
        <Container maxW="6xl" px={4}>
          {/* Навигация с кнопкой переключения темы */}
          <Stack direction="row" justify="flex-end" w="full" mb={8}>
            <ColorModeButton size="md" />
          </Stack>

          <Stack gap={12} align="stretch">
            {/* Заголовок */}
            <Box textAlign="center">
              <Heading size="2xl" color={textColor} mb={4}>
                О проекте
              </Heading>
              <Text fontSize="lg" color={subTextColor} maxW="2xl" mx="auto">
                Современный блог-платформа, построенная с использованием передовых технологий веб-разработки
              </Text>
            </Box>

            {/* Основные возможности */}
            <Box>
              <Heading size="lg" color={textColor} mb={6} textAlign="center">
                Технологический стек
              </Heading>
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                {features.map((feature, index) => (
                  <Box key={index} bg={cardBgColor} shadow="md" p={6} rounded="lg" _hover={{ shadow: "lg" }} transition="all 0.2s">
                    <Box textAlign="center" pb={2}>
                      <Icon as={feature.icon} boxSize={8} color="blue.500" mx="auto" display="block" mb={3} />
                      <Heading size="md" color={textColor}>
                        {feature.title}
                      </Heading>
                    </Box>
                    <Box textAlign="center" pt={0}>
                      <Text color={subTextColor}>
                        {feature.description}
                      </Text>
                    </Box>
                  </Box>
                ))}
              </SimpleGrid>
            </Box>

            {/* Описание проекта */}
            <Box bg={cardBgColor} p={8} rounded="xl" shadow="md">
              <Stack gap={6} align="stretch">
                <Heading size="lg" color={textColor}>
                  Что это за проект?
                </Heading>
                <Text color={subTextColor} lineHeight="tall">
                  Это полнофункциональная платформа для ведения блога, которая демонстрирует возможности
                  современной веб-разработки. Проект включает в себя создание, просмотр и управление постами,
                  а также красивый и отзывчивый пользовательский интерфейс.
                </Text>
                <Text color={subTextColor} lineHeight="tall">
                  Проект построен с использованием Next.js 15, который обеспечивает отличную производительность
                  и SEO-оптимизацию. Для работы с данными используется Prisma ORM, а для создания
                  пользовательского интерфейса - Chakra UI v3.
                </Text>
              </Stack>
            </Box>

            {/* Ссылки */}
            <Box textAlign="center">
              <Stack direction="row" gap={4} justify="center" wrap="wrap">
                <Link href="https://github.com" _hover={{ textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
                  <Button
                    colorScheme="gray"
                    variant="outline"
                    size="lg"
                  >
                    <LuGithub style={{ marginRight: '8px' }} />
                    GitHub
                  </Button>
                </Link>
                <Link href="/" _hover={{ textDecoration: 'none' }}>
                  <Button
                    colorScheme="blue"
                    size="lg"
                  >
                    <LuExternalLink style={{ marginRight: '8px' }} />
                    Вернуться к блогу
                  </Button>
                </Link>
              </Stack>
            </Box>

            {/* Версия */}
            <Box textAlign="center" pt={8}>
              <Badge colorScheme="blue" variant="subtle" fontSize="sm" p={2}>
                Версия 1.0.0
              </Badge>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ProtectedRoute>
  )
}
