const authUrl = process.env.AUTH_SERVICE_URL || "http://localhost:4000";

export async function POST(request: Request) {
  const body = await request.json();

  const response = await fetch(`${authUrl}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  return Response.json(data, { status: response.status });
}
