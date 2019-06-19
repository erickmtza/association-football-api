const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Players Endpoints', function() {
  let db

  const {
    testUsers,
    testPlayers,
  } = helpers.makePlayersFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`GET /api/players`, () => {
    context(`Given no Players`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/players')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, [])
      })
    })

    context('Given there are Players in the database', () => {
      beforeEach('insert Players', () =>
        helpers.seedPlayersTables(
          db,
          testUsers,
          testPlayers,
        )
      )

      it('responds with 200 and all of the Players', () => {
        const expectedPlayers = [helpers.makeExpectedPlayer(testPlayers[0])]

        return supertest(app)
          .get('/api/players')
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedPlayers)
      })
    })

    context(`Given an XSS attack article`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPlayer,
        expectedPlayer,
      } = helpers.makeMaliciousPlayer(testUser)

      beforeEach('insert malicious player', () => {
        return helpers.seedMaliciousPlayer(
          db,
          testUser,
          maliciousPlayer,
        )
      })

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/players`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          .expect(200)
          .expect(res => {
            expect(res.body[0].name).to.eql(expectedPlayer.name)
            expect(res.body[0].img).to.eql(expectedPlayer.img)
          })
      })
    })
  })

})
