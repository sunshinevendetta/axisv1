export async function checkARSupport(): Promise<boolean> {
  if (typeof navigator === "undefined") return false;
  if (!("xr" in navigator)) return false;

  try {
    return await navigator.xr!.isSessionSupported("immersive-ar");
  } catch {
    return false;
  }
}
