const flipButton  = document.querySelector('#flip-button'); // query through whole document to find the element
const startButton = document.querySelector('#start-button');
const singlePlayerButton = document.querySelector('#singlePlayerButton');
const multiPlayerButton = document.querySelector('#multiPlayerButton');

const optionContainer = document.querySelector('.option-container'); 

// handle multiplayer node server
let gameMode = "";
let playerNumber = 0;
let ready = false;
let enemyReady = false;
let allShipsPlaced = false;
let shotFired = -1;

//Select player mode
singlePlayerButton.addEventListener('click', startSinglePlayer);
multiPlayerButton.addEventListener('click', startMultiPlayer);

const socket = io(); // create a socket connection to node server

// get your player number
socket.on('player-number', num => {
  if(num === -1) {
    infoDisplay.textContent = 'Sorry, the server is full';
  } else {
    playerNumber = parseInt(num); // number passed from socket io is a string
    if(playerNumber === 1) currentPlayer = "enemy";

    console.log(playerNumber);
  }

})

//single player function 
// Use function declrations instead of function expressions to make sure its hoisted
function startSinglePlayer () {
  console.log('single player');
  gameMode = 'singlePlayer';
  startGame();
}

function startMultiPlayer (){
  console.log('multi player');
  gameMode = 'multiPlayer';
  //emit the player number
}

const gamesBoardContainer = document.querySelector('#game-board-container');
const infoDisplay = document.querySelector('#info');
const turnDisplay = document.querySelector('#turn-display');

// options choosing
let angle = 0;

const flip = () => {
  const optionShips = Array.from(optionContainer.children); //construct an array from the children of the optionContainer
  angle = angle === 0 ? 90 : 0;
  optionShips.forEach(optionShip => {
    return optionShip.style.transform = `rotate(${angle}deg)`;
  });
}

flipButton.addEventListener('click', flip);

//creating boards
const width = 10; // value required figure out the blocks the color based on the length of the ship

const createBoard = (color,id) => {
  const gameBoardContainer = document.createElement('div'); // create a new div element
  gameBoardContainer.classList.add('game-board'); // add a class to the new div element
  gameBoardContainer.style.backgroundColor = color; // set the background color of the new div element
  gameBoardContainer.id = id; // set the id of the new div element

  // add blocks to the game board'

  // why  loop width * width times? = becuase the board and blocks are square so the width of the board is the same as the height of the board
  // so same number of blocks are supposed to be added for the height and width of the board
  for (let i = 0; i < width * width; i++) {
    const block = document.createElement('div'); // create a new div element
    block.classList.add('block'); // add a class to the new div element
    block.id = i;
    gameBoardContainer.appendChild(block); // append the new div element to the game
  }
  gamesBoardContainer.appendChild(gameBoardContainer); // append the new div element to the gameBoardContainer 
}

createBoard('lightblue', 'player');
createBoard('pink', 'computer');

// creating ships

class Ship {
  constructor(name, length) {
    this.name = name;
    this.length = length;
  }
}

const destroyer = new Ship('destroyer', 2);
const submarine = new Ship('submarine', 3);
const cruiser = new Ship('cruiser', 3);
const battleship = new Ship('battleship', 4);
const carrier = new Ship('carrier', 5);

const ships = [destroyer, submarine, cruiser, battleship, carrier];
let notDropped;


