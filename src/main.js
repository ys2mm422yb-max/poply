import { attemptSwap, createBoard } from './game.js';

const SIZE = 8;
const TYPES = 6;
const boardElement = document.querySelector('#board');
const scoreElement = document.querySelector('#score');
const statusElement = document.querySelector('#status');
const newGameButton = document.querySelector('#new-game');

let board = createBoard(SIZE, TYPES);
let selected = null;
let score = 0;

function render() {
  boardElement.replaceChildren();
  board.forEach((type, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `piece piece-${type}${selected === index ? ' selected' : ''}`;
    button.dataset.index = String(index);
    button.setAttribute('role', 'gridcell');
    button.setAttribute('aria-label', `Piece ${type + 1}, cell ${index + 1}`);
    button.addEventListener('click', () => choose(index));
    boardElement.append(button);
  });
  scoreElement.textContent = score.toLocaleString();
}

function choose(index) {
  if (selected === null) {
    selected = index;
    statusElement.textContent = 'Choose a neighbouring piece.';
    render();
    return;
  }

  if (selected === index) {
    selected = null;
    statusElement.textContent = 'Selection cleared.';
    render();
    return;
  }

  const result = attemptSwap(board, selected, index, SIZE, () => Math.floor(Math.random() * TYPES));
  selected = null;

  if (!result.valid) {
    statusElement.textContent = 'That move creates no match.';
    render();
    return;
  }

  board = result.board;
  score += result.score;
  statusElement.textContent = result.chain > 1 ? `${result.chain}× cascade!` : 'Pop!';
  render();
}

newGameButton.addEventListener('click', () => {
  board = createBoard(SIZE, TYPES);
  selected = null;
  score = 0;
  statusElement.textContent = 'Fresh board.';
  render();
});

render();
