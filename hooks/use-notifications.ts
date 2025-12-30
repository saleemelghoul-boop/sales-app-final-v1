"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/database"

export function useNotifications(userId: string) {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!userId) return

    const loadUnreadCount = () => {
      try {
        const notifications = db.getNotifications()
        const userNotifications = notifications.filter((n) => n.user_id === userId && !n.is_read)
        setUnreadCount(userNotifications.length)
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }

    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 5000)

    return () => clearInterval(interval)
  }, [userId])

  return { unreadCount }
}
