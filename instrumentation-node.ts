const isLocalStorageNoise = (err: unknown): boolean => {
  const msg =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : (err as { message?: string })?.message ?? "";
  return typeof msg === "string" && msg.includes("localStorage.getItem is not a function");
};

export function registerNodeHandlers() {
  process.on("unhandledRejection", (reason) => {
    if (isLocalStorageNoise(reason)) return;
    console.error("[unhandledRejection]", reason);
  });

  process.on("uncaughtException", (err) => {
    if (isLocalStorageNoise(err)) return;
    console.error("[uncaughtException]", err);
  });
}
