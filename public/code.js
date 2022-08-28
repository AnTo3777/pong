//#region //////////////////////////// INITIALIZATION ///////////////////////////

/******* variables *******/
//ball data
const ball = document.getElementById("ball");
let ballVelocityX = -4;
let ballVelocityY = 2;
let ballPositionX = 410;
let ballPositionY = 260;
let movingBall = true;

//ghost data
const ghost_ball = document.getElementById("ghost_ball");
let ghostVelocityX = 0;
let ghostVelocityY = 0;
var ghostPositionX;
var ghostPositionY;

//player data
let upArrowPressed = false;
let downArrowPressed = false;

//bot data
let defensePosition = 60;
let goMid = true;

//players
const player1 = document.getElementById("player1");
const player2 = document.getElementById("player2");
let positionPlayer1 = 100
let positionPlayer2 = 100

//other
let score = 0;
let currentPeriod = 'lobby'
let ballMovementInterval;
let playerMovementInterval;
let bouncePlayer1 = true
let sqlDatabase;
let myIndex;
let spaceBarPermission = true;
const socket = io()



/******* functions *******/

//basic functions
function getInfo(who, what) {
    return parseInt(window.getComputedStyle(document.getElementById(who)).getPropertyValue(what));
};
function changeCss(who) {
    return document.querySelector(who).style;
};
function getEl(who) {
    return document.querySelector(who);
};


//other
function hideLeaderboardButton() {
    changeCss('#leaderboardButton').border = '1px solid black';
    changeCss('#leaderboardButton').color = 'black';
    changeCss('#leaderboardButton').cursor = 'default';
    changeCss('#leaderboardButton').backgroundColor = 'black';
    getEl('#leaderboardButton').removeEventListener('click', openLeaderboardPage);
};
function displayLeaderboardButton() {
    changeCss('#leaderboardButton').border = '1px solid white';
    changeCss('#leaderboardButton').color = 'white';
    changeCss('#leaderboardButton').cursor = 'pointer';
    changeCss('#leaderboardButton').marginTop = '180px';
    getEl('#leaderboardButton').addEventListener('click', openLeaderboardPage);
};


function setDisplay() {
    changeCss('#layer1').backgroundColor = 'white';
    changeCss('#player2').backgroundColor = 'white';
    changeCss('#score').color = 'white';
    changeCss('#ball').backgroundColor = 'white';
};
function clearDisplay() {
    changeCss('#player1').backgroundColor = 'black';
    changeCss('#player2').backgroundColor = 'black';
    changeCss('#score').color = 'black';
    changeCss('#ball').backgroundColor = 'black';
};
function openLeaderboardPage() {
    window.location.href="https://ball-game-leaderboard.herokuapp.com"; 
};
function errorMessageFunction(text) {
    errorMessage.style.color = 'red';
    errorMessage.innerHTML = text;
};

//#endregion //////////////////////////////////////////////////////////////////





//#region //////////////////////// GAME LOGIC ///////////////////////

/******* start the game *******/
function startGame() {
    currentPeriod = 'game';
    spaceBarPermission = false;
    changeCss('#scoreText').color = 'black';

    changeCss('#scoreValue').top = '15px';
    changeCss('#scoreValue').fontSize = '2rem';

    changeCss('#readyText').color = 'black';

    hideLeaderboardButton()

    changeCss('#scoreValue').color = 'white';
    changeCss('#ball').backgroundColor = 'white';

    score = 0;
    document.getElementById('scoreValue').innerHTML = score;
    
    movingBall = true;
    ballVelocityX = -4;
    ballVelocityY = 2;
    ballPositionX = 410;
    ballPositionY = 260;
    positionPlayer1 = 230;
    positionPlayer2 = 230;

    ballMovementInterval = setInterval(ballMovement, 10);
    playerMovementInterval = setInterval(playerMovement, 10);

    setTimeout(() => {
        socket.emit('require-data');
    }, 200);
};


