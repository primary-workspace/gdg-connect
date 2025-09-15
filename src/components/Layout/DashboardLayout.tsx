import React from 'react'
import { Outlet, NavLink, Navigate } from 'react-router-dom'
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import {
  LayoutDashboard,
  CalendarCheck,
  Award,
  FileText,
  Search,
  Settings,
  Code2,
  Users,
  Calendar,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '../ThemeToggle'

const sidebarNavItems = [
  { to: '/dashboard/organizer', icon: <LayoutDashboard />, label: 'Dashboard', end: true },
  { to: '/dashboard/event-calendar', icon: <Calendar />, label: 'Event Calendar' },
  { to: '/dashboard/attendance', icon: <CalendarCheck />, label: 'Attendance' },
  { to: '/dashboard/release-results', icon: <Award />, label: 'Release Results' },
  { to: '/dashboard/test-generator', icon: <FileText />, label: 'Test Generator' },
  { to: '/dashboard/plagiarism-checker', icon: <Search />, label: 'Plagiarism Checker' },
  { to: '/dashboard/user-management', icon: <Users />, label: 'User Management' },
  { to: '/dashboard/settings', icon: <Settings />, label: 'Settings' },
]

function DashboardHeader() {
  const { profile } = useAuth()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hidden md:flex" />
        <h1 className="text-lg font-semibold md:text-xl hidden sm:block">
          Organizer Dashboard
        </h1>
      </div>
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex-1 flex justify-end">
        <ThemeToggle />
      </div>
    </header>
  )
}

export function DashboardLayout() {
  const { profile } = useAuth()

  // Redirect if a 'member' tries to access organizer layout
  if (profile?.role === 'member') {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Code2 className="size-6 text-primary" />
            <span className="text-lg font-semibold">GDG Connect Hub</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {sidebarNavItems.map((item) => (
              <SidebarMenuItem key={item.to}>
                <NavLink to={item.to} end={item.end ?? false}>
                  {({ isActive }) => (
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  )}
                </NavLink>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <DashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
