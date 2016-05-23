var express = require('express')
  , http = require('http')
  , router = express.Router()
  , parse = require('./utils/parsing')
  , fetch = require('./utils/fetching')

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' })
})

router.get('/:forumId([0-9]{1,7})/:idJvf([0-9]{1,9})-:slug([a-z0-9-]+)/:page([0-9]{1,5})?', function(req, res, next) {
  let forumId = parseInt(req.params.forumId)
    , idJvf = req.params.idJvf
    , mode = idJvf[0] == '0' ? 1 : 42
    , idLegacyOrNew = parseInt(idJvf)
    , slug = req.params.slug
    , page = req.params.page ? parseInt(req.params.page) : 1

  fetch.topic(mode, forumId, idLegacyOrNew, page, slug, (body) => {
    let parseData = parse.topic(body)
    res.render('topic2', {
      title: parseData.title,
      data: parseData,
      userAgent: req.headers['user-agent'],
      googleAnalyticsId: 'UA-63457513-1'
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
