export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    message: 'Hello from a Next.js route handler!',
    time: new Date().toISOString(),
  })
}
