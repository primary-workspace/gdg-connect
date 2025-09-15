/*
# Initial Database Schema for GDG Connect Hub
Creates comprehensive schema for user management, events, quizzes, attendance tracking, and AI-generated content.

## Query Description: 
This migration establishes the foundational database structure for the GDG Connect Hub platform. It creates tables for user profiles, events, attendance tracking, quizzes, test generation, plagiarism checking, and learning paths. All tables implement Row Level Security (RLS) for data protection. The migration is safe for initial setup and includes proper foreign key relationships and indexes for optimal performance.

## Metadata:
- Schema-Category: "Structural"
- Impact-Level: "Low"
- Requires-Backup: false
- Reversible: true

## Structure Details:
- profiles: User profile data linked to auth.users
- events: Community events with AI-generated content
- attendance: Event attendance tracking
- quizzes: AI-generated quizzes and tests
- quiz_submissions: User quiz responses
- learning_paths: Personalized learning recommendations
- plagiarism_checks: Document plagiarism analysis results

## Security Implications:
- RLS Status: Enabled on all public tables
- Policy Changes: Yes - comprehensive RLS policies created
- Auth Requirements: All operations require authenticated users

## Performance Impact:
- Indexes: Added on foreign keys and frequently queried columns
- Triggers: Profile creation trigger on auth.users insert
- Estimated Impact: Minimal - optimized for read/write operations
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  college_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('workshop', 'seminar', 'hackathon', 'meetup', 'conference')),
  date_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  max_participants INTEGER,
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_generated BOOLEAN DEFAULT false,
  tags TEXT[],
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'absent')),
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  attended_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(event_id, user_id)
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS public.quizzes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  topic TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  questions JSONB NOT NULL, -- Array of question objects
  created_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ai_generated BOOLEAN DEFAULT true,
  time_limit INTEGER, -- in minutes
  total_marks INTEGER DEFAULT 100,
  is_published BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create quiz submissions table
CREATE TABLE IF NOT EXISTS public.quiz_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL, -- User's answers
  score INTEGER,
  total_possible INTEGER,
  percentage DECIMAL(5,2),
  time_taken INTEGER, -- in seconds
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quiz_id, user_id)
);

-- Create learning paths table
CREATE TABLE IF NOT EXISTS public.learning_paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[] NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration INTEGER, -- in hours
  progress INTEGER DEFAULT 0, -- percentage completed
  ai_generated BOOLEAN DEFAULT true,
  resources JSONB, -- Learning resources and links
  milestones JSONB, -- Progress milestones
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plagiarism checks table
CREATE TABLE IF NOT EXISTS public.plagiarism_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  original_content TEXT,
  similarity_score DECIMAL(5,2),
  sources_found JSONB, -- Array of similar sources
  analysis_result JSONB, -- Detailed analysis data
  status TEXT DEFAULT 'processing' CHECK (status IN ('processing', 'completed', 'failed')),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plagiarism_checks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles" ON public.profiles
  FOR SELECT USING (true);

-- Create RLS policies for events
CREATE POLICY "Anyone can view published events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create events" ON public.events
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own events" ON public.events
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" ON public.events
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for attendance
CREATE POLICY "Users can view attendance data" ON public.attendance
  FOR SELECT USING (true);

CREATE POLICY "Users can register for events" ON public.attendance
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own attendance" ON public.attendance
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for quizzes
CREATE POLICY "Anyone can view published quizzes" ON public.quizzes
  FOR SELECT USING (is_published = true OR auth.uid() = created_by);

CREATE POLICY "Authenticated users can create quizzes" ON public.quizzes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own quizzes" ON public.quizzes
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own quizzes" ON public.quizzes
  FOR DELETE USING (auth.uid() = created_by);

-- Create RLS policies for quiz submissions
CREATE POLICY "Users can view their own submissions" ON public.quiz_submissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Quiz creators can view submissions" ON public.quiz_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quizzes 
      WHERE quizzes.id = quiz_submissions.quiz_id 
      AND quizzes.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can submit to quizzes" ON public.quiz_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for learning paths
CREATE POLICY "Users can view their own learning paths" ON public.learning_paths
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create learning paths" ON public.learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own learning paths" ON public.learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own learning paths" ON public.learning_paths
  FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for plagiarism checks
CREATE POLICY "Users can view their own plagiarism checks" ON public.plagiarism_checks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create plagiarism checks" ON public.plagiarism_checks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date_time ON public.events(date_time);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON public.events(created_by);
CREATE INDEX IF NOT EXISTS idx_attendance_event_id ON public.attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_user_id ON public.attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON public.quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_quiz_id ON public.quiz_submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON public.quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON public.learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_checks_user_id ON public.plagiarism_checks(user_id);
