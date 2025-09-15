import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { BookOpen, Brain, Mic, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ParticipantDashboard() {
  const { profile } = useAuth()

  const motivationalQuotes = [
    "The journey of a thousand miles begins with a single step.",
    "The only way to do great work is to love what you do.",
    "Continuous learning is the minimum requirement for success in any field.",
    "Your limitation—it's only your imagination."
  ]

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]

  const featureCards = [
    {
      title: "My Learning Path",
      description: "Your personalized roadmap to mastering new skills.",
      icon: <BookOpen className="h-8 w-8 text-blue-500" />,
      link: "/dashboard/learning-path",
      cta: "View Path"
    },
    {
      title: "Practice Quizzes",
      description: "Test your knowledge with AI-generated quizzes on any topic.",
      icon: <Brain className="h-8 w-8 text-purple-500" />,
      link: "/dashboard/practice-quiz",
      cta: "Start Quiz"
    },
    {
      title: "AI Tutor",
      description: "Get instant help with your doubts, 24/7.",
      icon: <Mic className="h-8 w-8 text-green-500" />,
      link: "/dashboard/ai-tutor",
      cta: "Ask a Question"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Banner */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-primary/10 via-green-500/10 to-blue-500/10 border-none">
          <CardContent className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Hello, {profile?.first_name}! Let's get learning.
            </h1>
            <p className="text-muted-foreground text-lg italic">
              "{randomQuote}"
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Feature Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Your Learning Toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((feature, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-muted">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
              <CardContent>
                <Button asChild className="w-full">
                  <Link to={feature.link}>
                    {feature.cta} <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
