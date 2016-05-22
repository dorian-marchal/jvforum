var express = require('express')
  , http = require('http')
  , router = express.Router()
  , parse = require('./utils/parsing')
  , fetch = require('./utils/fetching')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/topic', function(req, res, next) {
  fetch.topic(42, 1000021, 39674315, 11, 'appli-jvforum-topic-officiel', (body) => {
    res.render('topic', {
      data: parse.topic(body),
    })
  }, (e) => {
    console.log(`error: ${e.message}`)
    res.render('error', {
      message: 'Erreur réseau',
      error: {status: 'La page n’a pas pu être récupérée depuis jeuxvideo.com.'},
    })
  })
})

module.exports = router;
