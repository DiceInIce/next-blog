'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Input,
  Stack,
  Heading,
  Text
} from '@chakra-ui/react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Очищаем ошибку при изменении полей
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          name: formData.name || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      // Показываем сообщение об успешной регистрации и переключаемся на форму входа
      alert('Регистрация прошла успешно! Теперь вы можете войти в систему.');
      onSwitchToLogin();

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
          Регистрация
        </Heading>
        
        <Box as="form" onSubmit={handleSubmit} w="full">
          <Stack gap={4}>
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
                Имя пользователя *
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
                Email *
              </Text>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Введите email"
                size="lg"
                required
              />
            </Box>

            <Box>
              <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color="gray.700" _dark={{ color: 'gray.300' }}>
                Имя (необязательно)
              </Text>
              <Input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введите ваше имя"
                size="lg"
              />
            </Box>

            <Box>
              <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color="gray.700" _dark={{ color: 'gray.300' }}>
                Пароль *
              </Text>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                size="lg"
                required
              />
            </Box>

            <Box>
              <Text as="label" display="block" fontSize="sm" fontWeight="medium" mb={1} color="gray.700" _dark={{ color: 'gray.300' }}>
                Подтвердите пароль *
              </Text>
              <Input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторите пароль"
                size="lg"
                required
              />
            </Box>

            <Button
              type="submit"
              colorScheme="green"
              size="lg"
              w="full"
              loading={isLoading}
              loadingText="Регистрация..."
            >
              Зарегистрироваться
            </Button>
          </Stack>
        </Box>

        <Text textAlign="center">
          <Button
            variant="ghost"
            colorScheme="blue"
            onClick={onSwitchToLogin}
            size="sm"
          >
            Уже есть аккаунт? Войти
          </Button>
        </Text>
      </Stack>
    </Box>
  );
}
