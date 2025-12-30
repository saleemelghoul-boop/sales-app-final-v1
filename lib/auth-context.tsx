"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { db, type User } from "./database"

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: async () => false,
  logout: () => {},
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("[v0] 🚀 تهيئة التطبيق...")

        try {
          await db.initializeDefaultData()
          console.log("[v0] ✅ تم تهيئة البيانات الافتراضية")
        } catch (initError) {
          console.error("[v0] ⚠️ خطأ في تهيئة البيانات (سيتم المتابعة):", initError)
        }

        const storedUser = localStorage.getItem("sales_current_user")
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser)
            console.log("[v0] 👤 تم استرجاع المستخدم المحفوظ:", parsedUser.username)
            setUser(parsedUser)
          } catch (parseError) {
            console.log("[v0] ⚠️ فشل استرجاع المستخدم المحفوظ")
            localStorage.removeItem("sales_current_user")
          }
        }
      } catch (error) {
        console.error("[v0] ❌ خطأ في تهيئة التطبيق:", error)
      } finally {
        setLoading(false)
        console.log("[v0] ✅ انتهت تهيئة التطبيق")
      }
    }

    initializeApp()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("[v0] 🔐 محاولة تسجيل الدخول:", username)
      const foundUser = await db.login(username, password)

      if (!foundUser) {
        console.log("[v0] ❌ فشل تسجيل الدخول: بيانات غير صحيحة")
        return false
      }

      if (foundUser.role === "admin" && !foundUser.admin_permission) {
        foundUser.admin_permission = "full"
        try {
          await db.updateUser(foundUser.id, { admin_permission: "full" })
          console.log("[v0] ✅ تم إضافة صلاحيات كاملة للمدير القديم")
        } catch (updateError) {
          console.log("[v0] ⚠️ فشل تحديث الصلاحيات (سيتم المتابعة)")
        }
      }

      console.log(
        "[v0] ✅ نجح تسجيل الدخول:",
        foundUser.username,
        "الدور:",
        foundUser.role,
        "الصلاحيات:",
        foundUser.admin_permission || "full",
      )
      setUser(foundUser)
      localStorage.setItem("sales_current_user", JSON.stringify(foundUser))
      return true
    } catch (error) {
      console.error("[v0] ❌ خطأ في تسجيل الدخول:", error)
      return false
    }
  }

  const logout = () => {
    console.log("[v0] 👋 تسجيل الخروج")
    setUser(null)
    localStorage.removeItem("sales_current_user")
  }

  return <AuthContext.Provider value={{ user, login, logout, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
