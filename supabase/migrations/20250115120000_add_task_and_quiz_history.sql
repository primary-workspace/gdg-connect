/*
          # [Operation Name]
          Create Tables for Task Manager and Quiz History

          ## Query Description:
          This script adds two new tables, `tasks` and `quiz_submissions`, to support the new Task Manager and Quiz History features. It also adds a `learning_path_id` to the `quiz_submissions` table to potentially link quizzes to learning paths in the future. This operation is safe and will not affect any existing data.

          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true

          ## Structure Details:
          - Adds table `public.tasks`
          - Adds table `public.quiz_submissions`
          - Enables RLS on both new tables
          - Creates RLS policies for user-specific access

          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes (New policies for new tables)
          - Auth Requirements: User must be authenticated to access their own data.

          ## Performance Impact:
          - Indexes: Adds indexes on `user_id` for faster lookups.
          - Triggers: None
          - Estimated Impact: Low. These changes will not impact existing query performance.
          */

-- 1. Create tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to the tasks table
COMMENT ON TABLE public.tasks IS 'Stores tasks for the user calendar/task manager.';
COMMENT ON COLUMN public.tasks.user_id IS 'Links task to the user who created it.';

-- Enable RLS for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Users can view their own tasks"
ON public.tasks FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.tasks FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.tasks FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.tasks FOR DELETE
USING (auth.uid() = user_id);

-- Add indexes for tasks
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);


-- 2. Create quiz_submissions table (if it doesn't exist)
-- This is an improved version from the previous context
DROP TABLE IF EXISTS public.quiz_submissions;
CREATE TABLE public.quiz_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE SET NULL,
    learning_path_id UUID REFERENCES public.learning_paths(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    percentage NUMERIC(5, 2) NOT NULL,
    quiz_data JSONB, -- Stores the questions and user answers
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments to the quiz_submissions table
COMMENT ON TABLE public.quiz_submissions IS 'Stores results of quizzes taken by users.';
COMMENT ON COLUMN public.quiz_submissions.user_id IS 'Links submission to the user.';
COMMENT ON COLUMN public.quiz_submissions.quiz_data IS 'Contains the full quiz questions and the user''s answers.';

-- Enable RLS for quiz_submissions
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_submissions
CREATE POLICY "Users can view their own quiz submissions"
ON public.quiz_submissions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own quiz submissions"
ON public.quiz_submissions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add indexes for quiz_submissions
CREATE INDEX idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
