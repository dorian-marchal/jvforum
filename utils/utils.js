var entities = require('html-entities').Html5Entities

function adaptMessageContent(content) {
  let matches
    , regex

  // Signatures sometimes erupt due to a bug from JVC
  let signatureIndex = content.indexOf('</div><div class="signature-msg  text-enrichi-forum ">')
  if (signatureIndex != -1) {
    adaptMessageContent = adaptMessageContent.substr(0, signatureIndex)
  }

  content = `<div class="message__content-text">${content}</div>`

  // Edit mention
  regex = /<\/div><div class="info-edition-msg">\s*Message édité le (.+?) par\s*<span class="JvCare [0-9A-F]*" target="_blank">[^<]*<\/span>/
  if (matches = regex.exec(content)) {
    let date = matches[1]
    content = content.replace(matches[0], '')
    content += `<p class="message__content-edit-mention"><span title="${date}">Modifié le ${date}</span></p>`
  }

  // JvCare links
  // Un-shorten
  regex = /<span class="JvCare[^<]+>([^<]+)(?:<i><\/i><span>([^<]+)<\/span>([^<]+))?<\/span>/g
  while (matches = regex.exec(content)) {
    let url = matches.slice(1).join('')
    content = content.replace(matches[0], `<a href="${url}" title="${url}" target="_blank">${url}</a>`)
  }

  // Non-JvCare links unshortening
  content = content.replace(/(<a[^>]+>)([^<]+)<i><\/i><span>([^<]+)<\/span>([^<]+)<\/a>/g, '$1$2$3$4</a>')

  // Email addresses
  // 1. Add mailto: at the start
  // 2. Normalize it by de-obfuscating it. Each character of a mail is randomly encoded in one of two HTML entities styles;
  //    this causes the message's checksum to change at every refresh, thus making it look as if the message has changed.
  regex = /<a href="((?:&#[x0-9a-f]+;)+)"[^<]+>([^<]+)<\/a>/g
  while (matches = regex.exec(content)) {
    let email = entities.decode(matches[1])
    content = content.replace(matches[0], `<a href="mailto:${email}" title="${email}" target="_blank">${email}</a>`)
  }

  // NoelShack thumbnails
  content = content.replace(/<a href="([^"]+)" data-def="NOELSHACK" target="_blank"><img class="img-shack" width="68" height="51" src="([^"]+)" alt="[^"]+"\/><\/a>/g, '<a class="noelshack-link" href="$1" target="_blank" title="$1"><img class="noelshack-link__thumb" src="$2" alt="$1"></a>')

  // Make NoelShack links go directly to the image file
  content = content.replace(/<a class="noelshack-link" href="(?:https?:\/\/www\.noelshack\.com\/([0-9]+)-([0-9]+)-([^"]+))" target="_blank" title="[^"]+">/g, '<a class="noelshack-link" href="http://image.noelshack.com/fichiers/$1/$2/$3" target="_blank" title="http://image.noelshack.com/fichiers/$1/$2/$3">')

  // Correct thumbnails for PSD and SWF on NoelShack
  content = content.replace(/(<a class="noelshack-link" href="[^"]+\.(swf|psd)"[^<]+>)<img class="noelshack-link__thumb" src="[^"]+"/g, '$1<img class="noelshack-link__thumb" src="http://www.noelshack.com/pics/mini_$2.png"')

  // Spoils
  content = content.replace(/<span class="bloc-spoil-jv en-ligne">.+?<span class="contenu-spoil">/g, '<span class="spoil spoil--inline"><span class="spoil__content">')
  content = content.replace(/<span class="bloc-spoil-jv">.+?<span class="contenu-spoil">/g, '<span class="spoil spoil--block"><span class="spoil__content">')

  // Quote
  content = content.replace(/<blockquote class="blockquote-jv">/g, '<blockquote class="quote">')

  // JVF links to topics and forums
  content = content.replace(/<a href="(https?:\/\/(?:www|m)\.jeuxvideo\.com\/forums\/([0-9]+)-([0-9]+)-([0-9]+)-([0-9]+)-0-1-0-([0-9a-z-]+)\.htm(?:\#post_([0-9]+))?)"[^>]+>([^<]+)<\/a>/g, (all, url, mode, forumId, topicIdLegacyOrNew, page, slug, messageId, text) => {
    let path = '/' + forumId
    if ((mode == 1 || mode == 42) && forumId != 0) {
      path += '/'
      if (mode == 1) {
        path += '0'
      }
      path += topicIdLegacyOrNew + '-' + slug
    }
    else {
      path += '-' + slug
    }
    if (page > 1) {
      path += '/' + page
    }
    if (messageId) {
      path += '#' + messageId
    }
    return `<a href="/${path}" data-link-jvc="${url}">jvforum.fr${path}</a>`
  })

  // Make JVC links open in a new tab
  content = content.replace(/<a href="(https?:\/\/(?:www|m)\.jeuxvideo\.com\/[^"]+)" title/g, '<a href="$1" target="_blank" title')

  // Show thumbnails for YouTube links
  content = content.replace(/<a href="(https?:\/\/(?:[a-z]+\.)?youtube\.com\/watch[^"]*(?:\?|&amp;)v=([a-zA-Z0-9-_]{11})([^"])*)"[^>]+>.+<\/a>/g, '<a class="youtube-link" href="$1" target="_blank" title="$1"><img class="youtube-link__thumb" src="http://img.youtube.com/vi/$2/mqdefault.jpg" alt="$1"></a>')
  content = content.replace(/<a href="(https?:\/\/youtu\.be\/([a-zA-Z0-9-_]{11})([^"])*)"[^>]+>.+?<\/a>/g, '<a class="youtube-link" href="$1" target="_blank" title="$1"><img class="youtube-link__thumb" src="http://img.youtube.com/vi/$2/mqdefault.jpg" alt="$1"></a>')

  return content
}

module.exports = {
  adaptMessageContent,
}
