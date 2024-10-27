import app from './app'

Bun.serve({
    port: 8080,
    fetch: app.fetch
})

console.log("Hello via Bun!");