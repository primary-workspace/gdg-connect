import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { Toaster } from '@/components/ui/toaster'
import { Navbar } from '@/components/Layout/Navbar'
import { Footer } from '@/components/Layout/Footer'
import { DashboardLayout } from '@/components/Layout/DashboardLayout'
import { ParticipantDashboardLayout } from '@/components/Layout/ParticipantDashboardLayout'
import { ThemeProvider } from '@/components/theme-provider'

// Pages
import { Home } from '@/pages/Home'
import { Signup } from '@/pages/Signup'
import { Signin } from '@/pages/Signin'
import { Dashboard } from '@/pages/Dashboard'
import { PlagiarismChecker } from '@/pages/PlagiarismChecker'
import { ParticipantDashboard } from '@/pages/participant/ParticipantDashboard'
import { LearningPathsPage } from '@/pages/participant/LearningPathsPage'
import { LearningPathDetailPage } from '@/pages/participant/LearningPathDetailPage'
import { PracticeQuizPage } from '@/pages/participant/PracticeQuizPage'
import { QuizHistoryPage } from '@/pages/participant/QuizHistoryPage'
import { TaskManagerPage } from '@/pages/participant/TaskManagerPage'
import { AITutorPage } from '@/pages/participant/AITutorPage'
import { SettingsPage } from '@/pages/participant/SettingsPage'
import { UserManagementPage } from '@/pages/UserManagementPage'
import { ResumeMakerPage } from '@/pages/participant/ResumeMakerPage'

// Organizer Pages
import { EventCalendarPage } from '@/pages/organizer/EventCalendarPage'
import { AttendancePage } from '@/pages/organizer/AttendancePage'
import { ReleaseResultsPage } from '@/pages/organizer/ReleaseResultsPage'
import { TestGeneratorPage } from '@/pages/organizer/TestGeneratorPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return <>{children}</>
}

function RoleBasedLayout() {
  const { profile } = useAuth()
  return profile?.role === 'member' ? <ParticipantDashboardLayout /> : <DashboardLayout />
}

function AppContent() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route element={<RoleBasedLayout />}>
                      {/* Participant Routes */}
                      <Route path="/" element={<ParticipantDashboard />} />
                      <Route path="learning-paths" element={<LearningPathsPage />} />
                      <Route path="learning-paths/:id" element={<LearningPathDetailPage />} />
                      <Route path="practice-quiz" element={<PracticeQuizPage />} />
                      <Route path="quiz-history" element={<QuizHistoryPage />} />
                      <Route path="task-manager" element={<TaskManagerPage />} />
                      <Route path="ai-tutor" element={<AITutorPage />} />
                      <Route path="resume-maker" element={<ResumeMakerPage />} />
                      
                      {/* Shared Routes */}
                      <Route path="settings" element={<SettingsPage />} />
                      
                      {/* Organizer Routes */}
                      <Route path="organizer" element={<Dashboard />} />
                      <Route path="event-calendar" element={<EventCalendarPage />} />
                      <Route path="attendance" element={<AttendancePage />} />
                      <Route path="release-results" element={<ReleaseResultsPage />} />
                      <Route path="test-generator" element={<TestGeneratorPage />} />
                      <Route path="plagiarism-checker" element={<PlagiarismChecker />} />
                      <Route path="user-management" element={<UserManagementPage />} />
                    </Route>
                  </Routes>
                </ProtectedRoute>
              }
            />
            
            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster />
    </Router>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
