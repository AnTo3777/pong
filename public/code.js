//#region //////////////////////////// INITIALIZATION ///////////////////////////

/******* variables *******/
//ball data
const ball = document.getElementById("ball");
let ballVelocityX = -4;
let ballVelocityY = 2;
let ballPositionX = 410;
let ballPositionY = 260;
let movingBall = true;

//ghostBot data
const ghostBallBot = document.getElementById("ghostBallBot");
let ghostBotVelocityX = 0;
let ghostBotVelocityY = 0;
var ghostBotPositionX;
var ghostBotPositionY;

//ghostPlayer data
const ghostBallPlayer = document.getElementById("ghostBallPlayer");
let ghostPlayerVelocityX = 0;
let ghostPlayerVelocityY = 0;
var ghostPlayerPositionX;
var ghostPlayerPositionY;

//player data
let upArrowPressed = false;
let downArrowPressed = false;

//bot data
let defensePosition = 60;
let goMid = true;

//players
const player = document.getElementById("player");
const bot = document.getElementById("bot");
let positionPlayer = 100
let positionBot = 100

//other
let score = 0;
let currentPeriod = 'lobby'
let ballMovementInterval;
let playerMovementInterval;
let bouncePlayer = true
let sqlDatabase;
let myIndex;
let spaceBarPermission = true;
const socket = io()
const gameBox = document.querySelector('#game')
let language = 'english';
let settingsType = 'close'
let aimAssistActivated = false

// trail
let trailIteration = 0;
const trailData = {
    trailMaxIteration : 20
};
let intervalSpeed = 10;
let trailInterval;
let trailUpdate = false



/******* functions *******/

//basic functions
function getInfo(who, what) {
    return parseInt(window.getComputedStyle(document.getElementById(who)).getPropertyValue(what));
};
function changeCss(who) {
    return document.querySelector(who).style;
};

function change_posLeft(element, input) {
    document.getElementById(element).style.left = String(input) + 'px';
};
function change_posTop(element, input) {
    document.getElementById(element).style.top = String(input) + 'px';
};
function change_pos(element, leftInput, topInput) {
    change_posLeft(element, leftInput);
    change_posTop(element, topInput);
};

function getEl(who) {
    return document.querySelector(who);
};


function setDisplay() {
    changeCss('#layer1').backgroundColor = 'white';
    changeCss('#bot').backgroundColor = 'white';
    changeCss('#score').color = 'white';
    changeCss('#ball').backgroundColor = 'white';
};
function clearDisplay() {
    changeCss('#player').backgroundColor = 'black';
    changeCss('#bot').backgroundColor = 'black';
    changeCss('#score').color = 'black';
    changeCss('#ball').backgroundColor = 'black';
};
function openLeaderboardPage() {
    window.location.href = "https://pong--leaderboard.herokuapp.com"; 
};
function createEnterNameDiv(text, placeholder) {
    spaceBarPermission = false;
    const enterNameDiv = document.createElement('div');
    enterNameDiv.setAttribute('id', 'enterNameDiv');
    document.querySelector('#game').appendChild(enterNameDiv);
    const usernameMessage = document.createElement('p');
    usernameMessage.setAttribute('id', 'usernameMessage');
    usernameMessage.innerHTML = text;
    enterNameDiv.appendChild(usernameMessage);
    const textarea = document.createElement('input');
    textarea.setAttribute('id', 'textarea');
    textarea.setAttribute('type', 'text');
    textarea.setAttribute('placeholder', placeholder);
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
}
function openSettings() {
    //animation
    changeCss('#settingsButton').transform = 'rotate(-90deg)'

    //create divs
    const changeName = document.createElement('div');
    changeName.setAttribute('id', 'changeName');
    document.querySelector('#game').appendChild(changeName);
    const changeLanguage = document.createElement('div');
    changeLanguage.setAttribute('id', 'changeLanguage');
    document.querySelector('#game').appendChild(changeLanguage);
    if(language == 'english') {
        changeLanguage.innerHTML = 'english';
        changeName.innerHTML = 'change name';
    } else {
        changeLanguage.innerHTML = 'français';
        changeName.innerHTML = 'changer nom';
    }

    //change css
    setTimeout(() => {
        changeCss('#changeName').transition = '0.5s'
        changeCss('#changeName').color = 'white'
        change_posTop('changeName', 75)
        changeCss('#changeLanguage').transition = '0.5s'
        changeCss('#changeLanguage').color = 'white'
        change_posTop('changeLanguage', 105)
    }, 1)

    getEl('#settingsButton').removeEventListener('click', openSettings);
    setTimeout(() => {
        getEl('#settingsButton').addEventListener('click', closeSettings);
        getEl('#changeName').addEventListener('click', changeNameFunction);
        getEl('#changeLanguage').addEventListener('click', changeLanguageFunction);
    }, 600)

    settingsType = 'open'

}
function closeSettings() {
    //animation
    changeCss('#settingsButton').transform = 'rotate(0deg)'

    //change css
    setTimeout(() => {
        changeCss('#changeName').color = 'black'
        change_posTop('changeName', 20)
        changeCss('#changeLanguage').color = 'black'
        change_posTop('changeLanguage', 20)
    }, 1)

    //remove divs
    setTimeout(()=> {
        gameBox.removeChild(document.getElementById('changeName'))
        gameBox.removeChild(document.getElementById('changeLanguage'))
        getEl('#settingsButton').addEventListener('click', openSettings);
    }, 600)
    getEl('#settingsButton').removeEventListener('click', closeSettings);

    settingsType = 'close'
}

