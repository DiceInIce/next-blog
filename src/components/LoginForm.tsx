'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Text
} from '@chakra-ui/react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Очищаем ошибку при изменении полей
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      // Сервер установит httpOnly cookie, обновляем состояние локально
      login(data.user);

      // Дополнительно дергаем /api/auth/me, чтобы убедиться что cookie применена
      try { await fetch('/api/auth/me', { credentials: 'include' }); } catch {}

      // Жесткий редирект гарантирует наличие cookie в запросе к серверу
      window.location.href = '/';

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box w="full" maxW="md" mx="auto">
      <Stack gap={6}>
        <Heading size="lg" textAlign="center" color="gray.800" _dark={{ color: 'white' }}>
          Вход в систему
        </Heading>
        
        <Box as="form" onSubmit={handleSubmit} w="full">
          <Stack gap={6}>
            {error && (
              <Box
                bg="red.100"
                border="1px"
                borderColor="red.400"
                color="red.700"
                px={4}
                py={3}
                borderRadius="md"
              >
                {error}
              </Box>
            )}

            <Box>
              <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color="gray.700" _dark={{ color: 'gray.300' }}>
                Имя пользователя
              </Text>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Введите имя пользователя"
                size="lg"
                required
              />
            </Box>

            <Box>
              <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color="gray.700" _dark={{ color: 'gray.300' }}>
                Пароль
              </Text>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                size="lg"
                required
              />
            </Box>

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              w="full"
              loading={isLoading}
              loadingText="Вход..."
              mt={3}
            >
              Войти
            </Button>
          </Stack>
        </Box>

        <Text textAlign="center">
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={onSwitchToRegister}
            size="sm"
          >
            Нет аккаунта? Зарегистрироваться
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}
