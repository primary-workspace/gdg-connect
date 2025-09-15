import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
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
  BookOpen,
  Brain,
  Mic,
  Settings,
  Code2,
  Calendar,
  History,
  FileText,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ThemeToggle } from '@/components/ThemeToggle'

const sidebarNavItems = [
  { to: '/dashboard', icon: <LayoutDashboard />, label: 'Dashboard', end: true },
  { to: '/dashboard/learning-paths', icon: <BookOpen />, label: 'Learning Paths' },
  { to: '/dashboard/practice-quiz', icon: <Brain />, label: 'Practice Quiz' },
  { to: '/dashboard/quiz-history', icon: <History />, label: 'Quiz History' },
  { to: '/dashboard/task-manager', icon: <Calendar />, label: 'Task Manager' },
  { to: '/dashboard/ai-tutor', icon: <Mic />, label: 'AI Tutor' },
  { to: '/dashboard/resume-maker', icon: <FileText />, label: 'Resume Maker' },
  { to: '/dashboard/settings', icon: <Settings />, label: 'Settings' },
]

function ParticipantDashboardHeader() {
  const { profile } = useAuth()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="hidden md:flex" />
        <h1 className="text-lg font-semibold md:text-xl hidden sm:block">
          Welcome, {profile?.first_name}!
        </h1>
      </div>
      <SidebarTrigger className="flex md:hidden" />
      <div className="flex-1 flex justify-end">
        <ThemeToggle />
      </div>
    </header>
  )
}

export function ParticipantDashboardLayout() {
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
          <ParticipantDashboardHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
