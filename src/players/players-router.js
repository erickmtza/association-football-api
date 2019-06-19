const express = require('express');
const xss = require('xss');
const PlayersService = require('./players-service');
const { requireAuth } = require('../middleware/jwt-auth')
const path = require('path');

const playersRouter = express.Router();
const jsonParser = express.json();

const serializePlayer = player => ({
    ...player,
    name: xss(player.name),
    img: xss(player.img),
})

playersRouter
    .route('/players')
    .get(requireAuth, (req, res, next) => {

        const user_id = req.user.id

        const knexInstance = req.app.get('db');
        PlayersService.getPlayersForUser(knexInstance, user_id)
            .then(players => {
                res.json(players.map(player => serializePlayer(player)))
            })
            .catch(err => {
                next(err);
            });
    })
    .post(requireAuth, jsonParser, (req, res, next) => {
        const { name, img, att, def, spd, pos } = req.body
        const newPlayer = { name, att, def, spd, pos }

        for (const [key, value] of Object.entries(newPlayer)) {
            if (value == null) {
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })
            }
        }

        newPlayer.img = img
        newPlayer.user_id = req.user.id

        PlayersService.insertPlayer(req.app.get('db'), newPlayer)
            .then(player => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl + `/${player.id}`)) // req.originalUrl contains a string of the full request URL of request
                    .json(player)
            })
            .catch(next)
    })

playersRouter
.route('/players/:player_id')
.all((req, res, next) => {
    PlayersService.getById(req.app.get('db'), req.params.player_id )
    .then(player => {
        if (!player) {
            return res.status(404).json({
                error: { message: `player doesn't exist` }
            })
        }
        res.player = player // save the player for the next middleware
        next() // don't forget to call next so the next middleware happens!
    })
    .catch(next)
})
.get((req, res, next) => {
    // res.json(res.player)
    const knexInstance = req.app.get('db')
    PlayersService.getById(knexInstance, req.params.player_id)
        .then(player => {
            if (!player) {
                return res.status(404).json({
                    error: { message: `player doesn't exist` }
            })
        }
        res.json(serializePlayer(player))
    })
    .catch(next)
})
.delete((req, res, next) => {
    PlayersService.deletePlayer(req.app.get('db'), req.params.player_id )
        .then(() => {
            res.status(204).end()
        })
        .catch(next)
})
.patch(jsonParser, (req, res, next) => {
    const { name, img, att, def, spd, pos } = req.body
    const playerToUpdate = { name, img, att, def, spd, pos }

    for (const [key, value] of Object.entries(playerToUpdate)) {
        if (value == null) {
            return res.status(400).json({
                error: { message: `Missing '${key}' in request body` }
            })
        }
    }

    PlayersService.updatePlayer(req.app.get('db'), req.params.player_id, playerToUpdate)
        .then(numRowsAffected => {
            res.status(204).end()
        })
        .catch(next)
})

module.exports = playersRouter