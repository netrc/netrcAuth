
const AIRTABLE_APIKEY = process.env.AIRTABLE_APIKEY
if (!AIRTABLE_APIKEY) {
  console.error('cant find AIRTABLE_APIKEY')
  process.exit(1)
}

const Airtable = require('airtable')

const getAll = b => async t => {
  const base = new Airtable({ apiKey: AIRTABLE_APIKEY }).base(b)
  const records = await base(t).select().all()   // console.dir(records[1])
  const d = {}
  records.forEach( r => {d[r.id] = r.fields} ) // convert array to object
  return d
}

const update = b => async (t,v) => {
  const base = new Airtable({ apiKey: AIRTABLE_APIKEY }).base(b)

  const r = await base('users').update( v.id, v.fields, function(err, records) {
    if (err) {
      console.error(err)
    }
  })
  console.log('base update - after await')
}

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

const setBase = baseId => {
  console.log('setting base', baseId)
  return {
    getAll: getAll(baseId),
    update: update(baseId)
  }
}

module.exports = {
  setBase,
  idHandler
}
