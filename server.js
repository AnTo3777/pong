//#region //////////////////////////// INITIALIZATION ///////////////////////////

/******* variables *******/
const express = require('express');
const path = require('path');
const http = require('http');
const PORT = process.env.PORT || 4000;
const socketio = require('socket.io');
const { stringify } = require('querystring');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const mysql = require('mysql');
const { Socket } = require('engine.io');
app.use(express.static(path.join(__dirname, "public")));
server.listen(PORT);
let sqlDatabase;

const db = mysql.createPool({
    host     : 'edpg-celm11un6mpkfa5lfkb0-a',
    user     : 'pong_db_user',
    password : 'e9H1Lt6qpRsRAu0ojsNVMvdXRtsQk62Q',
    database : 'pong_db'
});


/******* functions *******/
function getDatabase() {
    let query = db.query('SELECT * FROM data ORDER BY - score;', (err, results) => {
        if(err) throw err;
        sqlDatabase = results;
    });
};


//#endregion //////////////////////////////////////////////////////////////////



io.on('connection', socket => {

    //get the database
    getDatabase();


    //#region //////////////////////////// EVENTS ///////////////////////////

    /******* test-id *******/
    socket.on('test-id', uid => {
        let createNewData = true
        for(let i=0 ; i<sqlDatabase.length ; i++) {
            if(sqlDatabase[i].id == uid) {
                createNewData = false;
                socket.emit('transfer-index', i)
            };
        };
        if(createNewData) {
            db.query(`INSERT into data VALUES("${uid}", "me", 0, 'english')`);
            socket.emit('transfer-index', sqlDatabase.length);
        };
        setTimeout(getDatabase, 200);
    });

    /******* require-data *******/
    socket.on('require-data', () => {
        getDatabase()
        setTimeout(() => {
            socket.emit('send-data', sqlDatabase);
        },100);
    });

    /******* set-new-highscore *******/
    socket.on('set-new-highscore', array => {
        const score = array[0];
        const uid = array[1];
        db.query(`UPDATE data SET score = ${score} WHERE id = "${uid}"`);
    });

    socket.on('set-new-language', array => {
        const language = array[0];
        const uid = array[1];
        db.query(`UPDATE data SET language = "${language}" WHERE id = "${uid}"`);
    });

    /******* set-new-name *******/
    socket.on('set-new-name', array => {
        const name = array[0];
        const uid = array[1];
        db.query(`UPDATE data SET name = "${name}" WHERE id = "${uid}"`);
    });

    //#endregion //////////////////////////////////////////////////////////////////
});