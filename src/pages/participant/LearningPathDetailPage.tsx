import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, BookOpen, Youtube, FileText, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, LearningPath } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function LearningPathDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLearningPath = useCallback(async () => {
    if (!user || !id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();
    
    if (data) {
      setLearningPath(data);
    } else {
      toast({ title: "Error", description: "Learning path not found or you don't have access.", variant: "destructive" });
    }
    if (error && error.code !== 'PGRST116') {
      toast({ title: "Error", description: "Failed to fetch learning path.", variant: "destructive" });
    }
    setLoading(false);
  }, [user, id, toast]);

  useEffect(() => {
    fetchLearningPath();
  }, [fetchLearningPath]);

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
      // Revert UI change on error
      updatedMilestones[moduleIndex].completed = !updatedMilestones[moduleIndex].completed;
    } else {
      setLearningPath(data);
    }
  };

  const getResourceIcon = (type: string) => {
    if (type.toLowerCase().includes('video')) return <Youtube className="h-4 w-4 text-red-500" />;
    if (type.toLowerCase().includes('article') || type.toLowerCase().includes('blog')) return <FileText className="h-4 w-4 text-blue-500" />;
    if (type.toLowerCase().includes('docs') || type.toLowerCase().includes('documentation')) return <BookOpen className="h-4 w-4 text-green-500" />;
    return <FileText className="h-4 w-4" />;
  }

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (!learningPath) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Learning Path Not Found</h2>
        <p className="text-muted-foreground">The requested learning path could not be loaded.</p>
        <Button asChild className="mt-4">
          <Link to="/dashboard/learning-paths">Go Back</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link to="/dashboard/learning-paths">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to All Paths
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{learningPath.title}</CardTitle>
          <CardDescription>{learningPath.description}</CardDescription>
          <div className="flex flex-wrap gap-2 pt-2">
            {learningPath.topics.map(topic => <Badge key={topic}>{topic}</Badge>)}
          </div>
          <div className="pt-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-1">
              <span>Overall Progress</span>
              <span>{learningPath.progress}%</span>
            </div>
            <Progress value={learningPath.progress} />
          </div>
        </CardHeader>
      </Card>

      {learningPath.milestones?.map((module, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Checkbox 
                  id={`module-${index}`} 
                  checked={module.completed}
                  onCheckedChange={() => toggleModuleCompletion(index)}
                  className="mt-1"
                />
                <div>
                  <Label htmlFor={`module-${index}`} className={`text-lg font-semibold ${module.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {module.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{module.duration} hours</p>
                </div>
              </div>
              {module.completed && <CheckCircle className="h-6 w-6 text-green-500" />}
            </div>
          </CardHeader>
          <CardContent>
            <h4 className="font-semibold mb-2">Topics:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
              {module.topics.map((topic: string, i: number) => <li key={i}>{topic}</li>)}
            </ul>
            <h4 className="font-semibold mb-2">Resources:</h4>
            <div className="space-y-2">
              {module.resources.map((res, i) => (
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
