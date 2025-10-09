import * as React from "react"
import { cn } from "@/lib/utils"

interface AvatarProps {
  name?: string | null
  className?: string
}

export function Avatar({ name, className }: AvatarProps) {
  // Provide fallback for undefined/null names
  const safeName = name || 'Unknown User'
  
  const getInitials = (fullName: string) => {
    if (!fullName || fullName.trim() === '') {
      return 'UN' // Unknown initials
    }
    
    const names = fullName.trim().split(' ')
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase()
    }
    return fullName.slice(0, 2).toUpperCase()
  }

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500', 
      'bg-purple-500',
      'bg-orange-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-red-500'
    ]
    
    // Handle empty or null names
    if (!name || name.trim() === '') {
      return colors[0] // Default to first color
    }
    
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className={cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-medium",
      getAvatarColor(safeName),
      className
    )}>
      {getInitials(safeName)}
    </div>
  )
}
