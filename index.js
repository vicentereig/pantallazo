const procStats = require('process-stats')()
const prettyBytes = require('pretty-bytes')
const browserless = require('browserless')({
    ignoreHTTPSErrors: true,
    args: ['--enable-font-antialiasing', '--font-render-hinting=none',
    '--font-render-hinting=medium',
    '--disable-gpu', '--single-process', '--no-zygote', '--no-sandbox', '--hide-scrollbars']
})
const express = require('express')
const PORT = process.env.PORT || 5000

const takeScreenshot = async (url, element = '.screenshot', res) => {
    const { cpu, uptime, memUsed} = procStats()
    const buffer = await browserless.screenshot(url,
        {
            waitUntil:['networkidle0','domcontentloaded'], device: 'iPhone X', element: element
        })

    res.type('png').end(buffer, 'binary')

    console.log(`screenshot size=${prettyBytes(buffer.byteLength)} time=${uptime.pretty} mem=${memUsed.pretty} cpu=${cpu}`)
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
