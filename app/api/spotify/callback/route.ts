import { type NextRequest, NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`
  : "http://localhost:3000/api/spotify/callback";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/?spotify_error=${error ?? "missing_code"}`
    );
  }

  const verifier = request.cookies.get("spotify_pkce_verifier")?.value;
  if (!verifier) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/?spotify_error=missing_verifier`
    );
  }

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: SPOTIFY_CLIENT_ID,
    code_verifier: verifier,
  });

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!tokenRes.ok) {
    const errorBody = await tokenRes.text();
    console.error("[spotify/callback] token exchange failed:", errorBody);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/?spotify_error=token_exchange_failed`
    );
  }

  const data = (await tokenRes.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><title>Connecting…</title></head>
<body style="background:#000;color:rgba(255,255,255,0.6);font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;">
  <span>Connecting to Spotify…</span>
  <script>
    (function () {
      try {
        sessionStorage.setItem("spotify_access_token", ${JSON.stringify(data.access_token)});
        sessionStorage.setItem("spotify_token_expiry", String(Date.now() + ${data.expires_in} * 1000));
      } catch (_) {}
      var back = document.referrer;
      window.location.href = (back && !back.includes("/api/spotify")) ? back : "/";
    })();
  </script>
</body>
</html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });

  response.cookies.set("spotify_pkce_verifier", "", {
    maxAge: 0,
    path: "/",
  });

  return response;
}
