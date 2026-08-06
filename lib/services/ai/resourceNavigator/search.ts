import type { NavigatorSearchResult } from "./types";

export async function mockSearchResources(
  _question: string
): Promise<NavigatorSearchResult> {
  return {
    resources: [
      {
        id: "example-1",
        name: "Example Resource 1",
        description: "Mock resource result for architecture validation.",
      },
      {
        id: "example-2",
        name: "Example Resource 2",
        description: "Mock resource result for architecture validation.",
      },
      {
        id: "example-3",
        name: "Example Resource 3",
        description: "Mock resource result for architecture validation.",
      },
    ],
  };
}
