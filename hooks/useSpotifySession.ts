"use client";

import { useState, useEffect } from "react";

export type SpotifySession = {
  token: string | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
};

const TOKEN_KEY = "spotify_access_token";
const EXPIRY_KEY = "spotify_token_expiry";

function readToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = sessionStorage.getItem(TOKEN_KEY);
  const expiry = sessionStorage.getItem(EXPIRY_KEY);
  if (!token || !expiry) return null;
  if (Date.now() > parseInt(expiry, 10)) {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    return null;
  }
  return token;
}

export function useSpotifySession(): SpotifySession {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(readToken());
  }, []);

  function connect() {
    window.location.href = "/api/spotify/auth";
  }

  function disconnect() {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EXPIRY_KEY);
    setToken(null);
  }

  return {
    token,
    isConnected: token !== null,
    connect,
    disconnect,
  };
}
