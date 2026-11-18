import { NextRequest, NextResponse } from "next/server";
import { clearResellerCookie } from "@/lib/reseller-auth";

type Params = { params: Promise<{ handle: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { handle } = await params;
  await clearResellerCookie();
  return NextResponse.redirect(new URL(`/loja/${handle}`, req.nextUrl.origin));
}
