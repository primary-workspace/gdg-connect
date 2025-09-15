import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { 
  Lightbulb, 
  BarChart3, 
  BookOpen, 
  Users, 
  ArrowRight, 
  Star, 
  CheckCircle,
  Zap,
  Target,
  Brain,
  Calendar
} from 'lucide-react'

export function Home() {
  const { user } = useAuth()

  const features = [
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-500" />,
      title: "AI Event Ideas",
      description: "Generate creative, engaging event ideas powered by Gemini AI",
      benefits: ["Context-aware suggestions", "Multiple event formats", "Resource planning"]
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-blue-500" />,
      title: "Engagement Analytics",
      description: "Track participation, measure success, and optimize your community",
      benefits: ["Real-time metrics", "Attendance tracking", "Performance insights"]
    },
    {
      icon: <BookOpen className="h-8 w-8 text-green-500" />,
      title: "Learning Paths",
      description: "Personalized learning journeys tailored to your community's needs",
      benefits: ["Adaptive curriculum", "Progress tracking", "Skill assessments"]
    },
    {
      icon: <Users className="h-8 w-8 text-purple-500" />,
      title: "Community Forum",
      description: "Connect, collaborate, and share knowledge with fellow tech enthusiasts",
      benefits: ["Peer networking", "Knowledge sharing", "Collaborative projects"]
    }
  ]

  const galleryImages = [
    { src: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop", alt: "Tech Workshop" },
    { src: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop", alt: "Coding Session" },
    { src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop", alt: "Tech Conference" },
    { src: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop", alt: "Team Collaboration" },
    { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop", alt: "Hackathon" },
    { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", alt: "Developer Meetup" },
    { src: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop", alt: "Tech Seminar" },
    { src: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop", alt: "Innovation Hub" }
  ]

  const testimonials = [
    {
      name: "Priya Sharma",
      role: "GDG Lead, Delhi University",
      content: "GDG Connect Hub transformed how we organize events. The AI suggestions saved us hours of planning!",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Rahul Verma",
      role: "Tech Lead, IIT Bombay",
      content: "The engagement analytics helped us understand our community better and improve participation by 60%.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face",
      rating: 5
    },
    {
      name: "Anitha Krishnan",
      role: "Community Manager, BITS Pilani",
      content: "Personalized learning paths made our members more skilled and engaged. Highly recommend!",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <Badge variant="outline" className="mb-6 text-sm">
            ✨ Powered by AI • Built for Communities
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Empower Your Campus Tech Community
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            AI-driven event ideas • Engagement analytics • Personalized learning paths
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to={user ? "/dashboard" : "/signup"}>
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link to="/features">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Build Thriving Communities
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From AI-powered event planning to detailed analytics, we provide all the tools 
              to make your tech community successful.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="p-3 rounded-lg bg-background border group-hover:bg-primary/10 transition-colors">
                      {feature.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription className="text-base">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {feature.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Communities in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how tech communities across India are using GDG Connect Hub 
              to create amazing experiences.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {galleryImages.map((image, index) => (
              <div 
                key={index} 
                className="aspect-square rounded-lg overflow-hidden group cursor-pointer"
              >
                <img 
                  src={image.src} 
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Loved by Community Leaders
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of community organizers who trust GDG Connect Hub 
              to power their tech communities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center justify-center space-x-3">
                    <img 
                      src={testimonial.avatar} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="text-left">
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Community?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of community organizers who are already using GDG Connect Hub 
            to create incredible tech experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to={user ? "/dashboard" : "/signup"}>
                Start Free Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8" asChild>
              <Link to="/contact">
                Talk to Our Team
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
