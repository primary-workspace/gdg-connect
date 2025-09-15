/*
          # [Operation Name]
          Create Quiz Submissions Table

          ## Query Description: 
          This script creates the `quiz_submissions` table to store user quiz results. It uses `IF NOT EXISTS` to prevent errors if the table was partially created before. This is a safe, non-destructive operation.
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Creates table: `public.quiz_submissions`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (Adds policies for user access)
          - Auth Requirements: Users must be authenticated.
          
          ## Performance Impact:
          - Indexes: Added on `user_id` and `quiz_id`.
          - Triggers: None
          - Estimated Impact: Low.
          */

CREATE TABLE IF NOT EXISTS public.quiz_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    quiz_title TEXT NOT NULL,
    topic TEXT,
    score INT NOT NULL,
    total_possible INT NOT NULL,
    percentage FLOAT NOT NULL,
    answers JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Policies for quiz_submissions
CREATE POLICY "Users can view their own quiz submissions"
ON public.quiz_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz submissions"
ON public.quiz_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
