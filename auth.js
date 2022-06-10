/*
 Auth

* pre: read the users table  -  need users table Key,  and secret encrypt val 
* login.... send name, and hash of pwd
* if pwd hash equals user's stored hash, then send back cookie with encrypted (jwt) token: name + roles
  * encrypted with ? local secret
* subsequent calls will send token, decrypt cookie
* for whatever calls are needed, check name/roles
*/
const db = require('./db.js')
const bcrypt = require('bcrypt')

const SALT_ROUNDS = 10
const AUTH_BASE_KEY = process.env.AIRTABLE_USERS_KEY
const DB_USERS_TABLE_NAME = 'users'

const cookie = x => {
}

const setPwd = async (base, p,u) => { 
  console.log('setPwd: u: ',u,' p: ',p, )
  const hash = await bcrypt.hash(p, SALT_ROUNDS).catch( err => console.error(err) )
  console.log('setpwd - newPwd: ', p, ' hash: ', hash)

  const v = {
    "id": u.ref,
    "fields": {
      "pwdhash": hash,
      "status": 'ok'
    }
  }
  const r = await base.update('users', v, function(err, records) {
    if (err) {
      console.error(err)
    }
  })
  console.log('after await base update r:',r)

  return 200
}

const checkPwd = self => async (uname,pwd,udb) => {
  console.log('checkPwd: uname: ',uname,' pwd: ',pwd)
  let rcode = 999

  const u = self.users[uname]
  console.log('... auth.checkPwd u:', u)
  // only one of the following three if-clauses will be run
  if (! u) { 
    console.log('user not found: ', uname) 
    rcode = 401
  } 
  if ( u && u.status == 'ok' ) {
    const match = await bcrypt.compare(pwd,u.pwdhash)
    console.log('match: ', match)
    rcode = match ? 200 : 401
  }
  if ( u && u.status == 'init' ) {
    console.log('... auth resetting')
    const r = await setPwd(self.base,pwd,u)
    await _reload(self)
    console.log('----setpwd')
    console.dir(r)
    rcode = 200
  }

  return rcode
}

const _reload = async self => {
  self.usersRaw = await self.base.getAll(DB_USERS_TABLE_NAME)
  self.users = Object.keys(self.usersRaw).reduce( _fromRefToUser(self.usersRaw), {} )
}

const _fromRefToUser = uRaw => (a,c) => { 
  const username = uRaw[c].username
  a[username] = uRaw[c] 
  a[username].ref = c
  return a 
}

const init = async ( opts ) => { 
  //console.log('auth init', opts.baseKey)
  const self = {
    base: db.setBase(AUTH_BASE_KEY),
    usersRaw: null,
    users: null
  }
  await _reload(self)

  return {
    checkPwd: checkPwd(self)
  }
}

module.exports = {
  init
}
