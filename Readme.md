

# c3

simple cache framework (for vlcb) 

really, an auth API for write access to the db

... to run on flyio


https://github.com/Airtable/airtable.js

n.b. https://stackoverflow.com/questions/70903418/how-to-get-async-await-work-in-airtable-api-with-node-js-to-get-all-records-in-t  for .all()



## Auth

* pre: read the users table  -  need users table Key,  and secret encrypt val 
* login.... send name, and hash of pwd
* if pwd hash equals user's stored hash, then send back cookie with encrypted (jwt) token: name + roles
  * encrypted with ? local secret
* subsequent calls will send token, decrypt cookie
* for whatever calls are needed, check name/roles




## Airtable note

### alternatives
* https://www.getgrist.com/

Record looks like

{ // this is a picture record
  id: 'rec0JHggGl52XeaEv',

  fields: {
    name: '59',
    category: 'Rubbing',
    Rubbings: [ 'recjZYXJuTGgDBals' ],
    thumb: 'https://lh6.googleusercontent.com/-PFMp5DNoa-U/UFUKVpzy4EI/AAAAAAAAMmE/FNmG_-Zdn4E/s144/VLC-%252059-c.JPG',
    full: 'https://lh6.googleusercontent.com/-PFMp5DNoa-U/UFUKVpzy4EI/AAAAAAAAMmE/FNmG_-Zdn4E/s800/VLC-%252059-c.JPG'
  },

  _table: Table {
    _base: Base { _airtable: Airtable {}, _id: 'appIYeDlYOYHQjcXl' },
    id: null,
    name: 'Pictures',
    find: [Function (anonymous)],
    select: [Function: bound ],
    create: [Function (anonymous)],
    update: [Function (anonymous)],
    replace: [Function (anonymous)],
    destroy: [Function (anonymous)],
    list: [Function (anonymous)],
    forEach: [Function (anonymous)]
  },

  _rawJson: {
    id: 'rec0JHggGl52XeaEv',
    createdTime: '2021-12-15T13:08:32.000Z',
    fields: {
      category: 'Rubbing',
      thumb: 'https://lh6.googleusercontent.com/-PFMp5DNoa-U/UFUKVpzy4EI/AAAAAAAAMmE/FNmG_-Zdn4E/s144/VLC-%252059-c.JPG',
      Rubbings: [Array],
      name: '59',
      full: 'https://lh6.googleusercontent.com/-PFMp5DNoa-U/UFUKVpzy4EI/AAAAAAAAMmE/FNmG_-Zdn4E/s800/VLC-%252059-c.JPG'
    }
  },

  save: [Function (anonymous)],
  patchUpdate: [Function (anonymous)],
  putUpdate: [Function (anonymous)],
  destroy: [Function (anonymous)],
  fetch: [Function (anonymous)],
  updateFields: [Function (anonymous)],
  replaceFields: [Function (anonymous)]
}
