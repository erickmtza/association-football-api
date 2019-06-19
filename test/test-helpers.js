const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      teamname: 'Test user 1',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      teamname: 'Test user 2',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      teamname: 'Test user 3',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      teamname: 'Test user 4',
      password: 'password',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeAPlayersArray(users) {
    return [
        {
            id: 1,
            name: "First test post!",
            pos: "CF",
            user_id: users[0].id,
            img: "https://specials-images.forbesimg.com/imageserve/5cfea7bb4c687b0008593c0a/416x416.jpg?background=000000&cropX1=1554&cropX2=2474&cropY1=240&cropY2=1159",
            att: 50,
            def: 50,
            spd: 50,
        },
        {
            id: 2,
            name: "Second test post!",
            pos: "CM",
            user_id: users[1].id,
            img: "https://specials-images.forbesimg.com/imageserve/5cfea7bb4c687b0008593c0a/416x416.jpg?background=000000&cropX1=1554&cropX2=2474&cropY1=240&cropY2=1159",
            att: 50,
            def: 50,
            spd: 50,
        },
        {
            id: 3,
            name: "Third test post!",
            pos: "AM",
            user_id: users[2].id,
            img: "https://specials-images.forbesimg.com/imageserve/5cfea7bb4c687b0008593c0a/416x416.jpg?background=000000&cropX1=1554&cropX2=2474&cropY1=240&cropY2=1159",
            att: 50,
            def: 50,
            spd: 50,
        },
        {
            id: 4,
            name: "Fourth test post!",
            pos: "S",
            user_id: users[3].id,
            img: "https://specials-images.forbesimg.com/imageserve/5cfea7bb4c687b0008593c0a/416x416.jpg?background=000000&cropX1=1554&cropX2=2474&cropY1=240&cropY2=1159",
            att: 50,
            def: 50,
            spd: 50,
        },
    ]
}

function makeExpectedPlayer(player) {

    return {
        id: player.id,
        pos: player.pos,
        name: player.name,
        img: player.img,
        att: player.att,
        def: player.def,
        spd: player.spd,
        user: {
            teamname: 'Test user 1',
            username: 'test-user-1'
        },
    }
}

function makeMaliciousPlayer(user) {
    const maliciousPlayer = {
        id: 1,
        pos: 'CF',
        name: 'Naughty naughty very naughty <script>alert("xss");</script>',
        user_id: user.id,
        img: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
        att: 50,
        def: 50,
        spd: 50,
    }
    const expectedPlayer = {
        id: 1,
        pos: 'CF',
        user_id: user.id,
        att: 50,
        def: 50,
        spd: 50,
        name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
        img: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    }
    return {
        maliciousPlayer,
        expectedPlayer,
    }
}

function makePlayersFixtures() {
    const testUsers = makeUsersArray()
    const testPlayers = makeAPlayersArray(testUsers)
    return { testUsers, testPlayers }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        af_players,
        af_users
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE af_players_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE af_users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('af_players_id_seq', 0)`),
        trx.raw(`SELECT setval('af_users_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('af_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('af_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedPlayersTables(db, users, players) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('af_players').insert(players)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('af_players_id_seq', ?)`,
      [players[players.length - 1].id],
    )
  })
}

function seedMaliciousPlayer(db, user, player) {
    return db
        .into('af_players')
        .insert([player])
        // .then(() =>
        //     // update the auto sequence to stay in sync
        //     db.raw(
        //         `SELECT setval('af_players_id_seq', ?)`,
        //         [player[player.length - 1].id],
        //     )
        // )
    
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeAPlayersArray,
  makeExpectedPlayer,
  makeMaliciousPlayer,

  makePlayersFixtures,
  cleanTables,
  seedPlayersTables,
  seedMaliciousPlayer,
  makeAuthHeader,

  seedUsers,
}