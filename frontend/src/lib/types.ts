export type MediaType = "image" | "video";
export type ProjectStatus = "pending" | "processing" | "completed" | "failed";

export interface Project {
  id: number;
  title: string;
  media_type: MediaType;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

export interface ProjectDetail extends Project {
  media_files: Array<{
    id: number;
    original_file: string | null;
    colorized_file: string | null;
    file_type: string;
  }>;
  ai_results: Array<{
    model_used: string;
    confidence_score: number | null;
    processing_time: number | null;
  }>;
  explanations: Array<{ text_explanation: string | null }>;
}

export interface AdminAnalytics {
  total_projects: number;
  completed_projects: number;
  processing_projects: number;
}
