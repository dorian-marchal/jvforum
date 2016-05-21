var express = require('express')
  , http = require('http')
  , router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function parseTopic(body) {
  let retour = {}

  retour.title = false
  let matches = body.match(/<span id="bloc-title-forum">(.+)<\/span>/)
  if (matches) {
    retour.title = matches[1]
  }

  return retour.title
}

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
      res.render('topic', {
        title: parseTopic(text),
      })
    })
  })

  request.on('error', (e) => {
    console.log(`error: ${e.message}`)
    res.render('error', {
      message: 'Erreur réseau',
      error: {status: 'La page n’a pas pu être récupérée depuis jeuxvideo.com.'},
    })
  })

  request.setTimeout(1500, () => {
    console.log('timeout')
    request.abort()
  })

  request.end()
})

module.exports = router;
