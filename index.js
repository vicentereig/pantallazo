const procStats = require('process-stats')()
const prettyBytes = require('pretty-bytes')

const defaultHeadlessArgs = "--disable-setuid-sandbox --disable-dev-shm-usage --disable-accelerated-2d-canvas --no-first-run --enable-font-antialiasing --font-render-hinting=none --disable-gpu --single-process --no-zygote --no-sandbox --hide-scrollbars"
const args = (process.env.HEADLESS_ARGS || defaultHeadlessArgs).split(' ')
const waitUntil = (process.env.WAIT_UNTIL || "networkidle0").split(' ')

// const browserless = require('browserless')()

const createBrowserless = require('@browserless/pool')

const pool = createBrowserless({
    max: process.env.WEB_CONCURRENCY || 2,
    timeout: 30000
  },
  {
      ignoreHTTPSErrors: true,
      args: args
  }
)

process.on('exit', async () => {
    await pool.drain()
    await pool.clear()
})

const express = require('express')
const PORT = process.env.PORT || 5000

const takeScreenshot = async (url, element = '.screenshot', res) => {
    const { cpu, uptime, memUsed} = procStats()
    console.log(`screenshot-starts url=${url} element=${element} time=${uptime.pretty} mem=${memUsed.pretty} cpu=${cpu}`)
    const buffer = await pool.screenshot(url,
        {
            waitUntil: waitUntil, device: 'iPhone X', element: element,
            viewport: { deviceScaleFactor: 2}
        })

    res.type('png').end(buffer, 'binary')

    console.log(`screenshot-end size=${prettyBytes(buffer.byteLength)} time=${uptime.pretty} mem=${memUsed.pretty} cpu=${cpu}`)
}

express().get('/', async(request, res) => {
    const { url, element } = request.query


    if  (url === undefined) {
        return res.status(400).end('Missing url')
    }

    try {
        return await takeScreenshot(url, element, res)
    } catch(e) {
        console.log('Error: ', e)
    } finally {
        return res.status(500).end('Screenshot failed')
    }
})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))
