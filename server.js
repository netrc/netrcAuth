
const express = require('express')
const cookieParser = require('cookie-parser')
const port = process.env.PORT || 8080

const auth = require('./auth');
const c3cookie = require('./c3cookie.js')
const vlcbdb = require('./vlcbdb');

const makeApp = async appName => { 
  const app = express()

  app.use(cookieParser()) 
  app.use(c3cookie.cookieDecrypt(appName)) // gets user/groups as encoded in cookie

  const authBase = await auth.init().catch( err => console.error(err) )

  const v = vlcbdb.init()
  await v.refresh() // and updates cache stats

  app.get('/check', (req, res) => {
    const rcode = v.status=='ok' ? 200 : 503
    console.log('check groups'); console.dir(req.c3auth)
    res.status(rcode).json({ calledBy: "check", ...v.info });
  });
  app.get('/reload', async (req, res) => {
    await v.refresh() // and updates cache stats
    res.json({ calledBy: "reload", ...v.info });
  });

  app.get('/signon', async (req, res) => { // username, pwd in header
    const user = req.header('user') 
    const pwd = req.header('pwd') 
    const ret = { code: 401, err: '' }

    ret.err += (!user) ?  'missing user; ' : ''
    ret.err += (!pwd)  ?  'missing pwd; ' : ''
    if (ret.err == '') { // good enough to check
      ret.code = await authBase.checkPwd(user,pwd)
      if (ret.code==200) {
        //const cookie = ? c3cookie.set( user, groups )
  console.log('cookie: ', cookie)
        const expDate = new Date( Date.now() + 25*60*60 ) // in seconds (!not ms)
        res.cookie(appName, cookie, { expires: expDate })
      }
    }

    res.status(ret.code).json({ calledBy: "/signon", error: ret.err });
  });

  v.tables.forEach( t => { // simple handler for each table
    app.get(`/${t}/:id?`, v.idHandler(t)) 
  })
  return app
}

const main = async () => {
  const app = await makeApp('vlcb2')
  const server = app.listen(port, '0.0.0.0');
  process.on('SIGTERM', () => {
    server.close( () => { console.log('SIGTERM received: server closed') })
  })
}

main()