const getValidity = (allBoardBlocks, isHorizontal, startIndex, ship) => {
  // check if the random index is valid start
  let validStart = isHorizontal ? startIndex <= width * width - ship.length ? startIndex : 
  width * width - ship.length :
  // handle vertical case
  startIndex <= width * width - width * ship.length ? startIndex : 
  startIndex - ship.length * width + width;

  let shipBlocks = [];

  // check if the random index is valid

  for (let i = 0; i < ship.length; i++) {
    if ( isHorizontal ) {
      // figure out the indexes to color with passed ship
      // push to shipBlocks array
      shipBlocks.push(allBoardBlocks[Number(validStart) + i])
    } else {
      // figure out the indexes to color with passed ship
      // push to shipBlocks array
      shipBlocks.push(allBoardBlocks[Number(validStart) + i * width])
    }
  }

  let valid;

  // validations to check if the ship can be placed in the board
  // without going into multiple lines
  if ( isHorizontal ) {
    shipBlocks.every((_shipBlock, index) =>
      valid  = shipBlocks[0].id % width - ( shipBlocks.length - ( index + 1))
    )
  } else {
    //handle vertical
    shipBlocks.every((_shipBlock, index) =>
      valid = shipBlocks[0].id < 99 + ( width * index + 1 )
    )
  }

  //validations to check the block is already not taken
  const notTaken = shipBlocks.every(shipBlock => !shipBlock.classList.contains('taken'))

  return { shipBlocks, valid, notTaken }

}

const addShipPiece =  (user, ship, startId) => {
  const allBoardBlocks = document.querySelectorAll(`#${user} div`)

  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = user=== 'player' ? angle ===0 : randomBoolean ;

  // generate random index
  let randomStartIndex = Math.floor(Math.random() * width * width);

  let startIndex = startId || randomStartIndex;

  const {shipBlocks, valid, notTaken} = getValidity(allBoardBlocks, isHorizontal, startIndex, ship);

  if ( valid && notTaken) {
    shipBlocks.forEach ( shipBlock => {
      shipBlock.classList.add(ship.name)
      shipBlock.classList.add('taken');// mark the div of block is taken
    })
  } else {
    // if not valid we will re-run the function till the ships are placed in a valid place
    if(user==='computer') addShipPiece(user,ship, startId); 
    if(user==='player') notDropped = true; //put the ship piece back to the options container
  }
  
}

ships.forEach(ship => addShipPiece('computer', ship));// for computer the startId is not provided


// drag player ships
let draggedShip; 
const dragStart = (e) => {
  console.log('dragStart')
  notDropped= false;
  draggedShip = e.target;
}

const dragOver = (e) => {
  console.log('dragOver')
  e.preventDefault();
  const ship= ships[draggedShip.id];
  highlightArea(e.target.id, ship);
}

const dropShip = (e) => {
  console.log('dropShip')
  const startId = e.target.id;
  const ship = ships[draggedShip.id];

  addShipPiece('player', ship, startId);// for player the startId is provided
  if ( !notDropped ) {
    draggedShip.remove();
  }
}

const optionShips = Array.from(optionContainer.children);
optionShips.forEach(optionShip => {
  optionShip.setAttribute('draggable', true)
  optionShip.addEventListener('dragstart', dragStart)
}
)

const allPlayerBlocks = document.querySelectorAll('#player div');
allPlayerBlocks.forEach(playerBlock => {
  playerBlock.addEventListener('dragover', dragOver)
  playerBlock.addEventListener('drop', dropShip)
}
)

const highlightArea = (startIndex, ship) => {
  const allBoardBlocks = document.querySelectorAll('#player div');
  let isHorizontal = angle === 0;

  const {shipBlocks, valid , notTaken } = getValidity(allBoardBlocks, isHorizontal, startIndex, ship);

  if ( valid && notTaken ) {
    shipBlocks.forEach(shipBlock => {
      shipBlock.classList.add('hover')
      setTimeout(() => shipBlock.classList.remove('hover'), 500)
    })
  }
}

// game logic
let gameover = false;
let playerTurn = true;

let playerHits = [];
let computerHits = [];
const playerSunkenShips = [];
const computerSunkenShips = [];

