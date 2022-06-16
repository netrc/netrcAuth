
const db = require('./db.js')

// helper to make stats object with count of each data item
const oLenReducer = cd => (a,c) => { z = {}; z[c] = Object.keys(cd[c]).length; return { ...a, ...z } }

const refresh = c => async () => {
  c.info.cacheStatus = "ok"
  c.info.cacheLast = new Date()
  c.info.stats = Object.keys(c.data).reduce( oLenReducer(c.data), {} )
console.log(c.info)
}

const init = opts => {
  const c = { 
    data: {},
    info: {
      lastStart: new Date(),
      cacheStatus: "not initialized"
    },
    base: db.setBase( opts.baseKey )
  }
  c.refresh = refresh(c)
  return c
}

module.exports = {
  init
}