/******* end the game *******/
function endGame() {
    //init
    currentPeriod = 'end';
    spaceBarPermission = true;
    changeCss('#scoreText').color = 'white';

    changeCss('#scoreValue').top = '100px';
    changeCss('#scoreValue').fontSize = '3rem';

    changeCss('#readyText').color = 'white';
    changeCss('#readyText').marginTop = '190px';


    displayLeaderboardButton()

    changeCss('#player1').top = '230px';
    changeCss('#player2').top = '230px';

    changeCss('#ball').backgroundColor = 'transparent';

    clearInterval(ballMovementInterval);
    clearInterval(playerMovementInterval);

    //manage username
    console.log(sqlDatabase)
    if(sqlDatabase[myIndex].name == "me") {
        //setup enterName box
        const enterNameDiv = document.createElement('div');
        enterNameDiv.setAttribute('id', 'enterNameDiv');
        document.querySelector('#game').appendChild(enterNameDiv);
        const usernameMessage = document.createElement('p');
        usernameMessage.setAttribute('id', 'usernameMessage');
        usernameMessage.innerHTML = 'join the ranking';
        enterNameDiv.appendChild(usernameMessage);
        const textarea = document.createElement('input');
        textarea.setAttribute('id', 'textarea');
        textarea.setAttribute('type', 'text');
        textarea.setAttribute('placeholder', 'enter a username');
        enterNameDiv.appendChild(textarea);
        const errorMessage = document.createElement('p');
        errorMessage.setAttribute('id', 'errorMessage');
        errorMessage.innerHTML = 'xxxxxxxxxxxxxxxxxx';
        enterNameDiv.appendChild(errorMessage);
        const submit = document.createElement('input');
        submit.setAttribute('id', 'submit');
        submit.setAttribute('type', 'submit');
        submit.setAttribute('value', 'submit');
        submit.addEventListener('click', submitFunction);
        enterNameDiv.appendChild(submit);

        //other
        hideLeaderboardButton()
        spaceBarPermission = false;
    };

    //check new high score
    if(score > sqlDatabase[myIndex].score) {
        socket.emit('set-new-highscore', [score, uid]);
    };
};


/******* manage ball movement *******/
function ballMovement() {
    if(movingBall){

        /******* init data *******/
        boxHeigth = getInfo('game', 'height');
        boxWidth = getInfo('game', 'width');
    
    
        /******* bounces, collisons *******/
        //bottom bounce
        if(ballPositionY >= boxHeigth - getInfo('ball', 'width')){
            ballPositionY = boxHeigth - getInfo('ball', 'width');
            ballVelocityY = -1 * ballVelocityY;
        };
        //ghost bottom bounce
        if(ghostPositionY >= boxHeigth - getInfo('ghost_ball', 'width')){
            ghostPositionY = boxHeigth - getInfo('ghost_ball', 'width');
            ghostVelocityY = -1 * ghostVelocityY;
        };
        //player top bounce
        if(ballPositionY <= 0){
            ballPositionY = 0;
            ballVelocityY = -1 * ballVelocityY;
        };
        //ghost top bounce
        if(ghostPositionY <= 0){
            ghostPositionY = 0;
            ghostVelocityY = -1 * ghostVelocityY;
        };
        //right collision
        if(ballPositionX >= boxWidth - getInfo('ball', 'width')){
            movingBall = false;
            endGame();
        };
        //left collison
        if(ballPositionX <= 0){
            movingBall = false;
            endGame();
        };


        /******* return of player 1 *******/
        if((ballPositionX <= 10 + getInfo('player1', 'width')) && ((ballPositionY <= positionPlayer1+ getInfo("player1", "height")) && (ballPositionY + getInfo("ball", "width") >= positionPlayer1)) && (bouncePlayer1)) {
            //Yvariation
            const Yvariation = Math.round((0.25 - (Math.random()/2))*100)/100
            ballVelocityX -= 0.5;
            if(ballVelocityY < 0) {
                ballVelocityY -= 0.3;
            } else {
                ballVelocityY += 0.3;
            };

            //bounce
            ballVelocityY = ballVelocityY + Yvariation;
            ballVelocityX = - ballVelocityX;

            //setup ghost
            ghostPositionX = ballPositionX;
            ghostPositionY = ballPositionY;
            ghostVelocityY = Math.round(3 * ballVelocityY * 100) / 100;
            ghostVelocityX = 3 * ballVelocityX;

            //manage score
            score++;
            document.getElementById('scoreValue').innerHTML = score;

            //manage +10 score bug
            bouncePlayer1 = false;
            setTimeout(() => {
                bouncePlayer1 = true;
            },500);
        };


        /******* return of player 2 *******/
        if((ballPositionX + getInfo("ball", "width") >= boxWidth - 10 - getInfo('player2', 'width')) && ((ballPositionY <= positionPlayer2 + getInfo("player2", "height")) && (ballPositionY + getInfo("ball", "width") >= positionPlayer2))) {
            ballVelocityX = - ballVelocityX;
            goMid = true;
        };
    

        /******* update position *******/
        ballPositionY += ballVelocityY;
        ballPositionX += ballVelocityX;
        ball.style.top = ballPositionY + "px";
        ball.style.left = ballPositionX + "px";
        ghostPositionY += ghostVelocityY;
        ghostPositionX += ghostVelocityX;
        ghost_ball.style.top = ghostPositionY + "px";
        ghost_ball.style.left = ghostPositionX + "px";

        /******* bot defense *******/
        if(ghostPositionX >= boxWidth - getInfo('ghost_ball', 'width')){
            ghostVelocityX = 0;
            ghostVelocityY = 0;
            if(ghostPositionY < 240){
                goMid = false;
                defensePosition = ghostPositionY - getInfo('ball', 'height');
            } else if(ghostPositionY > 300){
                goMid = false;
                defensePosition = ghostPositionY - getInfo("player2", "height") + getInfo("ball","height");
            };
            ghostPositionX = 0;
            ghostPositionY = 0;
        };
    };


    /******* manage return middle player2 *******/
    if(goMid){
        if((getInfo("player2", "top") - 230 < 0) && (Math.abs(getInfo("player2", "top") - 230) >= 5)){
            positionPlayer2 += 9;
        }
        else if((getInfo("player2", "top") - 230 > 0) && (Math.abs(getInfo("player2", "top") - 230) >= 5)){
            positionPlayer2 -= 9;
        };
    }
    else{
        if((getInfo("player2", "top") - defensePosition < 0) && (Math.abs(getInfo("player2", "top") - defensePosition) >= 5)){
            positionPlayer2 += 9;
        }
        else if((getInfo("player2", "top") - defensePosition > 0)&& (Math.abs(getInfo("player2", "top") - defensePosition >= 5))){
            positionPlayer2 -= 9;
        };
    };
    player2.style.top = positionPlayer2 + 'px';
};


