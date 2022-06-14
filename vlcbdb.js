
const cache = require('./cache')

const tables = ['churches', 'brasses', 'rubbings', 'pictures']

const refresh = c => () => c.refresh()
//const status = c => () => c.info.status
const info = c => () => c.info

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
    refresh: refresh(c),
    info: info(c),
    idHandler: idHandler(c)
  }
}

module.exports = {
  init
}
  
//  c.data.churches = await c.base.getAll('Churches').catch( err => console.error(err) )
