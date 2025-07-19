let isBun = typeof Bun !== 'undefined' // detect Bun vs Deno

// nasty code to make it work with both Bun and Deno Deploy
let Hono, serveStatic, setCookie
if (isBun) {
    ; ({ Hono } = await import('hono'))
        ; ({ serveStatic } = await import('hono/bun'))
        ; ({ setCookie } = await import('hono/cookie'))
} else {
    ; ({ Hono } = await import('jsr:@hono/hono'))
        ; ({ serveStatic } = await import('jsr:@hono/hono/deno'))
        ; ({ setCookie } = await import('jsr:@hono/hono/cookie'))
}

let app = new Hono()

// serve all files in the ./web subfolder
app.use('/*', serveStatic({ root: './web' }))

// run the server with either Bun or Deno
if (isBun) {
    let server = Bun.serve({ fetch: app.fetch })
    console.log(`Hono server started at ${server.url}`)
} else Deno.serve(app.fetch)

app.get('/', serveStatic({ path: "./web/index.html" }))