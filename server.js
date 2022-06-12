
const express = require('express')
const cookieParser = require('cookie-parser')

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
    const rcode = v.info.cacheStatus=='ok' ? 200 : 503
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
      const r = await authBase.checkPwd(user,pwd)
      ret.code = r.code
      if (r.code==200) {
        const c = c3cookie.setCookie(appName,r.user)
        console.log('signon cookie: ', c)
        const expDate = new Date( Date.now() + 25*60*60 ) // in seconds (!not ms)
        res.cookie(appName, c.cookie, { expires: expDate })
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
  const port = process.env.PORT || 8080
  const server = app.listen(port, '0.0.0.0');
  process.on('SIGTERM', () => {
    server.close( () => { console.log('SIGTERM received: server closed') })
  })
}

main()
