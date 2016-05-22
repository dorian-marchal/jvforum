function topic(body) {
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

module.exports = {
  topic,
}
