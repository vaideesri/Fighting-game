// Set up canvas and context
const canvas = document.getElementById('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

// Set up images
const player = new Sprite({
  position:{
    x:0,
    y:0
  },
  velocity:{
    x:0,
    y:0
  },
  offset:{
    x:0,
    y:0
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
});


const enemy = new Sprite({
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
});


const background = new Sprite({
  position: {
    x: 0,
    y: 0,
    
  },

  imagesrc: 'background.png'});


  decreaseTimer()

  function animate() {
    window.requestAnimationFrame(animate)
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    background.update()
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
      rectangle1: player,
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

animate()

window.addEventListener('keydown', (event) => {
  if (!player.dead) {
    switch (event.key) {
      case 'd':
        keys.d.pressed = true
        player.lastKey = 'd'
        break
      case 'a':
        keys.a.pressed = true
        player.lastKey = 'a'
        break
      case 'w':
        player.velocity.y = -20
        break
      case ' ':
        player.attack()
        break
    }
  }

  if (!enemy.dead) {
    switch (event.key) {
      case 'ArrowRight':
        keys.ArrowRight.pressed = true
        enemy.lastKey = 'ArrowRight'
        break
      case 'ArrowLeft':
        keys.ArrowLeft.pressed = true
        enemy.lastKey = 'ArrowLeft'
        break
      case 'ArrowUp':
        enemy.velocity.y = -20
        break
      case 'ArrowDown':
        enemy.attack()

        break
    }
  }
})


// Set up WebSocket
const socket = new WebSocket('http://127.0.0.1:5500/');

// Set up message event listener
socket.addEventListener('message', (event) => {
  const message = JSON.parse(event.data);

  // Update game state based on message
  switch (message.type) {
    case 'player1MoveLeft':
      player1.movingLeft = message.value;
      break;
    case 'player1MoveRight':
      player1.movingRight = message.value;
      break;
    case 'player1Jump':
      if (!player1.jumping && player1.jumpCount < 2) {
        player1.jumping = true;
        player1.jumpCount++;
        player1.yVelocity = -15; // add negative y velocity to jump
      }
      break;
    case 'player1Hit':
      if (!player1.hit) {
        player1.hit = true;
        player1.hitCount = 0;
      }
      break;
    case 'player2MoveLeft':
      player2.movingLeft = message.value;
      break;
    case 'player2MoveRight':
      player2.movingRight = message.value;
      break;
    case 'player2Jump':
      if (!player2.jumping && player2.jumpCount < 2) {
        player2.jumping = true;
        player2.jumpCount++;
        player2.yVelocity = -15; // add negative y velocity to jump
      }
      break;
    case 'player2Hit':
      if (!player2.hit) {
        player2.hit = true;
        player2.hitCount = 0;
      }
      break;
  }
});

// Send message to server on keydown event
document.addEventListener('keydown', (event) => {
  switch (event.code) {
    case 'KeyA':
      socket.send(JSON.stringify({ type: 'player1MoveLeft', value: true }));
      break;
    case 'KeyD':
      socket.send(JSON.stringify({ type: 'player1MoveRight', value: true }));
      break;
    case 'KeyW':
      socket.send(JSON.stringify({ type: 'player1Jump' }));
      break;
    case 'KeyF':
      socket.send(JSON.stringify({ type: 'player1Hit' }));
      break;
    case 'ArrowLeft':
      socket.send(JSON.stringify({ type: 'player2MoveLeft', value: true }));
      break;
    case 'ArrowRight':
      socket.send(JSON.stringify({ type: 'player2MoveRight', value: true }));
      break;
    case 'ArrowUp':
      socket.send(JSON.stringify({ type: 'player2Jump' }));
      break;
    case 'Enter':
      socket.send(JSON.stringify({ type: 'player2Hit' }));
      break;
  }
});

// Send message to server on keyup event
document.addEventListener('keyup', (event) => {
  switch (event.code) {
    case 'KeyA':
      socket.send(JSON.stringify({ type: 'player1MoveLeft', value: false }));
      break;
    case 'KeyD':
      socket.send(JSON.stringify({ type: 'player1MoveRight', value: false }));
      break;
    case 'KeyF':
      socket.send(JSON.stringify({ type: 'player1Hit', value: false }));
      break;
    case 'ArrowLeft':
      socket.send(JSON.stringify({ type: 'player2MoveLeft', value: false }));
      break;
    case 'ArrowRight':
      socket.send(JSON.stringify({ type: 'player2MoveRight', value: false }));
      break;
    case 'Enter':
      socket.send(JSON.stringify({ type: 'player2Hit',}));
  }
});


