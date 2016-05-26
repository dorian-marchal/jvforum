var express = require('express')
  , http = require('http')
  , sha1 = require('sha1')
  , fs = require('fs')
  , parse = require('./utils/parsing')
  , fetch = require('./utils/fetching')
  , router = express.Router()

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Express' })
})

router.get('/:forumId([0-9]{1,7})/:idJvf([0-9]{1,9})-:slug([a-z0-9-]+)/:page([0-9]{1,5})?', (req, res, next) => {
  let forumId = parseInt(req.params.forumId)
    , idJvf = req.params.idJvf
    , mode = idJvf[0] == '0' ? 1 : 42
    , idLegacyOrNew = parseInt(idJvf)
    , slug = req.params.slug
    , page = req.params.page ? parseInt(req.params.page) : 1

  fetch.topic(mode, forumId, idLegacyOrNew, page, slug, body => {
    let parsed = parse.topic(body)
      , viewLocals = {
          userAgent: req.headers['user-agent'],
          googleAnalyticsId: 'UA-63457513-1',
          cssContentChecksum,
          forumId,
          idJvf,
          mode,
          idLegacyOrNew,
          slug,
          page,
          isInFavorite: false,
        }

    Object.keys(parsed).forEach(key => {
      viewLocals[key] = parsed[key]
    })

    res.render('topic2', viewLocals)
  }, (e) => {
    console.log(`error: ${e.message}`)
    res.render('error', {
      message: 'Erreur réseau',
      error: {status: 'La page n’a pas pu être récupérée depuis jeuxvideo.com.'},
    })
  })
})

let cssContentChecksum = sha1(fs.readFileSync('./public/stylesheets/jvforum.css'))

router.get(`/assets/stylesheet--${cssContentChecksum}.css`, (req, res, next) => {
  res.sendFile('jvforum.css', {root: __dirname + '/public/stylesheets/'})
})

module.exports = router;
