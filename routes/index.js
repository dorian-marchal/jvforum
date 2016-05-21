var express = require('express')
  , http = require('http')
  , router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

http.globalAgent.keepAlive = true
http.globalAgent.maxSockets = 30

router.get('/topic', function(req, res, next) {
  let request = http.request({
    hostname: 'www.jeuxvideo.com',
    path: '/forums/42-1000021-47040669-1-0-1-0-les-voyages-de-presse-qu-en-est-il-posez-vos-questions.htm',
    headers: {
      'Cookie': 'coniunctio=cache_bypass'
    }
  }, (res2) => {
    let text = ''
    res2.on('data', (chunk) => {
      text += chunk
    })
    res2.on('end', () => {
      res.contentType('text/plain')
      res.send(text)
    })
  })

  request.on('error', (e) => {
    console.log(`error: ${e.message}`)
    res.contentType('text/plain')
    res.send('error')
  })

  request.end()
})

module.exports = router;