function changeNameFunction() {
    createEnterNameDiv('enter a new name', '')
};
function changeLanguageFunction() {
    if(language == 'english') {
        getEl('#highScoreText').innerHTML =`meilleur score : ${sqlDatabase[myIndex].score}`;
        getEl('#readyText').innerHTML = 'clique pour commencer';
        getEl('#leaderboardButton').innerHTML = 'classements';
        changeCss('#changeName').transition = '0s'
        changeCss('#changeName').width = '160px'
        setTimeout(() => {
            changeCss('#changeName').transition = '0.5s'
        }, 10)
        getEl('#changeName').innerHTML = 'changer nom'
        getEl('#changeLanguage').innerHTML = 'français'
        language = 'french'
        socket.emit('set-new-language', ['french', uid]);
    } else {
        getEl('#highScoreText').innerHTML =`high score : ${sqlDatabase[myIndex].score}`;
        getEl('#readyText').innerHTML = 'press to start';
        getEl('#leaderboardButton').innerHTML = 'leaderboard';
        changeCss('#changeName').transition = '0s'
        changeCss('#changeName').width = '130px'
        setTimeout(() => {
            changeCss('#changeName').transition = '0.5s'
        }, 10)
        getEl('#changeName').innerHTML = 'change name'
        getEl('#changeLanguage').innerHTML = 'english'
        language = 'english'
        socket.emit('set-new-language', ['english', uid]);
    }
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
    trailUpdate = true
    trailInterval = setInterval(createTrail, 10)

    changeCss('#readyText').color = 'black'

    change_posTop('settingsButton', -100)
    document.getElementById('highScoreText').style.marginTop = '-600px'

    changeCss('#scoreValue').top = '15px';
    changeCss('#scoreValue').fontSize = '4rem';

    changeCss('#ball').backgroundColor = 'white';

    score = 0;
    document.getElementById('scoreValue').innerHTML = score;
    
    movingBall = true;
    ballVelocityX = -4;
    ballVelocityY = 2;
    ballPositionX = 410;
    ballPositionY = 260;
    positionPlayer = 230;
    positionBot = 230;

    ballMovementInterval = setInterval(ballMovement, 10);
    playerMovementInterval = setInterval(playerMovement, 10);

    if(settingsType == 'open') {
        console.log('hello')
        closeSettings()
    }
    setTimeout(() => {
        socket.emit('require-data');
    }, 200);
};


