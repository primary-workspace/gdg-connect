import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, LearningPath, QuizSubmission, Profile } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, FileText, Wand2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateResume } from '@/lib/gemini';

export function ResumeMakerPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [generatedResume, setGeneratedResume] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateResume = async () => {
    if (!user || !profile) {
      toast({ title: 'Error', description: 'You must be logged in to generate a resume.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedResume('');

    try {
      // 1. Fetch all necessary data
      const { data: paths, error: pathsError } = await supabase
        .from('learning_paths')
        .select('title, topics, progress')
        .eq('user_id', user.id);

      const { data: quizzes, error: quizzesError } = await supabase
        .from('quiz_submissions')
        .select('quiz_topic, percentage')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (pathsError || quizzesError) {
        throw new Error('Failed to fetch user data for resume.');
      }

      // 2. Call Gemini API with the data
      const resumeMarkdown = await generateResume(profile, paths || [], quizzes || [], additionalInfo);
      setGeneratedResume(resumeMarkdown);
      toast({ title: 'Success!', description: 'Your AI-powered resume has been generated.' });

    } catch (error: any) {
      toast({ title: 'Generation Failed', description: error.message || 'An error occurred while generating the resume.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>AI Resume Maker</CardTitle>
          <CardDescription>
            Generate a professional resume based on your profile, learning progress, and quiz performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Our AI will automatically use your name, email, completed learning paths, and best quiz scores. Add any extra details below you'd like to include (e.g., personal projects, volunteer experience, career goals).
          </p>
          <Textarea
            placeholder="Tell us more about yourself... (optional)"
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            rows={8}
          />
          <Button onClick={handleGenerateResume} disabled={isLoading} className="w-full">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Wand2 className="mr-2 h-4 w-4" /> Generate with AI</>
            )}
          </Button>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Generated Resume</CardTitle>
          <CardDescription>Review your generated resume below. You can copy the text and paste it into your favorite editor.</CardDescription>
        </CardHeader>
        <CardContent className="prose dark:prose-invert max-w-none h-[60vh] overflow-y-auto border rounded-md p-4 bg-muted/50">
          {isLoading && !generatedResume && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">Building your resume...</p>
            </div>
          )}
          {!isLoading && !generatedResume && (
            <div className="flex flex-col items-center justify-center h-full">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-muted-foreground">Your resume will appear here.</p>
            </div>
          )}
          {generatedResume && <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedResume}</ReactMarkdown>}
        </CardContent>
      </Card>
    </div>
  );
}
