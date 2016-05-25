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
  regex = /<span class="JvCare[^<]+>([^<]+)(?:<i><\/i><span>([^<]+)<\/span>([^<]+))?<\/span>/g
  while (matches = regex.exec(content)) {
    let url = matches.slice(1).join('')
    content = content.replace(matches[0], `<a href="${url}" title="${url}" target="_blank">${url}</a>`)
  }

  // Email addresses
  // 1. Add mailto: at the start
  // 2. Normalize it by de-obfuscating it. Each character of a mail is randomly encoded in one of two HTML entities styles;
  //    this causes the message's checksum to change at every refresh, thus making it look as if the message has changed.
  regex = /<a href="((?:&#[x0-9a-f]+;)+)"[^<]+>([^<]+)<\/a>/g
  while (matches = regex.exec(content)) {
    let email = entities.decode(matches[1])
    content = content.replace(matches[0], `<a href="mailto:${email}" title="${email}" target="_blank">${email}</a>`)
  }

  return content
}

module.exports = {
  adaptMessageContent,
}
