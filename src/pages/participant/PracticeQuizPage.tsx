import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateQuiz } from '@/lib/gemini';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

type Question = {
  question: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correct_answer: string;
  explanation: string;
};

export function PracticeQuizPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [quiz, setQuiz] = useState<Question[] | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const handleGenerateQuiz = async () => {
    if (!topic) {
      toast({ title: "Topic is required", variant: "destructive" });
      return;
    }
    setGenerating(true);
    setQuiz(null);
    setShowResults(false);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);

    try {
      const questions = await generateQuiz(topic, difficulty, numQuestions);
      if (questions.length === 0) throw new Error("AI failed to generate questions.");
      setQuiz(questions);
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate quiz. Please try again.", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);

    setTimeout(() => {
      if (currentQuestionIndex < (quiz?.length ?? 0) - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleQuizSubmission();
      }
    }, 500);
  };

  const handleQuizSubmission = async () => {
    if (!quiz || !user) return;
    
    let score = 0;
    quiz.forEach((q, index) => {
      if (userAnswers[index] === q.correct_answer) {
        score++;
      }
    });

    const submission = {
      user_id: user.id,
      answers: userAnswers,
      score: score,
      total_possible: quiz.length,
      percentage: (score / quiz.length) * 100,
      quiz_title: `Practice Quiz: ${topic}`,
      quiz_topic: topic,
    };

    const { error } = await supabase.from('quiz_submissions').insert(submission);

    if (error) {
      toast({ title: "Error", description: "Failed to save quiz results.", variant: "destructive" });
    } else {
      toast({ title: "Quiz Completed!", description: "Your results have been saved." });
    }
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!quiz) return 0;
    let score = 0;
    quiz.forEach((q, index) => {
      if (userAnswers[index] === q.correct_answer) {
        score++;
      }
    });
    return score;
  };

  const resetQuiz = () => {
    setQuiz(null);
    setShowResults(false);
    setUserAnswers([]);
    setCurrentQuestionIndex(0);
    setTopic('');
  };

  if (showResults && quiz) {
    const score = calculateScore();
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Quiz Results</CardTitle>
          <CardDescription>You scored {score} out of {quiz.length}!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {quiz.map((q, index) => (
            <div key={index} className={`p-4 rounded-lg ${userAnswers[index] === q.correct_answer ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <p className="font-semibold">{index + 1}. {q.question}</p>
              <p className="text-sm">Your answer: {userAnswers[index]}</p>
              <p className="text-sm">Correct answer: {q.correct_answer}</p>
              <p className="text-xs mt-2 text-muted-foreground">{q.explanation}</p>
            </div>
          ))}
          <div className="flex gap-2">
            <Button onClick={resetQuiz} className="w-full">Try Another Quiz</Button>
            <Button onClick={() => navigate('/dashboard/quiz-history')} variant="outline" className="w-full">View History</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quiz) {
    const currentQuestion = quiz[currentQuestionIndex];
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}/{quiz.length}</CardTitle>
          <CardDescription>{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {currentQuestion.options.map((option, index) => (
            <Button
              key={index}
              variant="outline"
              className="w-full justify-start h-auto py-3 text-left whitespace-normal"
              onClick={() => handleAnswer(option)}
            >
              {option}
            </Button>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>AI Practice Quiz Generator</CardTitle>
        <CardDescription>Create a quiz on any topic to test your knowledge.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <Input id="topic" value={topic} onChange={e => setTopic(e.target.value)} placeholder="e.g., React Hooks, Python Data Structures" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="hard">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="numQuestions">Number of Questions</Label>
            <Input id="numQuestions" type="number" value={numQuestions} onChange={e => setNumQuestions(Number(e.target.value))} min={1} max={20} />
          </div>
        </div>
        <Button onClick={handleGenerateQuiz} disabled={generating} className="w-full">
          {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</> : <><Brain className="mr-2 h-4 w-4" /> Generate Quiz</>}
        </Button>
      </CardContent>
    </Card>
  );
}
