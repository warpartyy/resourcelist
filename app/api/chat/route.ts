import { NextRequest, NextResponse } from "next/server";
import { determineTool } from "@/lib/services/resources/ai/planner/planner";
import { executeTool } from "@/lib/services/resources/ai/tools/executor";
import type { ResourceSearchToolInput } from "@/lib/services/resources/ai/tools/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ResourceSearchToolInput;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const decision = determineTool({
      route: "/api/chat",
      message,
    });
    const result = await executeTool(decision.toolId, {
        ...body,
        message,
      });

    return NextResponse.json(
      process.env.NODE_ENV === "development"
        ? {
            ...result,
            planner: decision,
          }
        : result
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Chat API error", {
        status: 500,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        error,
      });
    } else {
      console.error("Chat API error", error);
    }

    return NextResponse.json({ error: "Failed to process chat request" }, { status: 500 });
  }
}
