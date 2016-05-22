var express = require('express')
  , http = require('http')
  , router = express.Router()
  , parse = require('./utils/parsing')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/topic', function(req, res, next) {
  let request = http.request({
    hostname: 'www.jeuxvideo.com',
    path: '/forums/42-1000021-39674315-11-0-1-0-appli-jvforum-topic-officiel.htm',
    headers: {
      'Cookie': 'coniunctio=cache_bypass'
    }
  }, (res2) => {
    let body = ''
    res2.on('data', (chunk) => {
      body += chunk
    })
    res2.on('end', () => {
      res.render('topic', {
        data: parse.topic(body),
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
