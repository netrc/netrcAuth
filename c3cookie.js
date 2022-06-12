const crypto = require('crypto')

const AES256 = 'aes-256-ctr'
const secretKey = (process.env.AIRTABLE_APIKEY+process.env.AIRTABLE_APIKEY).substring(0,32)

const encrypt = s => {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(AES256, secretKey, iv)
    const encrypted = Buffer.concat([cipher.update(s), cipher.final()])

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    }
}

const decrypt = hash => {
    const decipher = crypto.createDecipheriv(AES256, secretKey, Buffer.from(hash.iv, 'hex'))
    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

    return decrpyted.toString()
}

const encryptToCookie = s => {
  const c = encrypt(s)
  return `${c.iv}|${c.content}`
}

const decryptFromCookie = c => {
console.dir(c)
  const [ iv, content ] = c.split('|')
  if ( iv=="none" || !content ) {
    console.log('decrypt cookie - nothing')
    return ''
  }
  const h = { iv, content }
console.dir(h)
  return decrypt(h)
}

const setCookie = (appName, user) => {
  const cookieRaw = appName + '|' + user.username + "|" + user.groups
  console.log('cookieRaw: ',cookieRaw)
  const cookie = encryptToCookie(cookieRaw)
  console.log('cookiestr',cookie)
  r = { username: user.username, groups: user.groups, cookie: cookie }
  return r
}

const cookieDecrypt = appName => (req, res, next) => { // express middleware
  console.log('check cookies: ', req.cookies)
console.log('cd: ', req.cookies[appName])
  req.c3auth = null
  if ( ! JSON.stringify({...req.cookies})=='{}' ) { // cuz r.c is Object.create(null)
    const authInfo = req.cookies[appName].split('|')
console.log('cd ai: ', authInfo)
    // if this looks like a good  appName cookie
    // decode the groups
    // req.c3auth = c3cookie.decryptFromCookie(
    req.c3auth = { user: authInfo[1], groups: authInfo[2].split(',') }
  }
  next()
}

module.exports = {
    encrypt,
    decrypt,
    encryptToCookie,
    decryptFromCookie,
    cookieDecrypt,
    setCookie
}
