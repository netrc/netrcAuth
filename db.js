
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

const setBase = baseId => {
  console.log('setting base', baseId)
  return {
    getAll: getAll(baseId),
    update: update(baseId)
  }
}

module.exports = {
  setBase
}
