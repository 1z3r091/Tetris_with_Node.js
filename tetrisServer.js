// block array
var block_pieces = [[[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
   [[0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0]],
   [[0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 0]],
   [[0, 0, 0, 0],
    [0, 0, 1, 1],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
   [[0, 0, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 1, 1],
    [0, 0, 0, 0]],
   [[0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]],
   [[0, 1, 0, 0],
    [0, 1, 0, 0],
    [0, 1, 1, 0],
    [0, 0, 0, 0]]];

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var global = require('./global.js');

// load static files
app.use(express.static('public'));

var Player = function () {
    this.x = 3;
    this.y = 0;
    this.currentBlock = this.randomBlock();
    this.board = [];

    // game board initialize
    for (var i = 0; i < global.NUM_ROW; i++) {
        this.board[i] = [];
        for (var j = 0; j < global.NUM_COL; j++) {
            this.board[i][j] = 0;
        }
    }
};

var clients = 0;
var users = [];
var newPlayerOn = false;

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('newPlayer', function (data) {
        console.log('new player connected');
        newPlayerOn = true;
        clients++;
        users.push({
            id: socket.id,
            player: new Player(),
        });
        socket.emit('keySetting');
    });


    setInterval(function () {
        if (newPlayerOn) {
            socket.emit('drawBoard', {
                data: users[0]
            });
            if (users[0].player.isCrushed()) {
                users[0].player.saveBlockinBoard();
                users[0].player.x = 3;
                users[0].player.y = 0;
                if (users[0].player.isGameOver()) {
                    console.log('game over');
                }
                users[0].player.currentBlock = users[0].player.randomBlock();
            } else {
                users[0].player.y += 1;
                socket.emit('moveBlock', {
                    data: users[0]
                });
            }
        }
    }, 1000);

    socket.on('moveLeft', function () {
        if (!users[0].player.isCrushed())
            users[0].player.x -= 1;
        socket.emit('moveBlock');
    });

    socket.on('moveRight', function () {
        if (!users[0].player.isCrushed())
            users[0].player.x += 1;
        socket.emit('moveBlock');
    });

    socket.on('moveDown', function () {
        if (!users[0].player.isCrushed())
            users[0].player.y += 1;
        socket.emit('moveBlock');
    });

    socket.on('disconnect', function () {
        console.log('a user disconnected');
        newPlayerOn = false;
    });
});

http.listen(3002, function () {
    console.log('listening on port 3002');
});

// *******************************************************************

//* save and remove block start
Player.prototype.saveBlockinBoard = function () {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (this.currentBlock[i][j])
                this.board[i + this.y][j + this.x] = 1;
        }
    }
    this.removeFullLines();
};

Player.prototype.removeFullLines = function () {
    for (var i = global.NUM_ROW - 1; i >= 1; i--) {
        for (var j = 0; j < global.NUM_COL; j++) {
            if (this.board[i][j] == 0) {
                break;
            }
        }

        // if a line is fulll
        if (j === global.NUM_COL) {
            for (var temp_y = i; temp_y >= 1; temp_y--) {
                for (var k = 0; k < global.NUM_COL; k++) {
                    this.board[temp_y][k] = this.board[temp_y - 1][k];
                }
            }
            i++; // check the same line again
        }
    }
};
//* save and remove block end

Player.prototype.isCrushed = function () {

    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (this.currentBlock[i][j]) {
                if ((i + this.y) >= global.NUM_ROW - 1 || this.board[i + this.y + 1][j + this.x]) {
                    return true;
                } else if ((j + this.x) >= global.NUM_COL) {
                    this.x -= 1;
                    return false;
                } else if ((j + this.x) < 0) {
                    this.x += 1;
                    return false;
                }
            }
        }
    }
    return false;


};

Player.prototype.isGameOver = function () {
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
            if (this.currentBlock[i][j] && this.board[this.y + i + 1][this.x + j]) {
                return true;
            }
        }
    }
    return false;
};

Player.prototype.randomBlock = function () {
    return block_pieces[Math.floor(Math.random() * block_pieces.length)];
};
// *******************************************************************
