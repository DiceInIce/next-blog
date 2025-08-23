'use client'

import { Button, Icon } from '@chakra-ui/react'
import { useRouter } from 'next/navigation'
import { FiChevronLeft } from 'react-icons/fi'

interface BackButtonProps {
  label?: string
}

export default function BackButton({ label = 'Назад' }: BackButtonProps) {
  const router = useRouter()

  const handleBackClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  return (
    <Button
      onClick={handleBackClick}
      variant="ghost"
      colorScheme="blue"
      alignSelf="flex-start"
      px={0}
      height="auto"
      fontWeight="normal"
      display="inline-flex"
      alignItems="center"
      gap={1}
    >
      <Icon as={FiChevronLeft} boxSize="1.1em" />
      {label}
    </Button>
  )
}


