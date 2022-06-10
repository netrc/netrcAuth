
const db = require('./db.js')

// helper to make stats object with count of each data item
const oLenReducer = cd => (a,c) => { z = {}; z[c] = Object.keys(cd[c]).length; return { ...a, ...z } }

const refresh = c => async () => {
  c.data.churches = await c.base.getAll('Churches').catch( err => console.error(err) )
  c.data.brasses = await c.base.getAll('Brasses').catch( err => console.error(err) )
  c.data.rubbings = await c.base.getAll('Rubbings').catch( err => console.error(err) )
  c.data.pictures = await c.base.getAll('Pictures').catch( err => console.error(err) )

  c.info.cacheStatus = "ok"
  c.info.cacheLast = new Date()
  c.info.stats = Object.keys(c.data).reduce( oLenReducer(c.data), {} )
}

const init = opts => {
  const c = { 
    data: {},
    info: {
      lastStart: new Date(),
      cacheStatus: "not initialized"
    },
    base: db.setBase( opts.baseKey ),
    h: { // enable index.js to access the handlers
      idHandler: db.idHandler
    }
  }
  c.refresh = refresh(c)
  return c
}

module.exports = {
  init
}
