import { NextResponse } from "next/server";
import { loadWebsiteBuildSha } from "@/lib/build-sha";

export const dynamic = "force-static";

const sha = loadWebsiteBuildSha();

export async function GET() {
  return NextResponse.json({ sha });
}
