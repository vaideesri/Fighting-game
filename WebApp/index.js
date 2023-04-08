
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d');
const newGameDialog = document.getElementById('newGameDialog');
const startGameDialog = document.getElementById("startGameDialog");

const dialogContext = document.getElementById('dialogContext');

const dialogButton = document.getElementById('dialogButton');

const queryParams = new URLSearchParams(window.location.search);
const Player = queryParams.get('cid') ? {
    clientID: queryParams.get('cid'),
    type: 'Player 2'
} : {
    clientID: 'abc',
    type: 'Player 1'
};



canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
    position: {
        x: 0,
        y: 0,

    },
    imageSrc: './img/background.png'
})

const shop = new Sprite({
    position: {
        x: 600,
        y: 128
    },
    imageSrc: './img/shop.png',
    scale: 2.75,
    framesMax: 0
})

const player = new Fighter({
    position: {
        x: 0,
        y: 0
    },
    velocity: {
        x: 0,
        y: 0
    },
    offset: {
        x: 0,
        y: 0
    },
    imageSrc: './img/samuraiMack/Idle.png',
    framesMax: 8,
    scale: 2.5,
    offset: {
        x: 215,
        y: 157
    },
    sprites: {
        idle: {
            imageSrc: './img/samuraiMack/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/samuraiMack/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/samuraiMack/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/samuraiMack/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/samuraiMack/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/samuraiMack/Take Hit - white silhouette.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/samuraiMack/Death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset: {
            x: 100,
            y: 50
        },
        width: 160,
        height: 50
    }
})

const enemy = new Fighter({
    position: {
        x: 850,
        y: 100
    },
    velocity: {
        x: 0,
        y: 0
    },
    color: 'blue',
    offset: {
        x: -50,
        y: 0
    },
    imageSrc: './img/kenji/Idle.png',
    framesMax: 4,
    scale: 2.5,
    offset: {
        x: 215,
        y: 167
    },
    sprites: {
        idle: {
            imageSrc: './img/kenji/Idle.png',
            framesMax: 8
        },
        run: {
            imageSrc: './img/kenji/Run.png',
            framesMax: 8
        },
        jump: {
            imageSrc: './img/kenji/Jump.png',
            framesMax: 2
        },
        fall: {
            imageSrc: './img/kenji/Fall.png',
            framesMax: 2
        },
        attack1: {
            imageSrc: './img/kenji/Attack1.png',
            framesMax: 6
        },
        takeHit: {
            imageSrc: './img/kenji/Take hit.png',
            framesMax: 4
        },
        death: {
            imageSrc: './img/kenji/Death.png',
            framesMax: 6
        }
    },
    attackBox: {
        offset: {
            x: -170,
            y: 50
        },
        width: 170,
        height: 50
    }
})

console.log(player)

const keys = {
    a: {
        pressed: false
    },
    d: {
        pressed: false
    },
    ArrowRight: {
        pressed: false
    },
    ArrowLeft: {
        pressed: false
    }
}





function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
    shop.update()
    c.fillStyle = 'rgba(255, 255, 255, 0.15)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    enemy.update()

    player.velocity.x = 0
    enemy.velocity.x = 0

    // player movement

    if (keys.a.pressed && player.lastKey === 'a') {
        player.velocity.x = -5
        player.switchSprite('run')
    } else if (keys.d.pressed && player.lastKey === 'd') {
        player.velocity.x = 5
        player.switchSprite('run')
    } else {
        player.switchSprite('idle')
    }

    // jumping
    if (player.velocity.y < 0) {
        player.switchSprite('jump')
    } else if (player.velocity.y > 0) {
        player.switchSprite('fall')
    }

    // Enemy movement
    if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
        enemy.velocity.x = -5
        enemy.switchSprite('run')
    } else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
        enemy.velocity.x = 5
        enemy.switchSprite('run')
    } else {
        enemy.switchSprite('idle')
    }

    // jumping
    if (enemy.velocity.y < 0) {
        enemy.switchSprite('jump')
    } else if (enemy.velocity.y > 0) {
        enemy.switchSprite('fall')
    }

    // detect for collision & enemy gets hit
    if (
        rectangularCollision({
            rectangle1: player,
            rectangle2: enemy
        }) &&
        player.isAttacking &&
        player.framesCurrent === 4
    ) {
        enemy.takeHit()
        player.isAttacking = false

        gsap.to('#enemyHealth', {
            width: enemy.health + '%'
        })
    }

    // if player misses
    if (player.isAttacking && player.framesCurrent === 4) {
        player.isAttacking = false
    }

    // this is where our player gets hit
    if (
        rectangularCollision({
            rectangle1: enemy,
            rectangle2: player
        }) &&
        enemy.isAttacking &&
        enemy.framesCurrent === 2
    ) {
        player.takeHit()
        enemy.isAttacking = false

        gsap.to('#playerHealth', {
            width: player.health + '%'
        })
    }

    // if player misses
    if (enemy.isAttacking && enemy.framesCurrent === 2) {
        enemy.isAttacking = false
    }

    // end game based on health
    if (enemy.health <= 0 || player.health <= 0) {
        determineWinner({ player, enemy, timerId })
    }
}

