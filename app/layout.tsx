import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Sistema de Cuentas por Cobrar",
  description: "Gestión moderna de cuentas por cobrar",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-gradient-to-br from-white/80 to-slate-50/50 backdrop-blur-sm">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
