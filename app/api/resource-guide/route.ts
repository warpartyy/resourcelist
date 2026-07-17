import { NextRequest, NextResponse } from "next/server";

import { getResourceGuideData } from "@/lib/pdf/getResourceGuideData";
import { parseResourceGuideFilters } from "@/lib/pdf/parseResourceGuideFilters";
import { generateResourceGuidePdf } from "@/lib/pdf/generateResourceGuidePdf";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const filters = parseResourceGuideFilters(req.nextUrl.searchParams);
    const guideData = await getResourceGuideData(filters);

    // generateResourceGuidePdf now returns an ArrayBuffer
    const pdfBuffer = await generateResourceGuidePdf(guideData);

    const stamp = new Date().toISOString().slice(0, 10);
    const fileName = `resource-guide-${stamp}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to generate resource guide PDF:", error);

    return NextResponse.json(
      {
        error: "Unable to generate resource guide",
      },
      {
        status: 500,
      }
    );
  }
}