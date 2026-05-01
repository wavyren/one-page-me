export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatar_url?: string;
  plan: "free" | "pro" | "business";
  preferred_language: "zh" | "en";
  created_at: string;
}
