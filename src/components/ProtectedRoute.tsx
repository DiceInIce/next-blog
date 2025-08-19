'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Box, Text, Spinner } from '@chakra-ui/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Немедленное перенаправление на страницу авторизации
      router.replace('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.50"
        _dark={{ bg: 'gray.900' }}
      >
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Проверка авторизации...
          </Text>
        </Box>
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box 
        minH="100vh" 
        display="flex" 
        alignItems="center" 
        justifyContent="center"
        bg="gray.50"
        _dark={{ bg: 'gray.900' }}
      >
        <Box textAlign="center">
          <Spinner size="xl" color="blue.500" mb={4} />
          <Text color="gray.600" _dark={{ color: 'gray.400' }}>
            Перенаправление на страницу авторизации...
          </Text>
        </Box>
      </Box>
    );
  }

  return <>{children}</>;
}
