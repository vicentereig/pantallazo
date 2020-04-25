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

express().get('/', async(request, res) => {
    const { cpu, uptime, memUsed} = procStats()
    const url = request.query.url

    if  (url === undefined) {
        return res.status(400).end('Missing url')
    }
    
    const buffer = await browserless.screenshot(url, 
        {
            waitUntil:['networkidle0','domcontentloaded'], device: 'iPhone X', element: '.screenshot'
        })
                
    res.type('png').end(buffer, 'binary')

    console.log(`screenshot size=${prettyBytes(buffer.byteLength)} time=${uptime.pretty} mem=${memUsed.pretty} cpu=${cpu}`)
})
.listen(PORT, () => console.log(`Listening on ${ PORT }`))