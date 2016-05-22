var express = require('express')
  , http = require('http')
  , router = express.Router()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

function parseTopic(body) {
  let retour = {}
    , matches

  retour.title = false
  if (matches = body.match(/<span id="bloc-title-forum">(.+)<\/span>/)) {
    retour.title = matches[1]
  }

  retour.forumSlug = retour.forumName = false
  if (matches = body.match(/<span><a href="\/forums\/0-(?:[0-9]+)-0-1-0-1-0-([a-zA-Z0-9-]+)\.htm">Forum ([^<]+)<\/a><\/span>/)) {
    retour.forumSlug = matches[1]
    retour.forumName = matches[2]
  }

  retour.messages = []
  let regex = /<div class="bloc-message-forum " data-id="([0-9]+)">\s+<div class="conteneur-message">\s+(?:<div class="bloc-avatar-msg">\s+<div class="back-img-msg">\s+<div>\s+<span[^>]+>\s+<img src="[^"]+" data-srcset="([^"]+)"[^>]+>\s+<\/span>\s+<\/div>\s+<\/div>\s+<\/div>\s+)?<div class="inner-head-content">[\s\S]+?(?:<span class="JvCare [0-9A-F]+ bloc-pseudo-msg text-([^"]+)"|<div class="bloc-pseudo-msg")[^>]+>\s+([\s\S]+?)\s+<[\s\S]+?<div class="bloc-date-msg">\s+(?:<span[^>]+>)?([0-9][\s\S]+?)(?:<\/span>)?\s+<\/div>[\s\S]+?<div class="txt-msg  text-enrichi-forum ">([\s\S]+?)<\/div><\/div>\s+<\/div>\s+<\/div>\s+<\/div>/g
  while (matches = regex.exec(body)) {
    retour.messages.push({
      html: matches[0],
      id: matches[1],
      avatar: matches[2],
      status: matches[3],
      pseudo: matches[4],
      date: matches[5],
      message: matches[6],
    })
  }

  return retour
}

http.globalAgent.keepAlive = true
http.globalAgent.maxSockets = 30

router.get('/topic', function(req, res, next) {
  let request = http.request({
    hostname: 'www.jeuxvideo.com',
    path: '/forums/42-1000021-39674315-11-0-1-0-appli-jvforum-topic-officiel.htm',
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
        data: parseTopic(text),
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
