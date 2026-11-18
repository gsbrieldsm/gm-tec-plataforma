import { NextResponse } from "next/server";
import { clearResellerCookie } from "@/lib/reseller-auth";

export async function POST() {
  await clearResellerCookie();
  return NextResponse.json({ ok: true });
}
