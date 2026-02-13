import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const USERNAME = process.env.BASIC_AUTH_USER;
  const PASSWORD = process.env.BASIC_AUTH_PASS;

  // Skip Basic Auth if env vars are not set (e.g. local dev without .env)
  if (!USERNAME || !PASSWORD) {
    return NextResponse.next();
  }

  const authHeader = req.headers.get("authorization");

  if (authHeader) {
    const encoded = authHeader.split(" ")[1];
    const decoded = Buffer.from(encoded ?? "", "base64").toString();
    const [user, pass] = decoded.split(":");

    if (user === USERNAME && pass === PASSWORD) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Secure Area"',
    },
  });
}
