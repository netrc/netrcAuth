
const express = require('express')
const app = express()
const port = process.env.PORT || 8080

const cache = require('./cache');
const auth = require('./auth');

const idHandler = (db,t) => (req, res) => { // to make app.get handlers
  //console.log(`${t}: ${req.params.id}`)
  if (!req.params.id) { // return all
    res.json(db.data[t])
  } else {
    const n = req.params.id
    if (db.data[t][n] != null) { // return if available
      res.json([ db.data[t][n] ])
    } else {
      res.status(404).json({error: `can't find: ${n}`})
    }
  }
}

const ustatus = s => u => (u.status==s)

const main = async () => { 
  const authBase = await auth.init( { baseKey: process.env.AIRTABLE_USERS_KEY } ).catch( err => console.error(err) )
  
  const db = cache.init( { baseKey: process.env.AIRTABLE_VLCB_KEY } )
  await db.refresh() // and updates cache stats

  app.get('/check', (req, res) => {
    res.json({ calledBy: "check", ...db.info });
  });
  app.get('/reload', async (req, res) => {
    await db.refresh() // and updates cache stats
    res.json({ calledBy: "reload", ...db.info });
  });
  app.get('/signon', async (req, res) => { // username, pwd in header
    const user = req.header('user') 
    const pwd = req.header('pwd') 

    const ret = { code: 401, err: '' }
    ret.err += (!user) ?  'missing user; ' : ''
    ret.err += (!pwd)  ?  'missing pwd; ' : ''

    if (ret.err == '') { // good enough to check
      ret.code = await authBase.checkPwd(user,pwd)
    }

    res.status(ret.code).json({ calledBy: "/signon", error: ret.err });
  });

  app.get('/churches/:id?', idHandler(db,'churches'))
  app.get('/brasses/:id?', idHandler(db,'brasses'))
  app.get('/rubbings/:id?', idHandler(db,'rubbings'))
  app.get('/pictures/:id?', idHandler(db,'pictures'))

  const server = app.listen(port, '0.0.0.0');

  process.on('SIGTERM', () => {
    server.close( () => { console.log('SIGTERM received: server closed') })
  })
}

main()
