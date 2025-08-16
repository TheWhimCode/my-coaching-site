import { NextResponse } from "next/server";
export function middleware(req: Request) {
  const url = new URL(req.url);
  if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/admin")) {
    const k = req.headers.get("x-admin-key");
    if (k !== process.env.ADMIN_KEY) return new NextResponse("Unauthorized", { status: 401 });
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*", "/api/admin/:path*"] };
