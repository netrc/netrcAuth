
const cache = require('./cache')

const airtableNames = {
  churches: 'Churches',
  brasses: 'Brasses',
  rubbings: 'Rubbings',
  pictures: 'Pictures',
  notes: 'Notes'
}

const tables = () => Object.keys(airtableNames) 

const refresh = c => async () => {
  // all the inner awaits come out as promises which need their own await
  await Promise.all( tables().map( async t => {
    c.data[t] = await c.base.getAll(airtableNames[t]).catch( err => console.error(err) )
  }) )

  // if ok...
  c.refresh()
}

const info = c => () => c.info

const findDbField = (d, f, n) => { // d = { refNNNN: { name: 'abcd', ...rest }, ... }
  return Object.keys(d).filter( x => d[x][f]==n ).map( k => d[k] )
}

// similar for text search
  

const idHandler = db => t => (req, res) => { // to make app.get handlers
  //console.log(`${t}: ${req.params.id}`)
  if (req.query && req.query.name) {
console.log(`idHandler: req.query.name ${req.query.name}`)
    const r = findDbField(db.data[t], 'name', req.query.name)
    res.json(r)
  } else if (!req.params.id) { // return all
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

const setEndpoints = c => app => {
  tables().forEach( t => { // simple handler for each table
    app.get(`/${t}/:id?`, idHandler(c)(t)) 
  })
  // other endpoints?
}

const init = () => {
  const c = cache.init( { baseKey: process.env.AIRTABLE_VLCB_KEY } )
  return {
    refresh: refresh(c),
    info: info(c),
    setEndpoints: setEndpoints(c)
  }
}

module.exports = {
  init,
}
