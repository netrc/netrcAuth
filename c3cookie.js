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
  const [ iv, content ] = c.split('|')
  if ( iv=="none" || !content ) {
    console.log('decrypt cookie - nothing')
    return ''
  }
  const h = { iv, content }
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
  //console.log('check cookies: ', req.cookies)
  req.c3auth = null // our auth answer is stored in req
  // r.c is an odd object; is Object.create(null)
  if ( Object.keys(req.cookies).length>0 && req.cookies[appName] ) { 
    const cookiePipe = decryptFromCookie(req.cookies[appName])
    console.log("...cp... ", cookiePipe)
    const authInfo = cookiePipe.split('|')
    req.c3auth = { appName: authInfo[0], user: authInfo[1], groups: authInfo[2].split(',') }
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