/******* end the game *******/
function endGame() {
    //init
    currentPeriod = 'end';
    setTimeout(() => {
        spaceBarPermission = true;
    }, 1000)

    intervalSpeed = 10;
    trailUpdate = false
    

    clearInterval(trailInterval)

    changeCss('#scoreValue').top = '200px';
    changeCss('#scoreValue').fontSize = '7rem';

    change_posTop('settingsButton', 10)
    document.getElementById('highScoreText').style.marginTop = '20px'


    document.getElementById('player').style.transition = '1s'
    document.getElementById('bot').style.transition = '1s'
    changeCss('#player').top = '230px';
    changeCss('#bot').top = '230px';
    setTimeout(() => {
        document.getElementById('player').style.transition = '0s'
        document.getElementById('bot').style.transition = '0s'
    }, 1100)


    //changeCss('#ball').backgroundColor = 'transparent';

    clearInterval(ballMovementInterval);
    clearInterval(playerMovementInterval);

    //manage username
    if(sqlDatabase[myIndex].name == "me") {
        //setup enterName box

        setTimeout(() => {
        createEnterNameDiv('join the ranking', 'enter a username')
        }, 1500)


        //other
        spaceBarPermission = false;
        //remove event leadebord shop
    };

    //check new high score
    if(score > sqlDatabase[myIndex].score) {
        socket.emit('set-new-highscore', [score, uid]);

        setTimeout(() => {
            socket.emit('require-data');
        }, 200);
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
        if(ghostBotPositionY >= boxHeigth - getInfo('ghostBallBot', 'width')){
            ghostBotPositionY = boxHeigth - getInfo('ghostBallBot', 'width');
            ghostBotVelocityY = -1 * ghostBotVelocityY;
        };
        if(ghostPlayerPositionY >= boxHeigth - getInfo('ghostBallPlayer', 'width')){
            ghostPlayerPositionY = boxHeigth - getInfo('ghostBallPlayer', 'width');
            ghostPlayerVelocityY = -1 * ghostPlayerVelocityY;
        };

        //top bounce
        if(ballPositionY <= 0){
            ballPositionY = 0;
            ballVelocityY = -1 * ballVelocityY;
        };
        if(ghostBotPositionY <= 0){
            ghostBotPositionY = 0;
            ghostBotVelocityY = -1 * ghostBotVelocityY;
        };
        if(ghostPlayerPositionY <= 0){
            ghostPlayerPositionY = 0;
            ghostPlayerVelocityY = -1 * ghostPlayerVelocityY;
        };

        //left collison
        if(ballPositionX <= -500){
            movingBall = false;
            endGame();
        };


        //(ballPositionX <= 10 + getInfo('player', 'width')) && ((ballPositionY <= positionPlayer+ getInfo("player", "height")) && (ballPositionY + getInfo("ball", "width") >= positionPlayer)) && (bouncePlayer)


        //&& ((ballPositionY <= positionPlayer+ getInfo("player", "height")))

        /******* return of player 1 *******/
        if ((ballPositionX >= 0) && (ballPositionX <= 10 + getInfo('player', 'width')) && ((ballPositionY <= positionPlayer+ getInfo("player", "height")) && (ballPositionY + getInfo("ball", "width") >= positionPlayer)) && (bouncePlayer)) {
            //Yvariation
            const Yvariation = Math.round((0.25 - (Math.random()/2))*100)/100
            ballVelocityX -= 0.5;
            if(score >= 40) {
                if(ballVelocityY < 0) {
                    ballVelocityY -= 0.1;
                } else {
                    ballVelocityY += 0.1;
                };
            } else if(score >= 20) {
                if(ballVelocityY < 0) {
                    ballVelocityY -= 0.2;
                } else {
                    ballVelocityY += 0.2;
                };
            } else {
                if(ballVelocityY < 0) {
                    ballVelocityY -= 0.3;
                } else {
                    ballVelocityY += 0.3;
                };
            }


            //bounce
            ballVelocityY = ballVelocityY + Yvariation;
            ballVelocityX = - ballVelocityX;

            //setup bot ghost
            ghostBotPositionX = ballPositionX;
            ghostBotPositionY = ballPositionY;
            ghostBotVelocityY = Math.round(3 * ballVelocityY * 100) / 100;
            ghostBotVelocityX = 3 * ballVelocityX;

            // remove aim assist 
            aimAssistActivated = false
            ghostPlayerPositionX = 2;
            ghostPlayerPositionY = 25;

            //manage score
            score++;
            document.getElementById('scoreValue').innerHTML = score;

            //manage +10 score bug
            bouncePlayer = false;
            setTimeout(() => {
                bouncePlayer = true;
            },500);

            if((intervalSpeed > 1) && (score > 1)) {
                intervalSpeed -= 0.5
                clearInterval(trailInterval)
                trailInterval = setInterval(createTrail, intervalSpeed)
            }
        };


        // ((ballPositionY <= positionBot + getInfo("bot", "height")) && (ballPositionY + getInfo("ball", "width") >= positionBot))

        /******* return of bot *******/
        if(ballPositionX + getInfo("ball", "width") >= boxWidth - 10 - getInfo('bot', 'width')) {
            ballVelocityX = - ballVelocityX;
            goMid = true;


            //setup player ghost
            ghostPlayerPositionX = ballPositionX;
            ghostPlayerPositionY = ballPositionY;
            ghostPlayerVelocityY = Math.round(3 * ballVelocityY * 100) / 100;
            ghostPlayerVelocityX = 3 * ballVelocityX;
        };
    

        /******* update position *******/
        ballPositionY += ballVelocityY;
        ballPositionX += ballVelocityX;
        ball.style.top = ballPositionY + "px";
        ball.style.left = ballPositionX + "px";
        ghostBotPositionY += ghostBotVelocityY;
        ghostBotPositionX += ghostBotVelocityX;
        ghostBallBot.style.top = ghostBotPositionY + "px";
        ghostBallBot.style.left = ghostBotPositionX + "px";
        ghostPlayerPositionY += ghostPlayerVelocityY;
        ghostPlayerPositionX += ghostPlayerVelocityX;
        ghostBallPlayer.style.top = ghostPlayerPositionY + "px";
        ghostBallPlayer.style.left = ghostPlayerPositionX + "px";


        /******* aim assist *******/
        if(ghostPlayerPositionX <= 0){
            ghostPlayerVelocityX = 0;
            ghostPlayerVelocityY = 0;
            aimAssistActivated = true
        };


        /******* bot defense *******/
        if(ghostBotPositionX >= boxWidth - getInfo('ghostBallBot', 'width')){
            ghostBotVelocityX = 0;
            ghostBotVelocityY = 0;
            if(ghostBotPositionY < 260){
                goMid = false;
                defensePosition = ghostBotPositionY - getInfo('ball', 'height')-20;
            } else if(ghostBotPositionY > 290){
                goMid = false;
                defensePosition = ghostBotPositionY - getInfo("bot", "height")+20 + getInfo("ball","height");
            };
            ghostBotPositionX = 0;
            ghostBotPositionY = 0;
        };
    };


    /******* manage return middle bot *******/
    if(goMid){
        if((getInfo("bot", "top") - 230 < 0) && (Math.abs(getInfo("bot", "top") - 230) >= 5)){
            positionBot += 9;
        }
        else if((getInfo("bot", "top") - 230 > 0) && (Math.abs(getInfo("bot", "top") - 230) >= 5)){
            positionBot -= 9;
        };
    }
    else{
        if(Math.abs(getInfo("bot", "top") - defensePosition) >= 5) {
            if((getInfo("bot", "top") - defensePosition < 0) && getInfo('bot', 'top') + getInfo('bot', 'height') < getInfo('game', 'height') - 5){
                positionBot += 9;
            }
            else if((getInfo("bot", "top") - defensePosition >0) && (getInfo('bot', 'top') > 5)){
                positionBot -= 9;
            };
        };

    };
    bot.style.top = positionBot + 'px';
};


