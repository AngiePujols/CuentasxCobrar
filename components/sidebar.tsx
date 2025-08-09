"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FileText, FileType, CreditCard, Users, Calculator, Sparkles } from "lucide-react"

const navigation = [
  {
    name: "Asiento CXC",
    href: "/asiento-cxc",
    icon: FileText,
    color: "from-indigo-500 to-purple-500",
  },
  {
    name: "Tipos de Documentos",
    href: "/tipos-documentos",
    icon: FileType,
    color: "from-purple-500 to-pink-500",
  },
  {
    name: "Transacciones",
    href: "/transacciones",
    icon: CreditCard,
    color: "from-green-500 to-emerald-500",
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    color: "from-orange-500 to-red-500",
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-72 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl border-r border-slate-700/50">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-75"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Cuentas por Cobrar
            </h1>
            <p className="text-slate-400 text-sm">Sistema de gestión</p>
          </div>
        </div>
      </div>

      <nav className="mt-4 px-6">
        <div className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg border border-white/10"
                    : "text-slate-300 hover:text-white hover:bg-white/5",
                )}
              >
                {isActive && (
                  <div className={cn("absolute inset-0 bg-gradient-to-r opacity-10 rounded-xl", item.color)} />
                )}
                <div
                  className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    isActive
                      ? `bg-gradient-to-r ${item.color} shadow-lg`
                      : "bg-slate-700/50 group-hover:bg-slate-600/50",
                  )}
                >
                  <item.icon className="h-5 w-5 text-white" />
                </div>
                <span className="relative z-10">{item.name}</span>
                {isActive && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Sparkles className="h-4 w-4 text-white/60" />
                  </div>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      
    </div>
  )
}
