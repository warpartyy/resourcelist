import { NextRequest, NextResponse } from "next/server";
import { determineTool } from "@/lib/services/resources/ai/planner/planner";
import { executeTool } from "@/lib/services/resources/ai/tools/executor";
import { fetchApprovedResourceById } from "@/lib/services/resources/approvedResourcesProvider";

type EligibilityRequestBody = {
  resourceId?: unknown;
  question?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as EligibilityRequestBody;
    const resourceId = readRequiredString(body.resourceId, "resourceId");
    const question = readRequiredString(body.question, "question");
    const resource = await fetchApprovedResourceById(resourceId);

    if (!resource) {
      return NextResponse.json(
        { error: "Approved resource not found" },
        { status: 404 }
      );
    }

    const decision = determineTool({
      route: "/api/resource-guide/eligibility",
      resourceId,
    });
    const result = await executeTool(decision.toolId, {
      resource,
      question,
    });

    if (result.type !== "eligibility_explanation") {
      throw new Error("Unexpected tool response");
    }

    return NextResponse.json({
      response: result.response,
      validation: result.validation,
      ...(process.env.NODE_ENV === "development" ? { planner: decision } : {}),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid request";

    if (message.endsWith("is required")) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.error("Resource Guide eligibility API error", error);
    return NextResponse.json(
      { error: "Failed to explain eligibility" },
      { status: 500 }
    );
  }
}

function readRequiredString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} is required`);
  }

  return value.trim();
}
