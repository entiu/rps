const speed = .5;
const randomMultiplier = 1;
const moveInterval = 50;
const fighterW = 16;
const fighterH = 21;
const board = document.querySelector('.board');
const btnStart = document.querySelector('.btn-start');
const mapSelect = document.querySelector('#map');
const sizeSelect = document.querySelector('#size');
const formControls = document.querySelectorAll('.form-control');

var fighters = [], fightersNo;
var playGame = false;
var c = 1;
var velocity = {
  rock: 1,
  paper: 1,
  scissors: 1
}
var boardW, boardH, boundX, boundY;
var gameDecided = false;

var getWeapon = fighter => {
  return fighter.dataset.weapon;
}

var getDistance = (f1, f2) => {
  return Math.sqrt((f1.dataset.left - f2.dataset.left) ** 2 + (f1.dataset.top - f2.dataset.top) ** 2);
}

var getTarget = fighter => {
  var id = '';
  var distance = Math.sqrt(boundX ** 2 + boundY ** 2); // start with the farthest possible distance on the board: the diagonal
  fighters.forEach(f => {
    if (getWeapon(f) === getWeapon(fighter) || beats(f, fighter)) return;

    if (getDistance(fighter, f) < distance) {
      distance = getDistance(fighter, f);
      id = f.id;
    }
  })

  if (id) return document.querySelector(`#${id}`);

  fighters.forEach(f => {
    if (getWeapon(f) === getWeapon(fighter)) return;

    if (getDistance(fighter, f) < distance) {
      distance = getDistance(fighter, f);
      id = f.id;
    }
  })

  if (id) return document.querySelector(`#${id}`);
}

var checkGameDecided = () => {
  fighters.reduce((c, f) => getWeapon(f) === 'rock' ? ++c : c, 0) === 0 ||
  fighters.reduce((c, f) => getWeapon(f) === 'paper' ? ++c : c, 0) === 0 ||
  fighters.reduce((c, f) => getWeapon(f) === 'scissors' ? ++c : c, 0)
}

var checkHit = (f1, f2) => {
  var f1Rect = f1.getBoundingClientRect();
  var f2Rect = f2.getBoundingClientRect();
  return !(f1Rect.top > f2Rect.bottom || f1Rect.bottom < f2Rect.top || f1Rect.left > f2Rect.right || f1Rect.right < f2Rect.left);
}

var beats = (f1, f2) => {
  return (getWeapon(f1) === 'rock' && getWeapon(f2) === 'scissors') || (getWeapon(f1) === 'paper' && getWeapon(f2) === 'rock') || (getWeapon(f1) === 'scissors' && getWeapon(f2) === 'paper');
}

var move = (fighter, target, direction) => {
  var fighterRect = fighter.getBoundingClientRect();
  var targetRect = target.getBoundingClientRect();

  var deltaX = Math.abs(fighterRect.left - targetRect.left);
  var deltaY = Math.abs(fighterRect.top - targetRect.top);
  var dist = getDistance(fighter, target);

  var moveX = (deltaX * speed / dist + Math.random() * randomMultiplier) * (fighterRect.left < targetRect.left ? 1 : (-1)) * (direction === 'closer' ? 1 : (-1));
  var moveY = (deltaY * speed / dist + Math.random() * randomMultiplier) * (fighterRect.top < targetRect.top ? 1 : (-1)) * (direction === 'closer' ? 1 : (-1));

  if (Math.random() > .25 || checkGameDecided()) {
    moveX = Math.random() * randomMultiplier * (Math.random() > .5 ? -1 : 1);
    moveY = Math.random() * randomMultiplier * (Math.random() > .5 ? -1 : 1);
  }

  var newX, newY;

  if ((parseFloat(fighter.dataset.left) + moveX).toFixed(2) > 0 && (parseFloat(fighter.dataset.left) + moveX).toFixed(2) < boundX) {
    newX = (parseFloat(fighter.dataset.left) + moveX).toFixed(2);
  } else {
    newX = (parseFloat(fighter.dataset.left) - 2 * moveX).toFixed(2);
  }

  if ((parseFloat(fighter.dataset.top) + moveY).toFixed(2) > 0 && (parseFloat(fighter.dataset.top) + moveY).toFixed(2) < boundY) {
    newY = (parseFloat(fighter.dataset.top) + moveY).toFixed(2);
  } else {
    newY = (parseFloat(fighter.dataset.top) - 2 * moveY).toFixed(2);
  }

  //if (newX > 0 && newX < boundX) {
    fighter.dataset.left = newX;
    fighter.style.left = `${newX}px`;
  //}

  //if (newY > 0 && newY < boundY) {
    fighter.dataset.top = newY;
    fighter.style.top = `${newY}px`;
  //}
}