// create trail
function createTrail() {
    if(trailIteration >= trailData.trailMaxIteration) {
        trailIteration = 0;
    };
    gameBox.removeChild(document.getElementById(`trail${trailIteration}`));
    const trail = document.createElement('div');
    trail.setAttribute('class', 'trail');
    trail.setAttribute('id', `trail${trailIteration}`)
    trail.style.left = String(ballPositionX + 8.5) + 'px';
    trail.style.top = ballPositionY + 'px';
    trail.style.height = '20px';
    gameBox.appendChild(trail);
    trailIteration += 1;
};

//reduce trail height
setInterval(() => {
    if(trailUpdate) {
        for(let i=0; i<trailData.trailMaxIteration ; i++) {
            const trailHeight = getInfo(`trail${i}`, 'height')
            const topPosition = getInfo(`trail${i}`, 'top')
            document.getElementById(`trail${i}`).style.height = String(trailHeight - 7) + 'px';
            document.getElementById(`trail${i}`).style.top = String(topPosition + 3.5) + 'px'
        }
    }

}, 100)


/******* manage player movement *******/
function playerMovement() {
    if(positionPlayer >= 450) {
        downArrowPressed = false;
    };
    if(positionPlayer <= 10) {
        upArrowPressed = false;
    }

    if((upArrowPressed) && (aimAssistActivated) && (positionPlayer <= ghostPlayerPositionY)){
        positionPlayer -= 6;
        console.log('slow')
    } else if ((upArrowPressed) && (aimAssistActivated) && (positionPlayer - ghostPlayerPositionY >= 100)) {
        positionPlayer -= 11;
        console.log('fast')
    } else if (upArrowPressed){
        positionPlayer -= 7;
        console.log('normal')
    }

    if((downArrowPressed) && (aimAssistActivated) && (positionPlayer + 90 >= ghostPlayerPositionY + 20)){
        positionPlayer += 6;
        console.log('slow')
    } else if ((downArrowPressed) && (aimAssistActivated) && (positionPlayer + 90 - ghostPlayerPositionY -20 <= -100)) {
        positionPlayer += 11;
        console.log('fast')
    } else if (downArrowPressed){
        positionPlayer += 7;
        console.log('normal')
    }
    player.style.top = positionPlayer + 'px';
};


