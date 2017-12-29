var KEY_LEFT = 37;
var KEY_RIGHT = 39;
var KEY_DOWN = 40;
var NUM_ROW = 17;
var NUM_COL = 14;
var BLOCK_LENGTH = 30;
var BLOCK_HEIGHT = 30;

var play; // save player data from the server
var socket = io();

socket.emit('newPlayer');
socket.on('keySetting', function () {
    window.addEventListener('keydown', keyHandler);
});
socket.on('drawBoard', function (data) {
    play = data.data.player;
    drawBoard(play);
});
socket.on('moveBlock', function (data) {
    play = data.data.player;
    drawBlock(play);
});




////* Keyboard input handling start
var keyHandler = function (kev) {
    if (kev.keyCode === KEY_LEFT) {
        socket.emit('moveLeft');
    } else if (kev.keyCode === KEY_RIGHT) {
        socket.emit('moveRight');
    } else if (kev.keyCode === KEY_DOWN) {

        socket.emit('moveDown');
    } else {;
    }
};
//* Keyboard input handling end

//* draw functions start
function drawBlock(player) {
    var mainDiv = document.getElementById('main');
    for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {

            var blockElement = document.createElement('div');
            if (player.currentBlock[i][j]) {
                blockElement.classList.add('blockFilled');
            }
            blockElement.style.top = (i * BLOCK_HEIGHT + player.y * BLOCK_HEIGHT) + 'px';
            blockElement.style.left = (j * BLOCK_LENGTH + player.x * BLOCK_LENGTH) + 'px';
            mainDiv.appendChild(blockElement);
        }
    }
};

function drawBoard(player) {
    var mainDiv = document.getElementById('main');
    for (var i = 0; i < NUM_ROW; i++) {
        for (var j = 0; j < NUM_COL; j++) {
            var blockElement = document.createElement('div');
            if (player.board[i][j])
                blockElement.classList.add('blockFilled');
            else
                blockElement.classList.add('blockEmpty');
            blockElement.style.top = (i * BLOCK_HEIGHT) + 'px';
            blockElement.style.left = (j * BLOCK_LENGTH) + 'px';
            mainDiv.appendChild(blockElement);

        }
    }
};
//* draw functions end