//animate()

const socket = new WebSocket(`wss://fighting-services.onrender.com/${Player.clientID}`);

console.log('socket', socket);
// Set up message event listener
socket.addEventListener('message', (event) => {
    console.log('event', event);
    // Update game state based on message
    let movePlayer = Player.type != 'Player 1' ? player : enemy;
    switch (event.data) {
        case 'Allow Start Game':
            allowStartGame();
            break;
        case 'Start':
            startGameDialog.close();
            startGame();
            break;
        case 'ArrowRightDown':
            if (Player.type == 'Player 1') {
                keys.ArrowRight.pressed = true
                movePlayer.lastKey = 'ArrowRight'
            } else {
                keys.d.pressed = true
                movePlayer.lastKey = 'd'
            }
            break;
        case 'ArrowLeftDown':
            if (Player.type == 'Player 1') {
                keys.ArrowLeft.pressed = true
                movePlayer.lastKey = 'ArrowLeft'
            } else {
                keys.a.pressed = true
                movePlayer.lastKey = 'a'
            }
            break;

        case 'ArrowRightUp':
            if (Player.type == 'Player 1') {
                keys.ArrowRight.pressed = false
            } else {
                keys.d.pressed = false
            }
            break
        case 'ArrowLeftUp':
            if (Player.type == 'Player 1') {
                keys.ArrowLeft.pressed = false;
            } else {
                keys.a.pressed = false;
            }
            break
        case 'ArrowUpDown':
        case 'ArrowUpUp':
            movePlayer.velocity.y = -20
            break
        case 'ArrowDownUp':
        case 'ArrowDownDown':
            movePlayer.attack()

            break
    }
});


window.addEventListener('keydown', (event) => {
    let movePlayer = Player.type == 'Player 1' ? player : enemy;

    if (!movePlayer.dead) {
        switch (event.key) {
            case 'ArrowRight':
                if (Player.type != 'Player 1') {
                    keys.ArrowRight.pressed = true
                    movePlayer.lastKey = 'ArrowRight';
                } else {
                    keys.d.pressed = true
                    movePlayer.lastKey = 'd'
                }

                break
            case 'ArrowLeft':

                if (Player.type != 'Player 1') {
                    keys.ArrowLeft.pressed = true
                    movePlayer.lastKey = 'ArrowLeft'
                } else {
                    keys.a.pressed = true
                    movePlayer.lastKey = 'a'
                }
                break
            case 'ArrowUp':
                movePlayer.velocity.y = -20
                break
            case 'ArrowDown':
                movePlayer.attack()

                break
        }

        socket.send(event.key + 'Down');
    }
})

window.addEventListener('keyup', (event) => {
    // enemy keys
    switch (event.key) {
        case 'ArrowRight':
            if (Player.type != 'Player 1') {
                keys.ArrowRight.pressed = false;
            } else {
                keys.d.pressed = false;
            }
            break
        case 'ArrowLeft':
            if (Player.type != 'Player 1') {
                keys.ArrowLeft.pressed = false
            } else {
                keys.a.pressed = false;
            }
            break
    }
    socket.send(event.key + 'Up');
})


function startGame() {
    if (Player.type == 'Player 1') {
        socket.send('Start');
    }
    decreaseTimer();
    animate();
}

const newGame = function () {
    startGameDialog.showModal();
}

const loadGame = function () {
    newGameDialog.showModal();
}

const allowStartGame = function () {
    dialogContext.innerText = 'Lets Start !!!'
    dialogButton.hidden = false;
}


const startUp = function () {
    if (Player.type == 'Player 1') {
        loadGame();
    }

    if (Player.type == 'Player 2') {
        newGame();
        dialogContext.innerText = 'Please wait for player 1 to start the game';
    }


}
startUp();