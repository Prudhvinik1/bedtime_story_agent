const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://bedtimeagent-production.up.railway.app";

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
  const res = await fetch(`${API_URL}/story`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_input: userInput,
      feedback: feedback || null,
    }),
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
