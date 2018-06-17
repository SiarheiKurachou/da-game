class Actor {
  constructor(xLoc, yLoc, type, name) {
    this.place = {
      x: xLoc * PX,
      y: yLoc * PX
    };
    this.type = type;
    if (name) {
      this.name = name;
    } else {
      this.name = 'John Smith';
    }
    this.healPoints = MAX_HEAL_POINTS;
  }
  redraw() {
    this.clearImage();
    this.drawImage();
    this.drawInfo();
    this.drawHP();
  }
  drawName(nameWrap) {
    actorsContext.font = `${NAME_SIZE * PX}px Verdana`;
    actorsContext.fillStyle = 'black';
    actorsContext.textAlign = 'center';
    actorsContext.fillText(this.name, this.place.x - nameWrap * PX, this.place.y - NAME_WRAP * PX);
  }
  drawHP(hpWrap) {
    let hpPercent = this.healPoints / MAX_HEAL_POINTS;
    actorsContext.fillStyle = 'red';
    actorsContext.fillRect(
      this.place.x - hpWrap,
      this.place.y - HP_WRAP * PX,
      hpPercent * this.image.width,
      HP_LINE_HEIGHT * PX
    );
    actorsContext.fillStyle = 'black';
    actorsContext.strokeRect(
      this.place.x - hpWrap,
      this.place.y - HP_WRAP * PX,
      this.image.width,
      HP_LINE_HEIGHT * PX
    );
  }
  rebuild(rebuildedX, rebuildedY) {
    this.place = {
      x: rebuildedX * PX,
      y: rebuildedY * PX
    };
    this.redraw();
  }
  heal(spell) {
    spellContext.drawImage(
      spell.image,
      this.place.x - this.image.width / 4,
      this.place.y,
      spell.width,
      spell.height
    );
    if (this.healPoints <= MAX_HEAL_POINTS - HEAL) {
      this.healPoints += HEAL;
    } else {
      this.healPoints = MAX_HEAL_POINTS;
    }
    this.effect();
    setTimeout(() => {
      spellContext.clearRect(
        this.place.x - this.image.width / 4,
        this.place.y,
        spell.width,
        spell.height
      );
    }, 500);
  }
  effect(time) {
    this.clearImage();
    setTimeout(() => {
      this.clearImage();
      this.redraw();
    }, time);
  }
  damaged() {
    if (this.healPoints - ATTACK > 0) {
      this.healPoints -= ATTACK;
      this.effect(EFFECT_DURATION);
    } else {
      this.loose();
    }
  }
}

function createPlayer(gender, name) {
  const playerImg = new Image();
  const playerNumber = Math.ceil(Math.random() * PLAYER_NUM);
  playerImg.src = `../resources/images/player/hero_${gender}_${playerNumber}.png`;
  playerImg.width = PLAYER_WIDTH * PX;
  playerImg.height = PLAYER_HEIGHT * PX;
  PLAYER = new Player(
    WRAP / 3,
    CANVAS_HEIGHT - PLAYER_HEIGHT - VERTICAL_WRAP,
    'player',
    playerImg,
    name
  );
}

