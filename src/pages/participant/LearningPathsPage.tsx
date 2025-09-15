import React, { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, PlusCircle, Trash2, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase, LearningPath } from '@/lib/supabase'
import { generateLearningPath as generatePathFromAI } from '@/lib/gemini'
import { useToast } from '@/hooks/use-toast'
import { Link } from 'react-router-dom'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from '@/components/ui/textarea'

export function LearningPathsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchLearningPaths = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('learning_paths')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (data) {
      setLearningPaths(data);
    }
    if (error) {
      toast({ title: "Error", description: "Failed to fetch learning paths.", variant: "destructive" });
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchLearningPaths();
  }, [fetchLearningPaths]);

  const handleGeneratePath = async () => {
    if (!topic.trim() || !user) return;
    setGenerating(true);
    try {
      const pathData = await generatePathFromAI(topic, 'beginner', 20);
      
      if (!pathData || !pathData.modules) {
        throw new Error("AI failed to generate a valid path structure.");
      }

      const newPath = {
        user_id: user.id,
        title: pathData.title || `Learning Path for ${topic}`,
        description: pathData.description,
        topics: [topic],
        difficulty_level: 'beginner' as const,
        estimated_duration: 20,
        progress: 0,
        ai_generated: true,
        milestones: pathData.modules.map((m: any) => ({ ...m, completed: false })),
      };

      const { error } = await supabase.from('learning_paths').insert(newPath);

      if (error) throw error;
      
      toast({ title: "Success", description: "Your new learning path has been generated!" });
      fetchLearningPaths();
      setIsDialogOpen(false);
      setTopic('');

    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to generate learning path. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleDeletePath = async (pathId: string) => {
    const { error } = await supabase.from('learning_paths').delete().eq('id', pathId);
    if (error) {
      toast({ title: "Error", description: "Failed to delete learning path.", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Learning path deleted." });
      fetchLearningPaths();
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Learning Paths</h1>
          <p className="text-muted-foreground">Your personal collection of learning roadmaps.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Path
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Generate a New Learning Path</DialogTitle>
              <DialogDescription>
                What do you want to learn? Enter a topic, and our AI will create a customized roadmap for you.
              </DialogDescription>
            </DialogHeader>
            <Textarea 
              placeholder="e.g., 'React for beginners', 'Introduction to Machine Learning', 'Advanced CSS techniques'"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
            <DialogFooter>
              <Button onClick={handleGeneratePath} disabled={generating || !topic.trim()}>
                {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : "Generate Path"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {learningPaths.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Learning Paths Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">Click "New Path" to generate your first learning roadmap.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningPaths.map(path => (
            <Card key={path.id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="truncate">{path.title}</CardTitle>
                <CardDescription className="line-clamp-2 h-10">{path.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Progress</span>
                    <span>{path.progress}%</span>
                  </div>
                  <Progress value={path.progress} />
                </div>
              </CardContent>
              <CardContent className="flex gap-2">
                <Button asChild className="w-full">
                  <Link to={`/dashboard/learning-paths/${path.id}`}>View Path</Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete your learning path. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeletePath(path.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