/******* manage player1 movement *******/
function playerMovement() {
    if(positionPlayer1 >= 450) {
        downArrowPressed = false;
    };
    if(positionPlayer1 <= 10) {
        upArrowPressed = false;
    }
    if(upArrowPressed){
        positionPlayer1 -= 7;
    };
    if(downArrowPressed){
        positionPlayer1 += 7;
    };
    player1.style.top = positionPlayer1 + 'px';
};


/******* submit button (name) *******/
function submitFunction() {
    const name = textarea.value;
    let validate = true;
    for(let i=0 ; i<sqlDatabase.length ; i++) {
        if(name == sqlDatabase[i].name) {
            validate = false;
            errorMessageFunction('username already taken');
        };
    };
    if(name.length <= 2) {
        errorMessageFunction('username too short');
    } else if (name.length >= 10) {
        errorMessageFunction('username too long');
    } else if(validate) {
        socket.emit('set-new-name', [name, uid]);
        document.querySelector('#game').removeChild(enterNameDiv);
        displayLeaderboardButton()
        spaceBarPermission = true;
    };
};

//#endregion ////////////////////////////////////////////////////////





//#region //////////////////////// SETUP ///////////////////////

/******* manage events listener *******/
getEl('button').addEventListener('click', openLeaderboardPage);
document.addEventListener('keydown',(e) => {
    if((e.keyCode == 32) && (spaceBarPermission)) {
        startGame();
    };
});

/******* get my computer id *******/
var navigator_info = window.navigator;
var screen_info = window.screen;
var uid = navigator_info.mimeTypes.length;
uid += navigator_info.userAgent.replace(/\D+/g, ''); //contains information about the browser name, version and platform.
uid += navigator_info.plugins.length;
uid += screen_info.height || '';
uid += screen_info.width || '';
uid += screen_info.pixelDepth || '';
setTimeout(() => {
    socket.emit('test-id', uid);
},200);




/******* player movement listener *******/
document.addEventListener('keydown', (e) => {
    if((e.keyCode == 90) || (e.keyCode == 38)) {
        upArrowPressed = true;

    };
    if((e.keyCode == 83) || (e.keyCode == 40)) {
        downArrowPressed = true;
    };
});
document.addEventListener('keyup', (e) => {
    if(((e.keyCode == 90) || (e.keyCode == 38)) && (true)) {
        upArrowPressed = false;
    };
    if(((e.keyCode == 83) || (e.keyCode == 40)) && (true)) {
        downArrowPressed = false;
    };
});

//#endregion ////////////////////////////////////////////////////////





//#region //////////////////////// EVENTS ///////////////////////
socket.on('send-data', data => {
    sqlDatabase = data;
});

socket.on('transfer-index', number => {
    myIndex = number
});

//#endregion ////////////////////////////////////////////////////