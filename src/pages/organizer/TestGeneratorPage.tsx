import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/lib/gemini';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

type Question = {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correct_answer: string;
  explanation: string;
};

export function TestGeneratorPage() {
  const { user } = useAuth();
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(10);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<Question[] | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic || !title) {
      toast({ title: "Title and Topic are required", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setGeneratedQuiz(null);

    try {
      const questions = await generateQuiz(topic, difficulty, numQuestions);
      if (questions.length === 0) throw new Error("AI failed to generate questions.");
      setGeneratedQuiz(questions);
      toast({ title: "Success", description: "Quiz has been generated. Review and save below." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate quiz. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };
  
  const handleSaveQuiz = async () => {
    if (!generatedQuiz || !user) return;
    setSaving(true);
    
    const { error } = await supabase.from('quizzes').insert({
      title,
      topic,
      difficulty,
      questions: generatedQuiz,
      created_by: user.id,
      ai_generated: true,
      total_marks: generatedQuiz.length,
      is_published: false, // Save as draft by default
    });

    if (error) {
      toast({ title: "Error", description: "Failed to save the quiz.", variant: "destructive" });
    } else {
      toast({ title: "Success!", description: `${title} has been saved as a draft.` });
      // Reset form
      setGeneratedQuiz(null);
      setTitle('');
      setTopic('');
    }
    setSaving(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AI Test & Quiz Generator</CardTitle>
          <CardDescription>Create assessments for your community members in seconds.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Quiz Title</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., JavaScript Fundamentals" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., React Hooks, Python Data Structures" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="numQuestions">Number of Questions</Label>
              <Input id="numQuestions" type="number" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} min={1} max={50} />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Brain className="mr-2 h-4 w-4" /> Generate Questions</>}
          </Button>
        </CardContent>
      </Card>

      {generatedQuiz && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Quiz Preview</CardTitle>
            <CardDescription>Review the questions below. You can save this quiz as a draft.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedQuiz.map((q, index) => (
              <div key={index} className="p-4 rounded-lg border">
                <p className="font-semibold">{index + 1}. {q.question}</p>
                <ul className="list-disc list-inside pl-4 mt-2 text-sm">
                  {q.options.map((opt, i) => (
                    <li key={i} className={opt === q.correct_answer ? 'font-bold text-green-600' : ''}>{opt}</li>
                  ))}
                </ul>
              </div>
            ))}
            <Button onClick={handleSaveQuiz} disabled={saving} className="w-full">
              {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Draft...</> : <><FileText className="mr-2 h-4 w-4" /> Save as Draft</>}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
