"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface LogoutButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
  showIcon?: boolean
  redirectTo?: string
}

export function LogoutButton({
  variant = 'ghost',
  size = 'default',
  className,
  children,
  showIcon = true,
  redirectTo = '/logout'
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      // Navigate to logout page which handles the actual logout process
      router.push(redirectTo)
    } catch (error) {
      console.error('Error navigating to logout:', error)
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={cn("flex items-center", className)}
    >
      {showIcon && (
        <LogOut className={cn(
          "h-4 w-4",
          children ? "mr-2" : ""
        )} />
      )}
      {children || (isLoading ? 'Signing out...' : 'Sign Out')}
    </Button>
  )
}

// Convenience components for common use cases
export function LogoutMenuItem({ className, ...props }: Omit<LogoutButtonProps, 'variant' | 'size'>) {
  return (
    <LogoutButton
      variant="ghost"
      size="sm"
      className={cn("w-full justify-start", className)}
      {...props}
    />
  )
}

export function LogoutIconButton({ className, ...props }: Omit<LogoutButtonProps, 'children' | 'showIcon'>) {
  return (
    <LogoutButton
      size="icon"
      showIcon={true}
      className={className}
      {...props}
    />
  )
}