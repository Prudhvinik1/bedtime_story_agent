import { createClient } from "./supabase/client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bedtimeagent-production.up.railway.app";

const supabase = createClient();

async function getAuthHeaders(): Promise<Record<string, string>> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (session?.access_token) {
    headers.Authorization = `Bearer ${session.access_token}`;
  }

  return headers;
}


export interface StoryResponse {
  story: string;
  feedback: string | null;
  error: string | null;
  status: string;
  request_id: string | null;
}

export async function generateStory(
  userInput: string,
  feedback?: string
): Promise<StoryResponse> {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) {
    return {
      story: "",
      feedback: null,
      error: "Please sign in to generate stories.",
      status: "error",
      request_id: null,
    };
  }

  const res = await fetch(`${API_URL}/story`, {
    method: "POST",
    headers,
    body: JSON.stringify({ user_input: userInput, feedback: feedback || null }),
  });

  const data: StoryResponse = await res.json();
  return data;
}

export async function healthCheck(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
}