var convert = fighter => {
  if (getWeapon(fighter) === 'rock') {
    fighter.dataset.weapon = 'paper';
    fighter.textContent = '📜';
  } else if (getWeapon(fighter) === 'paper') {
    fighter.dataset.weapon = 'scissors';
    fighter.textContent = '✂️';
  } else {
    fighter.dataset.weapon = 'rock';
    fighter.textContent = '🪨';
  }

  var badge = document.createElement('span');
  badge.classList.add('badge');
  badge.textContent = fighter.dataset.counter;
  fighter.appendChild(badge);

  updateVelocity();
} 

var updateVelocity = () => {
  velocity['rock'] = (1 + fighters.reduce((c, f) => getWeapon(f) === 'rock' ? ++c : c, 0) / fightersNo).toFixed(2);
  velocity['paper'] = (1 + fighters.reduce((c, f) => getWeapon(f) === 'paper' ? ++c : c, 0) / fightersNo).toFixed(2);
  velocity['scissors'] = (1 + fighters.reduce((c, f) => getWeapon(f) === 'scissors' ? ++c : c, 0) / fightersNo).toFixed(2);
}

var createFighter = weapon => {
  var fighter = document.createElement('div');
  var top = Math.floor(Math.random() * (boardH - fighterH));
  var left = Math.floor(Math.random() * (boardW - fighterW));
  fighter.classList.add('fighter');
  fighter.setAttribute('data-weapon', weapon);
  fighter.setAttribute('data-top', top);
  fighter.setAttribute('data-left', left);
  fighter.setAttribute('data-counter', c);
  fighter.setAttribute('id', `f_${c < 10 ? '0' + c : c}`);
  fighter.style.top = `${top}px`;
  fighter.style.left = `${left}px`;
  fighter.textContent = weapon === 'rock' ? '🪨' : weapon === 'paper' ? '📜' : '✂️';
  var badge = document.createElement('span');
  badge.classList.add('badge');
  badge.textContent = c;
  fighter.appendChild(badge);
  board.appendChild(fighter);
  fighters.push(fighter);
  c++;
}

var changeMap = (e) => {
  e.preventDefault();
  board.style.backgroundImage = e.target.value === 'clean' ? 'unset' : `url(${e.target.value}.jpeg)`;
}

var changeSize = (e) => {
  e.preventDefault();
  board.style.width = `${e.target.value}px`;
  board.style.height = `${e.target.value}px`;
}

var startGame = () => {
  var noOfRocks = parseInt(document.querySelector('input#rocks').value);
  var noOfPapers = parseInt(document.querySelector('input#papers').value);
  var noOfScissors = parseInt(document.querySelector('input#scissors').value);
  boardW = board.getBoundingClientRect().width;
  boardH = board.getBoundingClientRect().height;
  boundX = boardW - fighterW;
  boundY = boardH - fighterH;

  for (var i = 0; i < noOfRocks; i++) {
    createFighter('rock');
  }

  for (var i = 0; i < noOfPapers; i++) {
    createFighter('paper');
  }

  for (var i = 0; i < noOfScissors; i++) {
    createFighter('scissors');
  }

  fightersNo = fighters.length;
  playGame = true;
  formControls.forEach(control => {
    control.setAttribute('disabled', true);
  })

  updateVelocity();
  setInterval(moveFighters, moveInterval);
  // requestAnimationFrame(moveFighters);
}

var moveFighters = () => {
  fighters.forEach(fighter => {
    var target = getTarget(fighter);
    if (beats(fighter, target) || checkGameDecided()) {
      move(fighter, target, 'closer');
      if (checkHit(fighter, target)) {
        convert(target)
      }
    } else {
      move(fighter, target, 'farther');
    }
  })
  // if (!gameWon) requestAnimationFrame(moveFighters);
}

btnStart.addEventListener('click', startGame);

mapSelect.addEventListener('change', changeMap);

sizeSelect.addEventListener('change', changeSize);