/*
          # [Operation Name]
          Create Tasks Table and Enable RLS

          ## Query Description: [This script creates a new 'tasks' table to store user-specific tasks for the Task Manager feature. It also enables Row-Level Security (RLS) on the table and adds policies to ensure users can only access their own tasks. This is a non-destructive operation that adds new functionality without affecting existing data.]
          
          ## Metadata:
          - Schema-Category: "Structural"
          - Impact-Level: "Low"
          - Requires-Backup: false
          - Reversible: true
          
          ## Structure Details:
          - Adds new table: `public.tasks`
          - Columns: `id`, `user_id`, `title`, `description`, `start_time`, `end_time`, `is_completed`, `created_at`
          
          ## Security Implications:
          - RLS Status: Enabled
          - Policy Changes: Yes, adds new policies for `tasks` table.
          - Auth Requirements: Users must be authenticated to interact with the table.
          
          ## Performance Impact:
          - Indexes: Adds a primary key index on `id` and an index on `user_id`.
          - Triggers: None
          - Estimated Impact: Low, as it's a new table for a new feature.
          */

-- Create the tasks table
CREATE TABLE public.tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add comments to the table and columns
COMMENT ON TABLE public.tasks IS 'Stores tasks for the user task manager.';
COMMENT ON COLUMN public.tasks.user_id IS 'The user who owns the task.';
COMMENT ON COLUMN public.tasks.start_time IS 'The start time of the task/event.';
COMMENT ON COLUMN public.tasks.end_time IS 'The end time of the task/event.';

-- Enable Row-Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create an index on user_id for faster lookups
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);

-- Create policies for RLS
CREATE POLICY "Users can view their own tasks"
ON public.tasks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks"
ON public.tasks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
ON public.tasks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
ON public.tasks
FOR DELETE
USING (auth.uid() = user_id);
