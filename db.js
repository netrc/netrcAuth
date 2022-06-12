
const AIRTABLE_APIKEY = process.env.AIRTABLE_APIKEY
if (!AIRTABLE_APIKEY) {
  console.error('cant find AIRTABLE_APIKEY')
  process.exit(1)
}

const Airtable = require('airtable')

const getAll = base => async t => {
  const records = await base(t).select().all()   // console.dir(records[1])
  const d = {}
  records.forEach( r => {d[r.id] = r.fields} ) // convert array to object
  return d
}

const update = base => async (t,v) => {
  const r = await base('users').update( v.id, v.fields, function(err, records) {
    if (err) {
      console.error(err)
    }
  })
  console.log('base update - after await')
}

const setBase = baseId => {
  console.log('setting base', baseId)
  const base = new Airtable({ apiKey: AIRTABLE_APIKEY }).base(baseId)
  return {
    getAll: getAll(base),
    update: update(base)
  }
}

module.exports = {
  setBase
}
