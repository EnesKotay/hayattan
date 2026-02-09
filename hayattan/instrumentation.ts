/**
 * Next.js Instrumentation
 * Runs once when the Node.js server starts (env validation)
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./src/lib/init-env");
  }
}
