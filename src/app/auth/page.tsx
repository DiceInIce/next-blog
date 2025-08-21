'use client';

import { useState } from 'react';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import {
  Box,
  Stack,
  Heading,
  Text
} from '@chakra-ui/react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box
      minH="100vh"
      bg="gray.50"
      _dark={{ bg: 'gray.900' }}
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={12}
      px={{ base: 4, sm: 6, lg: 8 }}
    >
      <Box maxW="md" w="full">
        <Stack gap={10}>
          <Box textAlign="center">
            <Stack direction="row" align="center" justify="center" mb={6}>
              <picture>
                <source srcSet="/logo-dark.svg" media="(prefers-color-scheme: dark)" />
                <img src="/logo-light.svg" alt="Черновик" width={48} height={48} style={{ display: 'block', marginInline: 'auto' }} />
              </picture>
              <Heading size="4xl" color="gray.900" _dark={{ color: 'white' }}>
                Черновик
              </Heading>
            </Stack>
            <Text mt={2} fontSize="sm" color="gray.600" _dark={{ color: 'gray.400' }}>
              {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
            </Text>
          </Box>

          {isLogin ? (
            <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </Stack>
      </Box>
    </Box>
  );
}
