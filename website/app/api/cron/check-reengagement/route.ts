import { NextRequest, NextResponse } from "next/server";
import { isCronDryRun, verifyCronAuth } from "@/lib/cron-auth";
import {
  checkReengagement,
  previewReengagementCheck,
} from "@/lib/crm/reengagement";

export async function GET(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (isCronDryRun(request)) {
    const report = await previewReengagementCheck();
    return NextResponse.json(report);
  }
  const enrolled = await checkReengagement();
  return NextResponse.json({ ok: true, enrolled });
}
