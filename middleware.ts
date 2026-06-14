import { NextResponse, type NextRequest } from "next/server";

const archivedPublicPaths = ["/planbaroriente", "/fifasponsor", "/fifa", "/kibibotproposal"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isArchivedPath = archivedPublicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (!isArchivedPath) {
    return NextResponse.next();
  }

  return new NextResponse(null, {
    status: 404,
    headers: {
      "x-robots-tag": "noindex, nofollow, noarchive",
    },
  });
}

export const config = {
  matcher: [
    "/planbaroriente/:path*",
    "/fifasponsor/:path*",
    "/fifa/:path*",
    "/kibibotproposal/:path*",
  ],
};
