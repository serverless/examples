import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js'

/** @type {(phase: string) => import('next').NextConfig} */
export default function nextConfig(phase) {
  return {
    // Writes a self-contained server to .next/standalone, with only the
    // node_modules files it needs. That directory is what gets deployed.
    output: 'standalone',
    // Trace files from this directory, so the server lands at
    // .next/standalone/server.js even when a parent directory has a lockfile.
    outputFileTracingRoot: import.meta.dirname,
    turbopack: {
      root: import.meta.dirname,
    },
    // In `next dev`, send /api to the Express API on port 3001, as the
    // domain does once deployed. The deployed app has no rewrites.
    ...(phase === PHASE_DEVELOPMENT_SERVER && {
      async rewrites() {
        return [
          { source: '/api/:path*', destination: 'http://localhost:3001/api/:path*' },
        ]
      },
    }),
  }
}
