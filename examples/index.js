'use strict'

const db = require('../')

async function run () {
  const config = {
    database: process.env.DB_NAME || 'sens',
    username: process.env.DB_USER || 'sens',
    password: process.env.DB_PASS || 'sense',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres'
  }

  const { Agent, Metric } = await db(config).catch(handleFatalError)

  const agent = await Agent.createOrUpdate({
    uuid: 'xxx-xxx-xxx',
    name: 'test',
    username: 'test',
    hostname: 'test-host',
    pid: 1,
    connected: true
  }).catch(handleFatalError)

  console.log('--agent--')
  console.log(agent)

  const agents = await Agent.findAll().catch(handleFatalError)

  console.log('--agents--')
  console.log(agents)

  const metric = await Metric.create(agent.uuid, {
    type: 'memory',
    value: '300'
  }).catch(handleFatalError)

  console.log('--metric--')
  console.log(metric)

  const metrics = await Metric.findByAgentUuid(agent.uuid).catch(handleFatalError)

  console.log('--metrics--')
  console.log(metrics)

  const metricsBytype = await Metric.findByTypeAgentUuid('memory', agent.uuid).catch(handleFatalError)

  console.log('--metricsBytype--')
  console.log(metricsBytype)
}

function handleFatalError (err) {
  console.error(err.message)
  console.error(err.stack)
  process.exit(1)
}

run()
