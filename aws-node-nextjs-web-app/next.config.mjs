/** @type {import('next').NextConfig} */
const nextConfig = {
  // Writes a self-contained server to .next/standalone, with only the
  // node_modules files it needs. That directory is what gets deployed.
  output: 'standalone',
  // Trace files from this directory, so the server lands at
  // .next/standalone/server.js even when a parent directory has a lockfile.
  outputFileTracingRoot: import.meta.dirname,
  turbopack: {
    root: import.meta.dirname,
  },
}

export default nextConfig
