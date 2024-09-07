const flipButton  = document.querySelector('#flip-button'); // query through whole document to find the element

const optionContainer = document.querySelector('.option-container'); 


const gamesBoardContainer = document.querySelector('#game-board-container');

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

const addShipPiece =  (ship) => {
  const allBoardBlocks = document.querySelectorAll('#computer div')

  let randomBoolean = Math.random() < 0.5;
  let isHorizontal = randomBoolean;

  // generate random index
  let randomStartIndex = Math.floor(Math.random() * width * width);

  let shipBlocks = [];

  // check if the random index is valid

  for (let i = 0; i < ship.length; i++) {
    if ( isHorizontal ) {
      // figure out the indexes to color with passed ship
      // push to shipBlocks array
      shipBlocks.push(allBoardBlocks[Number(randomStartIndex) + i])
    } else {
      // figure out the indexes to color with passed ship
      // push to shipBlocks array
      shipBlocks.push(allBoardBlocks[Number(randomStartIndex) + i * width])
    }
  }

  shipBlocks.forEach ( shipBlock => {
    shipBlock.classList.add(ship.name)
    shipBlock.classList.add('taken');// mark the div of block is taken
  })
}

ships.forEach(ship => addShipPiece(ship));