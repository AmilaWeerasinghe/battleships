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

//creating boards
const width = 10;

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

flipButton.addEventListener('click', flip);