import { beforeEach, describe, expect, it, vi } from "vitest";

const { sessionMock } = vi.hoisted(() => ({
  sessionMock: vi.fn(),
}));

vi.mock("./supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: sessionMock,
    },
  }),
}));

import { generateStory } from "./api";

describe("frontend auth headers", () => {
  beforeEach(() => {
    sessionMock.mockReset();
    vi.restoreAllMocks();
  });

  it("returns auth error when session is missing", async () => {
    sessionMock.mockResolvedValue({ data: { session: null } });
    const fetchSpy = vi.spyOn(global, "fetch");

    const response = await generateStory("A story about kindness");

    expect(response.status).toBe("error");
    expect(response.error).toContain("sign in");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("attaches bearer token when session exists", async () => {
    sessionMock.mockResolvedValue({
      data: { session: { access_token: "token-123" } },
    });

    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValue({
      json: async () => ({
        status: "success",
        story: "hello",
        feedback: null,
        error: null,
        request_id: "req-1",
      }),
    } as Response);

    const response = await generateStory("A story about kindness");

    expect(response.status).toBe("success");
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const fetchArgs = fetchSpy.mock.calls[0];
    const init = fetchArgs[1] as RequestInit;
    const headers = init.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer token-123");
  });
});
