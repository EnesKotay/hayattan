export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("@/backend/config/init-env");
  }
}
