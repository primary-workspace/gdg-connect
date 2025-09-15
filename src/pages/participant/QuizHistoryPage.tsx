import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase, QuizSubmission } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, History } from 'lucide-react';
import { format } from 'date-fns';

export function QuizHistoryPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubmissions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('quiz_submissions')
      .select('*')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to fetch quiz history.", variant: "destructive" });
    } else {
      setSubmissions(data);
    }
    setLoading(false);
  }, [user, toast]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return "default";
    if (percentage >= 50) return "secondary";
    return "destructive";
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quiz History</CardTitle>
        <CardDescription>Review your past quiz attempts and scores.</CardDescription>
      </CardHeader>
      <CardContent>
        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <History className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Quiz History</h3>
            <p className="mt-1 text-sm text-muted-foreground">Take a practice quiz to see your results here.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quiz Topic</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map(submission => (
                <TableRow key={submission.id}>
                  <TableCell className="font-medium">{submission.quiz_title || submission.quiz_topic}</TableCell>
                  <TableCell>{submission.score}/{submission.total_possible}</TableCell>
                  <TableCell>
                    <Badge variant={getScoreBadgeVariant(submission.percentage ?? 0)}>
                      {submission.percentage?.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(submission.submitted_at), 'PPP')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
