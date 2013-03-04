
window.onload = function() {
  //// Create the canvas
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = 1200;
  canvas.height = 600;

  window.document.body.appendChild(canvas);

  //// Background image
  var bgReady = false;
  var bgImage = new Image();
  bgImage.onload = function () {
    bgReady = true;
  };
  bgImage.src = "images/background_large.jpg";

  //// Hero image
  var heroReady = false;
  var heroImage = new Image();
  heroImage.onload = function () {
    heroReady = true;
  };
  heroImage.src = "images/hero.png";

  //// Monster image
  var monsterReady = false;
  var monsterImage = new Image();
  monsterImage.onload = function () {
    monsterReady = true;
  };
  monsterImage.src = "images/speed.png";

  //// Explosion image
  var exploReady = false;
  var exploImage = new Image();
  exploImage.onload = function () {
    exploReady = true;
  };
  exploImage.src = "images/explosion.png";

  //// Game objects
  var start = true; 
  var hero = {
    speed: 256, // movement in pixels per second
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    lasers: []
  };
  var monster = {
    x: 0,
    y: 0,
    w: 1,
    h: 1,
    starthp: 1000,
    hp: 1000,
    hit: false
  };
  var monstersCaught = 0;

  //// Handle keyboard controls
  var keysDown = {};

  addEventListener("keydown", function (e) {
    keysDown[e.keyCode] = true;
  }, false);

  addEventListener("keyup", function (e) {
    delete keysDown[e.keyCode];
  }, false);

  //// Update game objects
  var update = function (modifier) {
    if (38 in keysDown) { // Player holding up
      hero.y = (hero.y > 0) ? (hero.y - hero.speed * modifier) : canvas.height - 32;
    }

    if (40 in keysDown) { // Player holding down
      hero.y = (hero.y + hero.speed * modifier) % canvas.height;
    }

    if (37 in keysDown) { // Player holding left
      hero.x = (hero.x > 0) ? (hero.x - hero.speed * modifier) : canvas.width - 32;
    }

    if (39 in keysDown) { // Player holding right
      hero.x = (hero.x + hero.speed * modifier) % canvas.width;
    }
    if (88 in keysDown) { // Player shoot
      laserD = {
        x: hero.x + 20,
        y: hero.y,
        w: 1,
        h: 10,
        power: 1,
        hit: null
      };
      laserG = {
        x: hero.x,
        y: hero.y,
        w: 1,
        h: 10,
        power: 1,
        hit: null
      };
      hero.lasers.push(laserD);
      hero.lasers.push(laserG);
    }

    // Are they touching?
    if (
      hero.x <= (monster.x + monster.w)
      && monster.x <= (hero.x + hero.w)
      && hero.y <= (monster.y + monster.h)
      && monster.y <= (hero.y + hero.h)
    ) {
      --monstersCaught;
      reset();
    }

    // Firing in his face ?
    for (var i = 0; i < hero.lasers.length; i++) {

      if (
        hero.lasers[i].x <= (monster.x + monster.w)
        && monster.x <= (hero.lasers[i].x + hero.lasers[i].w)
        && hero.lasers[i].y <= (monster.y + monster.h)
        && monster.y <= (hero.lasers[i].y + hero.lasers[i].h)
      ) {
        if (monster.hp > 0) {
          monster.hp = monster.hp - hero.lasers[i].power;
          // stop laser to continue
          hero.lasers[i].hit = true;
        }
        else {
          ++monstersCaught;
          reset();
        }
      }
    }
  };

  function drawLaser() {
    if (hero.lasers.length)
      for (var i = 0; i < hero.lasers.length; i++) {
          ctx.fillStyle = '#E33005';
          ctx.fillRect(hero.lasers[i].x,hero.lasers[i].y,hero.lasers[i].w,hero.lasers[i].h)
      }
  }
  function moveLaser() {
    for (var i = 0; i < hero.lasers.length; i++) {
      if (hero.lasers[i].hit) {
        ctx.drawImage(exploImage, hero.lasers[i].x -10, hero.lasers[i].y-10);
        ctx.drawImage(exploImage, -100, -100);
        hero.lasers.splice(i, 1);  
      }
      else {
        if (hero.lasers[i].y > -11) {
          hero.lasers[i].y -= 5;
        } 
        else if (hero.lasers[i].y < -10) {
          hero.lasers.splice(i, 1);
        }
      }
    }
  }


  //// Reset the game when the player catches a monster
  var reset = function () {
    if (start) {
      hero.x = canvas.width / 2;
      hero.y = canvas.height - (canvas.height / 4);
    }
    start = false;

    // give the monster his HP
    monster.hp = monster.starthp;

    // Throw the monster somewhere on the screen randomly
    monster.x = (Math.random() * (canvas.width - monster.w ));
    monster.y = 20 + (Math.random() * (canvas.height / 3));
  };

  //// Draw everything
  var render = function () {
    if (bgReady) {
      ctx.drawImage(bgImage, 0, 0);
    }

    if (heroReady) {
      ctx.drawImage(heroImage, hero.x, hero.y);
      hero.w = heroImage.width;
      hero.h = heroImage.height;
    }

    if (monsterReady) {
      ctx.drawImage(monsterImage, monster.x, monster.y);
      monster.w = monsterImage.width;
      monster.h = monsterImage.height;
    }
    drawLaser();
    moveLaser();

    // Enney HP
    current = monster.hp / monster.starthp;
    ctx.fillStyle = 'black';
    ctx.fillRect( monster.x, monster.y - 10, monster.w , 5 );
    ctx.fillStyle = '#FF0027';
    ctx.fillRect( monster.x, monster.y - 10, monster.w * current, 5 );
    ctx.lineWidth   = 2;
    ctx.strokeStyle = 'black';
    ctx.strokeRect(monster.x, monster.y - 10, monster.w, 5);
    ctx.stroke();
    ctx.lineWidth   = 1;
    ctx.strokeStyle = '#FF0027';
    ctx.strokeRect(monster.x, monster.y - 10, monster.w, 5);
    ctx.stroke();

    // Score
    ctx.fillStyle = "rgb(250, 250, 250)";
    ctx.font = "24px Helvetica";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText("Score : " + monstersCaught,  canvas.width - 10, 10);

  };

  //// The main game loop
  var main = function () {
    var now = Date.now();
    var delta = now - then;

    update(delta / 1000);
    render();

    then = now;
  };


  //// Let's play this game!
  reset();
  var then = Date.now();
  setInterval(main, 1); // Execute as fast as possible

}