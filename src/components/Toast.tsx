'use client'

import { useState, useEffect } from 'react'
import { Box, Text, CloseButton } from '@chakra-ui/react'
import { useColorMode } from '@/components/ui/color-mode'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  const { colorMode } = useColorMode()

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const bgColor = type === 'success' 
    ? (colorMode === 'dark' ? 'green.900' : 'green.100')
    : (colorMode === 'dark' ? 'red.900' : 'red.100')
  
  const textColor = type === 'success'
    ? (colorMode === 'dark' ? 'green.200' : 'green.700')
    : (colorMode === 'dark' ? 'red.200' : 'red.700')
  
  const borderColor = type === 'success'
    ? (colorMode === 'dark' ? 'green.700' : 'green.300')
    : (colorMode === 'dark' ? 'red.700' : 'red.300')

  return (
    <Box
      position="fixed"
      top={4}
      right={4}
      zIndex={2000}
      bg={bgColor}
      color={textColor}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="md"
      p={4}
      maxW="400px"
      boxShadow="lg"
      transform={isVisible ? 'translateX(0)' : 'translateX(100%)'}
      opacity={isVisible ? 1 : 0}
      transition="all 0.3s ease-in-out"
    >
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Text fontWeight="medium">{message}</Text>
        <CloseButton
          size="sm"
          onClick={onClose}
          color={textColor}
          _hover={{ bg: 'rgba(0, 0, 0, 0.1)' }}
        />
      </Box>
    </Box>
  )
}
