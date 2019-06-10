'use strict'

const db = require('./')
const debug = require('debug')('sens:db:setup')
async function setup () {
  const config = {
    database: process.env.DB_NAME || 'sens',
    username: process.env.DB_USER || 'sens',
    password: process.env.DB_PASS || 'sense',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: true
  }

  await db(config).catch(handleFatalError)

  console.log('Success!')
  process.exit(0)
}

function handleFatalError (err) {
  console.error(err.messege)
  console.error(err.stack)
  process.exit(1)
}

setup()
