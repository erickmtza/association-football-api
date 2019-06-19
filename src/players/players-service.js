const PlayersService = {
    getAllPlayers(knex) {
        return knex.select('*').from('af_players')
    },
    insertPlayer(knex, newPlayer) {
        return knex
            .insert(newPlayer)
            .into('af_players')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id) {
        return knex.from('af_players').select('*').where('id', id).first()
    },
    deletePlayer(knex, id) {
        return knex('af_players')
            .where({ id }) // or .where('id', id)
            .delete()
    },
    updatePlayer(knex, id, newPlayerFields) {
        return knex('af_players')
            .where({ id })
            .update(newPlayerFields)
    },
    getPlayersForUser(db, user_id) {
        return db
            .from('af_players AS players')
            .select(
                'players.id',
                'players.img',
                'players.name',
                'players.pos',
                'players.att',
                'players.def',
                'players.spd',
                db.raw(
                    `json_strip_nulls(
                        row_to_json(
                        (SELECT tmp FROM (
                            SELECT
                            usr.teamname,
                            usr.username
                        ) tmp)
                        )
                    ) AS "user"`
                )
            )
            .where('players.user_id', user_id)
            .leftJoin(
                'af_users AS usr',
                'players.user_id',
                'usr.id',
            )
            .groupBy('players.id', 'usr.id')
        },
};

module.exports = PlayersService;