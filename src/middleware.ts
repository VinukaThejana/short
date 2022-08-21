import { NextRequest, NextResponse } from "next/server";
import { planetscale } from "./config/planetscale";

export async function middleware(req: NextRequest) {
  // The current URL
  const url = req.nextUrl.clone();

  if (url.pathname === "/") {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  if (url.pathname.startsWith("/favicon.ico")) {
    return NextResponse.next();
  }

  const query = url.pathname.split("/");
  if (query.length !== 2) {
    return NextResponse.next();
  }
  const slug = query[1];

  try {
    const data = await planetscale.execute(
      "SELECT url FROM Links WHERE slug=?",
      [`${slug}`]
    );

    if (!data) {
      return NextResponse.next();
    }

    return NextResponse.redirect((data.rows[0] as { url: string }).url);
  } catch (error) {
    console.error();
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/:path*"],
};
