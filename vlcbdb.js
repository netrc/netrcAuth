
const cache = require('./cache')

const tables = ['churches', 'brasses', 'rubbings', 'pictures']


const refresh = () => cache.refresh()
const status = () => cache.info.status
const info = () => cache.info

const idHandler = db => t => (req, res) => { // to make app.get handlers
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


const init = () => {
  const c = cache.init( { baseKey: process.env.AIRTABLE_VLCB_KEY } )
  return {
    tables,
    refresh: c.refresh,
    status: c.info.status,
    info: c.info,
    idHandler: idHandler(c)
  }
}

module.exports = {
  init
}
  
//  c.data.churches = await c.base.getAll('Churches').catch( err => console.error(err) )
