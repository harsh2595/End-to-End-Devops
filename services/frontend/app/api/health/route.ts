const gatewayUrl =
  process.env.GATEWAY_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const authUrl = process.env.AUTH_SERVICE_URL || "http://localhost:4000";
const ordersUrl = process.env.ORDERS_SERVICE_URL || "http://localhost:7000";

async function checkJson(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data.status || `HTTP ${response.status}`;
}

async function checkText(url: string) {
  const response = await fetch(url, { cache: "no-store" });
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `HTTP ${response.status}`);
  }

  return text;
}

export async function GET() {
  const checks = await Promise.allSettled([
    checkJson(`${gatewayUrl}/health`),
    checkText(`${authUrl}/health`),
    checkText(`${ordersUrl}/health`),
  ]);

  return Response.json({
    gateway:
      checks[0].status === "fulfilled"
        ? checks[0].value
        : "Gateway unavailable",
    auth:
      checks[1].status === "fulfilled" ? checks[1].value : "Auth unavailable",
    orders:
      checks[2].status === "fulfilled"
        ? checks[2].value
        : "Orders unavailable",
  });
}
