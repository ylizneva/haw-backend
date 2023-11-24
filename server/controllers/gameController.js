const { generateGameId } = require('../utils/gameUtils');
const { activeLobbies, lobbyData } = require('../socketEvents');
const { extractUsernameFromJwt } = require('../utils/jwtUtils');
const https = require('https')

function hostGame(req, res) {

    const token = req.cookies.jwt;
    const username = extractUsernameFromJwt(token);

    if (!username) {
        return res.status(401).json({ message: 'Error verifying JWT' });
    }

    for (const lobby of activeLobbies.values()) {
        if (lobby.host === username) {
            return res.status(400).json({ message: 'User is already hosting a lobby' });
        }
    }

    const gameId = generateGameId();
    const gameChoice = req.body.gameChoice;

    activeLobbies.set(gameId, { host: username, gameChoice: gameChoice, players: [username] });
    console.log(`User ${username} hosted game ${gameId} with the choice ${gameChoice}`);
    console.log(activeLobbies);
    res.status(200).json({ gameId: gameId, username: username, message: 'hostGameSuccess' });
}

function joinGame(req, res) {

    const token = req.cookies.jwt;
    const username = extractUsernameFromJwt(token);

    if (!username) {
        return res.status(401).json({ message: 'Error verifying JWT' });
    }

    const gameId = req.body.gameId;

    if (!gameId) {
        return res.status(400).json({ message: 'Game ID is required to join a game' });
    }

    const lobby = activeLobbies.get(gameId);

    if (!lobby) {
        return res.status(404).json({ message: `Game with ID: ${gameId} not found` });
    }

    const isUserInGame = lobby.players.includes(username) || lobby.host === username;

    if (isUserInGame) {
        return res.status(400).json({ message: 'User is already in the game' });
    }

    lobby.players.push(username);
    console.log(activeLobbies);
    activeLobbies.set(gameId, lobby);

    res.status(200).json({ gameId: gameId, username: username, message: 'joinGameSuccess' });
}


function closeLobby(req, res) {

    const token = req.cookies.jwt;
    const username = extractUsernameFromJwt(token);

    if (!username) {
        return res.status(401).json({ message: 'Error verifying JWT' });
    }

    const gameId = req.body.gameId;

    if (!activeLobbies.has(gameId)) {
        return res.status(404).json({ message: `Game with ID: ${gameId} not found` });
    }

    const lobby = activeLobbies.get(gameId);

    if (lobby.host !== username) {
        return res.status(403).json({ message: 'You are not the host of this lobby' });
    }

    activeLobbies.delete(gameId);
    console.log(activeLobbies);

    res.status(200).json({ message: 'closeLobbySuccess' });
}

function leaveGame(req, res) {

    const token = req.cookies.jwt;
    const username = extractUsernameFromJwt(token);

    if (!username) {
        return res.status(401).json({ message: 'Error verifying JWT' });
    }

    const gameId = req.body.gameId;

    if (!activeLobbies.has(gameId)) {
        return res.status(404).json({ message: `Game with ID: ${gameId} not found` });
    }

    const lobby = activeLobbies.get(gameId);

    if (lobby.host === username) {
        return res.status(400).json({ message: 'Host cannot leave the game using this endpoint' });
    }

    if (!lobby.players.includes(username)) {
        return res.status(400).json({ message: 'User is not in the game' });
    }

    lobby.players = lobby.players.filter(player => player !== username);
    activeLobbies.set(gameId, lobby);
    console.log(activeLobbies);

    res.status(200).json({ message: 'leaveGameSuccess' });
}

function startGame(req, res) {

    const token = req.cookies.jwt;
    const username = extractUsernameFromJwt(token);
    const gameId = req.query.gameId

    if (!username) {
        return res.status(401).json({ message: 'Error verifying JWT' });
    }

    if (!activeLobbies.has(gameId)) {
        return res.status(404).json({ message: `Game with ID: ${gameId} not found` });
    }

    const lobby = activeLobbies.get(gameId);

    if (lobby.host !== username) {
        return res.status(400).json({ message: 'Non host player cannot start the game' });
    }

    if (!lobby.players.includes(username)) {
        return res.status(400).json({ message: 'User is not in the game' });
    }

    // Do stuff
    console.log(activeLobbies);

    var country = ''
    if(lobby.gameChoice === 'SpyQ') {
        const options = {
            hostname: 'restcountries.com',
            path: '/v3.1/region/europe',
            method: 'GET',
          };
        
          const request = https.request(options, (response) => {
            let data = '';
        
            // A chunk of data has been received.
            response.on('data', (chunk) => {
                    data += chunk;
            });
        
            // The whole response has been received.
            response.on('end', () => {
            try {
                // Parse the data into a JavaScript object
                const jsonData = JSON.parse(data)
                const randomIndex = Math.floor(Math.random() * jsonData.length);
                countryField = jsonData[randomIndex].name
                country = countryField.common

                // Spy game logic
                const spyIndex = Math.floor(Math.random() * lobby.players.length);
                const spyName = lobby.players[spyIndex]
                lobbyData.set(gameId, { players: lobby.players, gameData: { spyName, country } } );

                res.status(200).json({ message: 'startGameSuccess' });
                } catch (error) {
                    console.error('Error parsing JSON:', error.message);
                }
            });
          });
        
          // Handle errors
          request.on('error', (error) => {
            console.error('Error making request:', error.message);
            response.status(500).send('Internal Server Error');
          });
        
          // End the request
          request.end();
    }
}

function getGameData(req, res) {

    const token = req.cookies.jwt;
    const username = extractUsernameFromJwt(token);
    const gameId = req.query.gameId

    if (!username) {
        return res.status(401).json({ message: 'Error verifying JWT' });
    }

    if (!activeLobbies.has(gameId)) {
        return res.status(404).json({ message: `Game with ID: ${gameId} not found` });
    }

    const lobby = activeLobbies.get(gameId);

    if (!lobby.players.includes(username)) {
        return res.status(400).json({ message: 'User is not in the game' });
    }

    // Do stuff
    console.log(activeLobbies);
    res.status(200).json({ message: 'getGameDataSuccess', data: lobby });
}

module.exports = {
    hostGame,
    joinGame,
    closeLobby,
    leaveGame,
    startGame,
    getGameData
};
