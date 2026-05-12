import { NextResponse } from "next/server";
import crypto from "node:crypto";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_BASE_URL
  ? `${process.env.NEXT_PUBLIC_BASE_URL}/api/spotify/callback`
  : "http://localhost:3000/api/spotify/callback";

const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-library-modify",
].join(" ");

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

export async function GET() {
  const verifier = base64url(crypto.randomBytes(64));
  const challenge = base64url(
    Buffer.from(crypto.createHash("sha256").update(verifier).digest())
  );

  const params = new URLSearchParams({
    client_id: SPOTIFY_CLIENT_ID,
    response_type: "code",
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  const response = NextResponse.redirect(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );

  response.cookies.set("spotify_pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 300,
    path: "/",
  });

  return response;
}
