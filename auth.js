
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

const checkPwd = (base, users) => async (uname,pwd) => {
  console.log('checkPwd: uname: ',uname,' pwd: ',pwd)
  const r = { code: 999, user: null }

  r.user = users[uname]
console.log('... auth.checkPwd u:', r.user)
  // only one of the following three if-clauses will be run
  if (! r.user) { 
    console.log('user not found: ', uname) 
    r.code = 401
  } 
  if ( r.user && r.user.status == 'ok' ) {
    const match = await bcrypt.compare(pwd,r.user.pwdhash)
    console.log('match: ', match)
    r.code = match ? 200 : 401
  }
  if ( r.user && r.user.status == 'init' ) {
    const p = await setPwd(base,pwd,r.user)
// what is p
    console.log('----setpwd')
    console.dir(r)
    r.code = 200
  }

  return r
}

const _fromRefToUser = uRaw => (a,c) => { 
  const username = uRaw[c].username
  a[username] = uRaw[c] 
  a[username].ref = c
  return a 
}

const init = async ( opts ) => { 
  const baseKey = process.env.AIRTABLE_USERS_KEY 
  if (! baseKey ) { 
    console.error('no AIRTABLE_USERS_KEY')
    process.exit(1)
  }
  const base = db.setBase(baseKey)
  const usersRaw = await base.getAll('users')
  const users = Object.keys(usersRaw).reduce( _fromRefToUser(usersRaw), {} )

  return {
    checkPwd: checkPwd(base,users)
  }
}

module.exports = {
  init
}
