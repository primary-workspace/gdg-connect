-- This migration updates the 'tasks' table to support completion status
-- and fixes the 'quiz_submissions' table to correctly store practice quiz results.

/*
# [Operation Name]
Schema Fix for Tasks and Quiz Submissions

## Query Description:
This script performs two main actions:
1.  It adds an `is_completed` column to the `tasks` table to allow users to track their task status. This is a non-destructive addition.
2.  It modifies the `quiz_submissions` table to correctly store on-the-fly practice quizzes by removing the unused `quiz_id` and adding `quiz_title` and `quiz_topic` fields. This makes the table self-contained for practice quizzes.

## Metadata:
- Schema-Category: ["Structural"]
- Impact-Level: ["Low"]
- Requires-Backup: false
- Reversible: true

## Structure Details:
- Modifies `public.tasks`: Adds `is_completed` column.
- Modifies `public.quiz_submissions`: Removes `quiz_id` column and adds `quiz_title`, `quiz_topic` columns.

## Security Implications:
- RLS Status: Unchanged
- Policy Changes: No
- Auth Requirements: None

## Performance Impact:
- Indexes: None
- Triggers: None
- Estimated Impact: Negligible performance impact.
*/

-- Add 'is_completed' column to tasks table to track completion status.
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN NOT NULL DEFAULT false;

-- Drop the foreign key constraint on 'quiz_id' if it exists, as it's not used for practice quizzes.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'quiz_submissions_quiz_id_fkey' AND conrelid = 'public.quiz_submissions'::regclass) THEN
      ALTER TABLE public.quiz_submissions DROP CONSTRAINT quiz_submissions_quiz_id_fkey;
   END IF;
END
$$;

-- Drop the 'quiz_id' column as it's being replaced by text fields for more flexibility.
ALTER TABLE public.quiz_submissions
DROP COLUMN IF EXISTS quiz_id;

-- Add 'quiz_title' and 'quiz_topic' to store practice quiz details directly.
ALTER TABLE public.quiz_submissions
ADD COLUMN IF NOT EXISTS quiz_title TEXT,
ADD COLUMN IF NOT EXISTS quiz_topic TEXT;
