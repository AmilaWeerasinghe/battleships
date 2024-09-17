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

