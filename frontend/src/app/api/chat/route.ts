const BACKEND_URL = process.env.API_URL ?? 'http://localhost:8000'

export async function POST(req: Request) {
  const body = await req.text()

  const res = await fetch(`${BACKEND_URL}/api/v1/chat/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.X_API_KEY ?? '',
    },
    body,
  })

  return new Response(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': 'application/json' },
  })
}
