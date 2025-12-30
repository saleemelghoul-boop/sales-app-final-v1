"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { db, type Notification } from "@/lib/database"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, CheckCircle2, Package, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotificationsView() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNotifications()
    const interval = setInterval(loadNotifications, 3000)
    return () => clearInterval(interval)
  }, [user?.id])

  const loadNotifications = () => {
    try {
      const allNotifications = db.getNotifications()
      const myNotifications = allNotifications
        .filter((n) => n.user_id === user?.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setNotifications(myNotifications)
    } catch (error) {
      console.error("[v0] ❌ Error loading notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = (notificationId: string) => {
    try {
      db.markNotificationAsRead(notificationId)
      loadNotifications()
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.is_read)
      unreadNotifications.forEach((n) => db.markNotificationAsRead(n.id))
      loadNotifications()
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
  }

  const deleteNotification = (notificationId: string) => {
    if (confirm("هل تريد حذف هذا الإشعار؟")) {
      try {
        const allNotifications = db.getNotifications()
        const filtered = allNotifications.filter((n) => n.id !== notificationId)
        db.saveNotifications(filtered)
        loadNotifications()
      } catch (error) {
        console.error("Error deleting notification:", error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  const unreadNotifications = notifications.filter((n) => !n.is_read)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">الإشعارات</h2>
          <p className="text-sm text-muted-foreground">
            {unreadNotifications.length > 0 ? `${unreadNotifications.length} إشعار جديد` : "لا توجد إشعارات جديدة"}
          </p>
        </div>
        {unreadNotifications.length > 0 && (
          <Button size="sm" variant="outline" onClick={markAllAsRead}>
            تحديد الكل كمقروء
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-center text-muted-foreground">لا توجد إشعارات</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.is_read ? "opacity-60" : "border-primary/50"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full shadow-[0_0_0_2px_oklch(0.7_0.15_60)] ${
                      notification.type === "order_printed" ? "bg-green-100" : "bg-blue-100"
                    }`}
                  >
                    {notification.type === "order_printed" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Package className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {notification.type === "order_printed" ? "تم طباعة الطلبية" : "طلبية جديدة"}
                          </h3>
                          {!notification.is_read && (
                            <Badge variant="default" className="bg-primary/20 text-primary text-xs">
                              جديد
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {new Date(notification.created_at).toLocaleString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-2">
                      {!notification.is_read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                          className="shadow-[0_0_0_1px_oklch(0.7_0.15_60)]"
                        >
                          تحديد كمقروء
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-500 hover:text-red-600 shadow-[0_0_0_1px_oklch(0.7_0.15_60)]"
                      >
                        <Trash2 className="ml-1 h-4 w-4" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