/******* submit button (name) *******/
function submitFunction() {
    const name = textarea.value;
    let validate = true;
    for(let i=0 ; i<sqlDatabase.length ; i++) {
        if((name == sqlDatabase[i].name) && (uid != sqlDatabase[i].id)) {
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
        spaceBarPermission = true;
    };
};

//#endregion ////////////////////////////////////////////////////////





//#region //////////////////////// SETUP ///////////////////////

/******* manage events listener *******/

getEl('#settingsButton').addEventListener('click', openSettings);
getEl('#leaderboardButton').addEventListener('click', openLeaderboardPage);

document.addEventListener('keydown',(e) => {
    if(spaceBarPermission) {
        startGame();
    };
});

/******* get my computer id *******/
var navigator_info = window.navigator;
var screen_info = window.screen;
var uid = navigator_info.mimeTypes.length;
console.log(uid)
uid += navigator_info.userAgent.replace(/\D+/g, ''); //contains information about the browser name, version and platform.
console.log(uid)
uid += navigator_info.plugins.length;
console.log(uid)
uid += screen_info.height || '';
console.log(uid)
uid += screen_info.width || '';
console.log(uid)
uid += screen_info.pixelDepth || '';
console.log(uid)
setTimeout(() => {
    socket.emit('test-id', uid);
},200);


// get high score 
setTimeout(() => {
    socket.emit('require-data');
}, 200);

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


// setup trail (create 50 trail)
for(let i=0 ; i<trailData.trailMaxIteration ; i++) {
    const trail = document.createElement('div');
    trail.setAttribute('class', 'trail');
    trail.setAttribute('id', `trail${i}`)
    trail.style.left = String(ballPositionX + 8.5) + 'px';
    trail.style.top = ballPositionY + 'px';
    trail.style.height = '20px'
    gameBox.appendChild(trail);
}

// setup hide box position
document.getElementById("hide").style.left = (document.documentElement.scrollWidth - 850)/2 + "px"
setInterval(() => {
    document.getElementById("hide").style.left = (document.documentElement.scrollWidth - 850)/2 + "px"
}, 2000)


// remove blur on settingsButton
const input = document.getElementById("settingsButton")
input.addEventListener("click", () => input.blur());

//#endregion ////////////////////////////////////////////////////////





//#region //////////////////////// EVENTS ///////////////////////
socket.on('send-data', data => {
    sqlDatabase = data;

    //update language
    language = sqlDatabase[myIndex].language
    if(language == 'english') {
        getEl('#highScoreText').innerHTML =`high score : ${sqlDatabase[myIndex].score}`;
        getEl('#readyText').innerHTML = 'press to start';
        getEl('#leaderboardButton').innerHTML = 'leaderboard';
    } else {
        getEl('#highScoreText').innerHTML =`meilleur score : ${sqlDatabase[myIndex].score}`;
        getEl('#readyText').innerHTML = 'clique pour commencer';
        getEl('#leaderboardButton').innerHTML = 'classements';
    }



    //update high score text
    if(language == 'english') {
        getEl('#highScoreText').innerHTML = `high score : ${sqlDatabase[myIndex].score}`
    } else {
        getEl('#highScoreText').innerHTML = `meilleur score : ${sqlDatabase[myIndex].score}`
    }
});

socket.on('transfer-index', number => {
    myIndex = number
});

//#endregion ////////////////////////////////////////////////////