class Player extends Actor {
  constructor(xLoc, yLoc, type, image, name) {
    super(xLoc, yLoc, (type = 'player'), name);
    this.score = 0;
    this.image = image;
    this.redraw();
    this.healPoints = MAX_HEAL_POINTS;
  }
  drawImage() {
    actorsContext.drawImage(
      this.image,
      this.place.x,
      this.place.y,
      this.image.width,
      this.image.height
    );
  }
  drawInfo() {
    this.drawName(-this.image.width / 3);
    this.drawHP(this.place.x);
    this.drawLevel();
  }
  drawLevel() {
    actorsContext.font = `${LVL_SIZE * PX}px Verdana`;
    actorsContext.fillStyle = 'orange';
    actorsContext.textAlign = 'center';
    actorsContext.fillText(
      this.score + 1,
      CANVAS_WIDTH / 2 - this.score * PX,
      LVL_WRAP * PX + LVL_SIZE * PX
    );
  }
  win() {
    this.score += 1;
    createEnemy();
  }
  getTop(allScores, topCount, currentScore) {
    let tempLength = topCount;
    allScores.push(currentScore);
    if (allScores.length < topCount) {
      tempLength = allScores.length;
    }
    allScores.sort((a, b) => {
      return b.score - a.score;
    });
    return [tempLength, allScores];
  }
  createGameScoreList(allScores, currentScore) {
    const $gameWindow = $('#gameWindow');
    $gameWindow.append('<h3>Score List</h3>');
    let tempCurrUserScoreOutput = document.createElement('P');
    tempCurrUserScoreOutput.innerText = `Your Score: ${currentScore.score}`;
    $gameWindow.append(tempCurrUserScoreOutput);
    let topCount = TOP_COUNT;
    [topCount, allScores] = this.getTop(allScores, topCount, currentScore);
    for (let i = 0; i < topCount; i += 1) {
      let tempContent = document.createElement('h3');
      tempContent.innerText = `${i + 1}. ${allScores[i].name} ${allScores[i].score} `;
      $gameWindow.append(tempContent);
    }
  }
  loose() {
    const gameWindow = $('#gameWindow');
    $('#onlyLoggedUserContent')[0].style.display = 'none';
    gameWindow.toggleClass('main-game-container main-score-container bg-light');
    let allScores = [];
    if (!!localStorage.scoreAll) {
      allScores = JSON.parse(localStorage.scoreAll);
    }
    const currentScore = {
      name: this.name,
      score: this.score
    };
    this.createGameScoreList(allScores, currentScore);
    gameWindow.append('<button class="btn btn-primary" onclick="location.reload();">Repeat?</button>');
    localStorage.scoreAll = JSON.stringify(allScores);
    this.healPoints = MAX_HEAL_POINTS;
  }
  clearImage() {
    actorsContext.clearRect(this.place.x, this.place.y, this.image.width, this.image.heigth);
  }
}

class Enemy extends Actor {
  constructor(xLoc, yLoc, type, image, name, build) {
    super(xLoc, yLoc, (type = 'enemy'), name);
    this.image = {
      head: build.head,
      body: build.body,
      weapon: build.weapon,
      legs: build.legs,
      width: image.width,
      height: image.height
    };
    this.healPoints = MAX_HEAL_POINTS;
    this.redraw();
  }
  drawInfo() {
    this.drawName(this.name.length);
    this.drawHP(this.image.width / 3);
  }
  drawImage() {
    actorsContext.drawImage(
      this.image.legs,
      this.place.x - (BODY_WIDTH * PX) / 6,
      this.place.y + (BODY_HEIGHT * PX) / 1.5 + (HEAD_HEIGHT * PX) / 3,
      this.image.legs.width,
      this.image.legs.heigth
    );
    actorsContext.drawImage(
      this.image.body,
      this.place.x - (BODY_WIDTH * PX) / 4.2,
      this.place.y + (HEAD_HEIGHT * PX) / 2,
      this.image.body.width,
      this.image.body.heigth
    );
    actorsContext.drawImage(
      this.image.head,
      this.place.x - (BODY_WIDTH * PX) / 50,
      this.place.y,
      this.image.head.width,
      this.image.head.heigth
    );
    actorsContext.drawImage(
      this.image.weapon,
      this.place.x - 0.9 * WEAPON_WIDTH * PX,
      this.place.y + HEAD_HEIGHT * PX - (WEAPON_HEIGHT / 2) * PX,
      this.image.weapon.width,
      this.image.weapon.heigth
    );
  }
  loose() {
    PLAYER.win();
    createEnemy();
  }
  clearImage() {
    actorsContext.clearRect(
      this.place.x - this.image.width / 2,
      this.place.y,
      this.image.width * 1.3,
      this.image.height
    );
  }
}

function createEnemy() {
  const enemyImg = new Image();
  enemyImg.width = ENEMY_WIDTH * PX;
  enemyImg.height = ENEMY_HEIGHT * PX;
  enemyDraw().then(([name, build]) => {
    ENEMY = new Enemy(
      CANVAS_WIDTH - ENEMY_WIDTH - 4 * WRAP,
      CANVAS_HEIGHT - ENEMY_HEIGHT - 0.8 * VERTICAL_WRAP,
      'enemy',
      enemyImg,
      name,
      build
    );
  });
}

function drawHeroes() {
  let hero = JSON.parse(localStorage.getItem('user'));
  if (hero && hero.gender && hero.name) {
    createPlayer(hero.gender, hero.name);
    createEnemy();
  }
}

drawHeroes();