// handle click event
const handleClick = (e) => {
  if ( !gameover ) {
    if( e.target.classList.contains('taken')){
      e.target.classList.add('boom');
      infoDisplay.textContent = 'You hit the computers ship';
      let classes = Array.from(e.target.classList);
      classes = classes.filter(className => className !== 'block' && className !== 'taken' && className !== 'boom');
      playerHits.push(...classes);
      console.log(playerHits);
      checkScore('player', playerHits,playerSunkenShips);
    }

    if (!e.target.classList.contains('taken')) {
      infoDisplay.textContent = 'Nothing hit this time.'
      e.target.classList.add('empty')
    }
    playerTurn = false;
    const allBoardBlocks = document.querySelectorAll('#computer div')
    allBoardBlocks.forEach(block => block.replaceWith(block.cloneNode(true)));
    setTimeout(computerTurn, 3000);
  }
}

// Start the game

const startGame = () => {
  console.log('startGame')
  if (playerTurn){
    //start game if all pieces are on the board
  if(optionContainer.children.length != 0){
    infoDisplay.textContent = 'Please place all ships on the board';
  } else {
    const allBoardBlocks = document.querySelectorAll('#computer div');
    allBoardBlocks.forEach((block) => block.addEventListener('click', handleClick))
    playerTurn = true;
  turnDisplay.textContent = 'Your Turn!';
  infoDisplay.textContent = 'The Game has started!';
  }
  }
}

startButton.addEventListener('click', startGame);

// computer turn
const computerTurn = () => {
  if ( !gameover ) {
    turnDisplay.textContent = 'Computer Turn!';
    infoDisplay.textContent = 'The computer is thinking...';

    setTimeout(() => {
      let randomGo = Math.floor(Math.random() * width * width);
      const allBoardBlocks = document.querySelectorAll('#player div');

      if ( allBoardBlocks[randomGo].classList.contains('taken')&&
        allBoardBlocks[randomGo].classList.contains('boom')) {
          computerTurn();
          return;
        } else if (
          allBoardBlocks[randomGo].classList.contains('taken') &&
          !allBoardBlocks[randomGo].classList.contains('boom')
        ) {
          allBoardBlocks[randomGo].classList.add('boom');
          infoDisplay.textContent = 'The computer hit your ship!';
          let classes = Array.from(allBoardBlocks[randomGo].classList);
          classes = classes.filter(className => className !== 'block' && className !== 'taken' && className !== 'boom');
          computerHits.push(...classes);
          console.log(computerHits);
          checkScore('computer', computerHits, computerSunkenShips);
        } else {
          infoDisplay.textContent = 'Nothing hit this time.';
          allBoardBlocks[randomGo].classList.add('empty');
        }
    },3000)

    setTimeout(() => {
      playerTurn = true;
      turnDisplay.textContent = 'Your Turn!';
      infoDisplay.textContent = 'Please take your turn.';
      const allBoardBlocks = document.querySelectorAll('#computer div')
      allBoardBlocks.forEach(block => block.addEventListener('click', handleClick))
    }, 6000)
  }
}

//function to check score

const checkScore = (user, userHits, userSunkShips) => {
  const checkShip = ( shipName , shipLength) => {
    if ( userHits.filter(storedShipName => storedShipName === shipName).length === shipLength) {
      
       if ( user === 'player') {
        infoDisplay.textContent = `You sunk the computer's ${shipName}`;
         playerHits = userHits.filter(storedShipName => storedShipName !== shipName);
       }
       if ( user === 'computer') {
        infoDisplay.textContent = `Computer sunk the user's ${shipName}`;
        computerHits = userHits.filter(storedShipName => storedShipName !== shipName);
      }

      userSunkShips.push(shipName);
    }
  }

  checkShip('destroyer', 2);
  checkShip('submarine', 3);
  checkShip('cruiser', 3);
  checkShip('battleship', 4);
  checkShip('carrier', 5);

  console.log('playerHits', playerHits);
  console.log('playerSunkShips', playerSunkenShips);

  if(playerSunkenShips.length === 5) {
    infoDisplay.textContent = 'You sunk all computer ships! Congratulations! You win!';
    gameover = true;
  }
  if(computerSunkenShips.length === 5) {
    infoDisplay.textContent = 'Computer sunk all your ships! Computer won!';
    gameover = true;
  }
}