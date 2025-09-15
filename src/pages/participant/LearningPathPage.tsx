import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Loader2, Lightbulb, BookOpen, Youtube, FileText, CheckCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, LearningPath } from '@/lib/supabase'
import { generateLearningPath as generatePathFromAI } from '@/lib/gemini'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'

const interestOptions = [
  "Frontend Development", "Backend Development", "AI/Machine Learning", 
  "Data Science", "Mobile App Development", "Cybersecurity", "Cloud Computing"
];

export function LearningPathPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    const fetchLearningPath = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setLearningPath(data);
      }
      if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
        toast({ title: "Error", description: "Failed to fetch learning path.", variant: "destructive" });
      }
      setLoading(false);
    };

    fetchLearningPath();
  }, [user, toast]);

  const handleInterestChange = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const generateLearningPath = async () => {
    if (selectedInterests.length === 0 || !user) return;
    setGenerating(true);
    try {
      const pathData = await generatePathFromAI(selectedInterests.join(', '), 'beginner', 20);
      
      const newPath = {
        user_id: user.id,
        title: pathData.title || `Learning Path for ${selectedInterests.join(', ')}`,
        description: pathData.description,
        topics: selectedInterests,
        difficulty_level: 'beginner' as const,
        estimated_duration: 20,
        progress: 0,
        ai_generated: true,
        resources: pathData.recommended_resources,
        milestones: pathData.modules.map((m: any) => ({ ...m, completed: false })),
      };

      const { data, error } = await supabase
        .from('learning_paths')
        .insert(newPath)
        .select()
        .single();

      if (error) throw error;
      
      setLearningPath(data);
      toast({ title: "Success", description: "Your personalized learning path has been generated!" });

    } catch (error) {
      toast({ title: "Error", description: "Failed to generate learning path. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const toggleModuleCompletion = async (moduleIndex: number) => {
    if (!learningPath || !learningPath.milestones) return;
    
    const updatedMilestones = [...learningPath.milestones];
    updatedMilestones[moduleIndex].completed = !updatedMilestones[moduleIndex].completed;

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    const { data, error } = await supabase
      .from('learning_paths')
      .update({ milestones: updatedMilestones, progress: newProgress })
      .eq('id', learningPath.id)
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: "Failed to update progress.", variant: "destructive" });
    } else {
      setLearningPath(data);
    }
  };

  const getResourceIcon = (type: string) => {
    if (type.toLowerCase().includes('video')) return <Youtube className="h-4 w-4 text-red-500" />;
    if (type.toLowerCase().includes('article') || type.toLowerCase().includes('blog')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.toLowerCase().includes('docs')) return <BookOpen className="h-4 w-4 text-green-500" />;
    return <FileText className="h-4 w-4" />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!learningPath) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Create Your Learning Path</CardTitle>
          <CardDescription>Select your interests to generate a personalized learning roadmap.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-semibold">What are you interested in?</h3>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(interest => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox 
                    id={interest} 
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => handleInterestChange(interest)}
                  />
                  <Label htmlFor={interest}>{interest}</Label>
                </div>
              ))}
            </div>
            <Button onClick={generateLearningPath} disabled={generating || selectedInterests.length === 0} className="w-full">
              {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Lightbulb className="mr-2 h-4 w-4" /> Generate Path</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{learningPath.title}</CardTitle>
          <CardDescription>{learningPath.description}</CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {learningPath.topics.map(topic => <Badge key={topic}>{topic}</Badge>)}
          </div>
        </CardHeader>
      </Card>

      {learningPath.milestones?.map((module: any, index: number) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Checkbox 
                  id={`module-${index}`} 
                  checked={module.completed}
                  onCheckedChange={() => toggleModuleCompletion(index)}
                />
                <Label htmlFor={`module-${index}`} className={`text-lg font-semibold ${module.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {module.name}
                </Label>
              </div>
              {module.completed && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>
            <CardDescription>{module.duration} hours</CardDescription>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2">Topics:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
              {module.topics.map((topic: string, i: number) => <li key={i}>{topic}</li>)}
            </ul>
            <h4 className="font-semibold mb-2">Resources:</h4>
            <div className="space-y-2">
              {module.resources.map((res: any, i: number) => (
                <a href={res.url} target="_blank" rel="noopener noreferrer" key={i} className="flex items-center gap-2 text-sm text-primary hover:underline">
                  {getResourceIcon(res.type)}
                  <span>{res.title} ({res.type})</span>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
