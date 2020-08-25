var fetch = require('node-fetch')
var fs = require('fs')
var path = require('path')

var log = console.log
var WORDLISTS = [
  'chinese_simplified',
  'chinese_traditional',
  'english',
  'french',
  'italian',
  'japanese',
  'spanish',
  'korean',
  'portuguese'
]

function update () {
  download().then(function (wordlists) {
    var promises = Object.keys(wordlists).map(function (name) { return save(name, wordlists[name]) })
    return Promise.all(promises)
  })
}

function download () {
  var wordlists = {}

  var promises = WORDLISTS.map(function (name) {
    return fetchRaw(name).then(toJSON).then(function (wordlist) { wordlists[name] = wordlist })
  })

  return Promise.all(promises).then(function () { return wordlists })
}

function fetchRaw (name) {
  branch = 'master'
  if (name == 'portuguese') {
    branch = '29ebb1fa6ef6f5bcf504a446b1a0512fa1cecaea'
  }
  var url = 'https://raw.githubusercontent.com/bitcoin/bips/'+branch+'/bip-0039/' + name + '.txt'
  log('download ' + url)

  return fetch(url).then(function (response) { return response.text() })
}

function toJSON (content) {
  return content.trim().split('\n').map(function (word) { return word.trim() })
}

function save (name, wordlist) {
  var location = path.join(__dirname, '..', 'ts_src', 'wordlists', name + '.json')
  var content = JSON.stringify(wordlist, null, 2) + '\n'
  log('save ' + wordlist.length + ' words to ' + location)

  return new Promise(function (resolve, reject) {
    fs.writeFile(location, content, function (err) {
      if (err) reject(err)
      else resolve()
    })
  })
}

module.exports = { update: update, download: download }
