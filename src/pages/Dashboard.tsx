import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Users, 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Lightbulb,
  FileCheck,
  Brain,
  Search,
  PlusCircle,
  BarChart3
} from 'lucide-react'

export function Dashboard() {
  const { profile } = useAuth()
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedQuizzes: 0,
    learningPaths: 0,
    attendanceRate: 85
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // This would fetch real data from Supabase
      // For now, using mock data
      setStats({
        totalEvents: 12,
        upcomingEvents: 3,
        completedQuizzes: 8,
        learningPaths: 2,
        attendanceRate: 85
      })
      
      setRecentActivity([
        { type: 'event', title: 'React Workshop completed', time: '2 hours ago' },
        { type: 'quiz', title: 'JavaScript Basics quiz submitted', time: '1 day ago' },
        { type: 'path', title: 'Frontend Development path started', time: '3 days ago' }
      ])
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const motivationalQuotes = [
    "Code is poetry written in logic.",
    "The best way to predict the future is to invent it.",
    "Innovation distinguishes between a leader and a follower.",
    "Technology is a tool. In terms of getting the kids working together and motivating them, the teacher is the most important."
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  const featureCards = [
    {
      title: "Attendance Tracker",
      description: "Monitor event participation and engagement",
      icon: <Users className="h-6 w-6" />,
      color: "bg-blue-500",
      action: "View Attendance"
    },
    {
      title: "Release Results",
      description: "Publish and manage event outcomes",
      icon: <FileCheck className="h-6 w-6" />,
      color: "bg-green-500",
      action: "Manage Results"
    },
    {
      title: "Test Generator",
      description: "Create AI-powered assessments",
      icon: <Brain className="h-6 w-6" />,
      color: "bg-purple-500",
      action: "Generate Test"
    },
    {
      title: "Quiz Generator",
      description: "Build interactive quizzes instantly",
      icon: <Lightbulb className="h-6 w-6" />,
      color: "bg-yellow-500",
      action: "Create Quiz"
    },
    {
      title: "Plagiarism Checker",
      description: "Ensure content originality",
      icon: <Search className="h-6 w-6" />,
      color: "bg-red-500",
      action: "Check Content"
    },
    {
      title: "Analytics Dashboard",
      description: "View detailed community insights",
      icon: <BarChart3 className="h-6 w-6" />,
      color: "bg-indigo-500",
      action: "View Analytics"
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-none">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2">
                    Welcome back, {profile?.first_name}! 🚀
                  </h1>
                  <p className="text-muted-foreground text-lg italic">
                    "{randomQuote}"
                  </p>
                </div>
                <div className="hidden md:block">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
                    <Users className="h-12 w-12 text-primary" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Next: React Workshop
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Learning Paths</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.learningPaths}</div>
              <p className="text-xs text-muted-foreground">
                1 in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
              <Progress value={stats.attendanceRate} className="mt-2" />
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Quick Tools</h2>
            <Button variant="outline">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-lg ${feature.color} text-white group-hover:scale-110 transition-transform`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        {feature.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        {feature.action}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest actions and updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-muted/50">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
