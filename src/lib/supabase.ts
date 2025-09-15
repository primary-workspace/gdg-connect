import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for database tables
export interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
  college_name?: string
  avatar_url?: string
  role: 'admin' | 'moderator' | 'member'
  created_at: string
  updated_at: string
}

export interface LearningPath {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  topics: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  estimated_duration?: number;
  progress: number;
  ai_generated: boolean;
  milestones?: {
    name: string;
    duration: number;
    topics: string[];
    resources: {
      title: string;
      type: string;
      url: string;
    }[];
    completed: boolean;
  }[];
  created_at: string;
  updated_at: string;
}

export interface Quiz {
  id: string
  title: string
  description?: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  questions: any[]
  created_by: string
  ai_generated: boolean
  time_limit?: number
  total_marks: number
  is_published: boolean
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface QuizSubmission {
  id: string
  quiz_id?: string | null
  user_id: string
  answers: any[]
  score?: number
  total_possible?: number
  percentage?: number
  time_taken?: number
  submitted_at: string
  quiz_title?: string;
  quiz_topic?: string;
}

export interface Task {
  id: number;
  user_id: string;
  title: string;
  start: string;
  end: string;
  description?: string;
  completed: boolean;
  created_at: string;
}
