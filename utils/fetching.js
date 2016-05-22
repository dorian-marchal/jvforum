var http = require('http')

function topic(mode, forumId, idLegacyOrNew, page, slug, successCallback, failCallback) {
  let request = http.request({
    hostname: 'www.jeuxvideo.com',
    path: `/forums/${mode}-${forumId}-${idLegacyOrNew}-${page}-0-1-0-${slug}.htm`,
    headers: {
      'Cookie': 'coniunctio=cache_bypass'
    }
  }, (res) => {
    let body = ''
    res.on('data', (chunk) => {
      body += chunk
    })
    res.on('end', () => {
      successCallback(body)
    })
  })

  request.on('error', failCallback)

  request.setTimeout(1500, () => {
    console.log('timeout')
    request.abort()
  })

  request.end()
}

module.exports = {
  topic,
}
