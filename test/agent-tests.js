'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const agentFixtures = require('./fixtures/agent')

let MetricStub = {
  belongsTo: sinon.spy()
}

let single = Object.assign({}, agentFixtures.single)
let id = 1
let AgentStub = null
let db = null
let uuid = 'yyy-yyy-yyy'
let username = 'mortem'
let sandbox = null
let config = {
  logging: function () {}
}
let uuidArgs = {
  where: {
    uuid
  }
}
let usernameArgs = {
  where: {
    username: 'mortem',
    connected: true
  }
}
let connectedArgs = {
  where: {
    connected: true
  }
}
let newAgent = {
  uuid: '123-123-123',
  name: 'test',
  username: 'test',
  hostname: 'test',
  pid: 0,
  connected: false
}
test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  AgentStub = {
    hasMany: sandbox.spy()
  }
  // eslint-disable-next-line
  // Model findOne Stub
  AgentStub.findOne = sandbox.stub()
  AgentStub.findOne.withArgs(uuidArgs).returns(Promise.resolve(agentFixtures.findByUuid(uuid)))

  // eslint-disable-next-line
  // Model update Stub
  AgentStub.update = sandbox.stub()
  AgentStub.update.withArgs(single, uuidArgs).returns(Promise.resolve(single))

  // eslint-disable-next-line
  // Model findById Stup
  AgentStub.findById = sandbox.stub()
  AgentStub.findById.withArgs(id).returns(Promise.resolve(agentFixtures.findById(id)))

  // eslint-disable-next-line
  // Model create Stub
  AgentStub.create = sandbox.stub()
  AgentStub.create.withArgs(newAgent).returns(Promise.resolve({
    toJSON () { return newAgent }
  }))

  // eslint-disable-next-line
  // Model findAll Stup
  AgentStub.findAll = sandbox.stub()
  AgentStub.findAll.withArgs().returns(Promise.resolve(agentFixtures.all))
  AgentStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(agentFixtures.mortem))
  AgentStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(agentFixtures.connected))

  const setupDatabase = proxyquire('../', {
    './models/agent': () => AgentStub,
    './models/metric': () => MetricStub
  })
  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sinon.resetHistory()
})

test('Agent', t => {
  t.truthy(db.Agent, 'Agent service shuld exist ')
})

test.serial('Setup DB', t => {
  t.true(AgentStub.hasMany.called, 'AgentModel.hasMany was executed')
  t.true(AgentStub.hasMany.calledWith(MetricStub), 'Argument should be the MetricModel')
  t.true(MetricStub.belongsTo.called, 'MetricModel.belongsTo was executed')
  t.true(MetricStub.belongsTo.calledWith(AgentStub), 'Argument should be the AgentModel')
})

test.serial('Agent#findById', async t => {
  let agent = await db.Agent.findById(id)

  t.true(AgentStub.findById.called, 'findById should be called on model')
  t.true(AgentStub.findById.calledOnce, 'findById should be called once')
  t.true(AgentStub.findById.calledWith(id), 'findById should be called with specified id')

  t.deepEqual(agent, agentFixtures.findById(id), 'should be the same')
})

test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called once')
  t.true(AgentStub.findOne.calledWith(uuidArgs), 'findOne should be called with specified uuid')

  t.deepEqual(agent, single, 'should be the same')
})

test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername(username)

  t.true(AgentStub.findAll.called, 'findAll should be called on model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called once')
  t.true(AgentStub.findAll.calledWith(usernameArgs), 'findAll should be called with specified usernameArgs')

  t.is(agents.length, agentFixtures.mortem.length, 'should be the same amount')
  t.deepEqual(agents, agentFixtures.mortem, 'should be the same')
})

test.serial('Agent#findAll', async t => {
  let agent = await db.Agent.findAll()

  t.true(AgentStub.findAll.called, 'findAll should called on Model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called twice')
  t.true(AgentStub.findAll.calledWith(), 'findAll should be with uuidArgs')

  t.is(agent.length, agentFixtures.all.length, 'agent should be the same amount')
  t.deepEqual(agent, agentFixtures.all, 'agent should be the same')
})

test.serial('Agent#findConnected', async t => {
  let agent = await db.Agent.findConnected()

  t.true(AgentStub.findAll.called, 'findAll should called on Model')
  t.true(AgentStub.findAll.calledOnce, 'findAll should be called twice')
  t.true(AgentStub.findAll.calledWith(connectedArgs), 'findAll should be with uuidArgs')

  t.is(agent.length, agentFixtures.connected.length, 'agent should be the same amount')
  t.deepEqual(agent, agentFixtures.connected, 'agent should be the same')
})

test.serial('Agent#createOrUpdate -  new', async t => {
  let agent = await db.Agent.createOrUpdate(newAgent)

  t.true(AgentStub.findOne.called, 'findOne shouldbe called on Model')
  t.true(AgentStub.findOne.calledOnce, 'findOne should be called twice')
  t.true(AgentStub.findOne.calledWith({
    where: {
      uuid: newAgent.uuid
    }
  }), 'findOne should be with uuid args')

  t.true(AgentStub.create.called, 'update shouldbe called on Model')
  t.true(AgentStub.create.calledOnce, 'update shouldbe called once')
  t.true(AgentStub.create.calledWith(newAgent), 'update should be with newAgent')

  t.deepEqual(agent, newAgent, 'agent should be the same')
})

test.serial('Agent#createOrUpdate - exists', async t => {
  let agent = await db.Agent.createOrUpdate(single)

  t.true(AgentStub.findOne.called, 'findOne should be called on model')
  t.true(AgentStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(AgentStub.update.calledOnce, 'update should be called once')

  t.deepEqual(agent, single, 'Agent should be the same')
})
