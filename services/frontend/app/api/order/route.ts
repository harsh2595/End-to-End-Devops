const gatewayUrl =
  process.env.GATEWAY_SERVICE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function POST(request: Request) {
  const body = await request.json();
  const authorization = request.headers.get("authorization") || "";

  const response = await fetch(`${gatewayUrl}/order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authorization,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return Response.json(data, { status: response.status });
}
