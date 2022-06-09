
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

const hash = x => {
}

const cookie = x => {
}

const setPwd = async (base, p,u) => { 
  console.log('setPwd: u: ',u,' p: ',p, )
  const saltRounds = 10
  const hash = await bcrypt.hash(p, saltRounds).catch( err => console.error(err) )
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

const checkPwd = (base, users) => async (uname,pwd,udb) => {
  console.log('checkPwd: uname: ',uname,' pwd: ',pwd)
  let rcode = 999

  const u = users[uname]
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
    const r = await setPwd(base,pwd,u)
    console.log('----setpwd')
    console.dir(r)
    rcode = 200
  }

  return rcode
}

const _fromRefToUser = uRaw => (a,c) => { 
  const username = uRaw[c].username
  a[username] = uRaw[c] 
  a[username].ref = c
  return a 
}

const init = async ( opts ) => { 
  //console.log('auth init', opts.baseKey)
  const base = db.setBase(opts.baseKey)
  const usersRaw = await base.getAll('users')
  const users = Object.keys(usersRaw).reduce( _fromRefToUser(usersRaw), {} )

  return {
    checkPwd: checkPwd(base,users)
  }
}

module.exports = {
  init
}
