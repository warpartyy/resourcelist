import { NextRequest, NextResponse } from "next/server";
import { runBenchmark } from "@/lib/services/resources/ai/benchmark/runner";
import { getRegisteredPrompts } from "@/lib/services/resources/ai/prompts/registry";

type BenchmarkRequestBody = {
  promptVersions?: unknown;
};

export async function POST(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as BenchmarkRequestBody;
    const promptVersions = readPromptVersions(body.promptVersions);
    const unknownVersions = getUnknownPromptVersions(promptVersions);

    if (unknownVersions.length > 0) {
      return NextResponse.json(
        { error: `Unknown prompt version(s): ${unknownVersions.join(", ")}` },
        { status: 400 }
      );
    }

    return NextResponse.json(await runBenchmark({ promptVersions }));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Invalid")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("AI benchmark API error", error);
    return NextResponse.json(
      { error: "Failed to run benchmark" },
      { status: 500 }
    );
  }
}

function isAuthorized(req: NextRequest): boolean {
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  const regressionKey = process.env.ADMIN_REGRESSION_KEY;

  if (!regressionKey) {
    return false;
  }

  return req.headers.get("x-admin-regression-key") === regressionKey;
}

function readPromptVersions(value: unknown): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    throw new Error("Invalid promptVersions: must be an array");
  }

  if (!value.every((item) => typeof item === "string")) {
    throw new Error("Invalid promptVersions: all values must be strings");
  }

  return value;
}

function getUnknownPromptVersions(promptVersions: string[] | undefined): string[] {
  if (!promptVersions) {
    return [];
  }

  const registeredVersions = new Set(
    getRegisteredPrompts().map((prompt) => prompt.version)
  );

  return promptVersions.filter((version) => !registeredVersions.has(version));
}
