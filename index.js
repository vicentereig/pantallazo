const procStats = require('process-stats')()
const prettyBytes = require('pretty-bytes')
const browserless = require('browserless')({
    ignoreHTTPSErrors: true,
    args: ['--disable-gpu', '--single-process', '--no-zygote', '--no-sandbox', '--hide-scrollbars']
})

const { cpu, uptime, memUsed} = procStats()



const url = "https://staging.gaslytics.com/cards/price_update?fuel_abbr=BIE&operator=Petromiralles"
browserless.screenshot(url, { device: 'iPhone X' }).then(buffer => {
    console.log(`  size   : ${prettyBytes(buffer.byteLength)}`)
    console.log(`  time   : ${uptime.pretty}`)
    console.log(`  memory : ${memUsed.pretty}`)
    console.log(`  cpu    : ${cpu}`)

    process.exit()
})

