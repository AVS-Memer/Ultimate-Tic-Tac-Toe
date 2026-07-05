const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

let currentPlayer = 'X';
let gameActive = true;

// Track the state of the 81 individual squares
let cellsState = Array(81).fill(''); 

// Track the status of the 9 macro-boards ('', 'X', 'O', or 'TIE')
let macroBoards = Array(9).fill(''); 

// Tells the player which macro-board index (0-8) they are forced to play in. 
// -1 means they have a "wildcard" and can play anywhere.
let activeMacroBoard = -1; 

// Helper maps to translate a flat 0-80 cell index into macro/local coordinates
// Macro index = matching 3x3 block (0 to 8)
// Local index = position inside that 3x3 block (0 to 8)
function getCoordinates(index) {
    const row = Math.floor(index / 9);
    const col = index % 9;
    const macroRow = Math.floor(row / 3);
    const macroCol = Math.floor(col / 3);
    const macroIndex = macroRow * 3 + macroCol;
    
    const localRow = row % 3;
    const localCol = col % 3;
    const localIndex = localRow * 3 + localCol;
    
    return { macroIndex, localIndex };
}

// Winning lines for a standard 3x3 Tic-Tac-Toe layout
const winLines = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [2, 4, 6], [0, 4, 8]];

// Check if a 3x3 board state has a winner
function check3x3Win(board) {
    for (let line of winLines) {
        const [a, b, c] = line;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    if (board.every(cell => cell !== '')) return 'TIE';
    return '';
}
// Generate the 81 cells inside the DOM
function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 81; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
}
function handleCellClick(e) {
    const cellIndex = parseInt(e.target.dataset.index);
    const { macroIndex, localIndex } = getCoordinates(cellIndex);

    // Reject click if game over, square occupied, or local board already decided
    if (!gameActive || cellsState[cellIndex] !== '' || macroBoards[macroIndex] !== '') return;

    // Enforce macro-board routing restriction
    if (activeMacroBoard !== -1 && activeMacroBoard !== macroIndex) return;

    // Make the move
    cellsState[cellIndex] = currentPlayer;
    e.target.innerText = currentPlayer;
    e.target.classList.add(currentPlayer);

    // Evaluate the status of the local 3x3 board just played in
    updateLocalBoardStatus(macroIndex);
    // Determine where the opponent must go next
    determineNextActiveBoard(localIndex);
    // Check if this move won the overall match
    checkGameWinner();
    if (gameActive) {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'Y'; // Quick toggle text
        currentPlayer = e.target.classList.contains('X') ? 'O' : 'X';
        statusElement.innerText = `Player ${currentPlayer}'s Turn`;
        updateVisualHighlights();
    }
}
function updateLocalBoardStatus(macroIndex) {
    // Extract the 9 elements belonging to this macro board
    let localBoardArr = [];
    for (let i = 0; i < 81; i++) {
        if (getCoordinates(i).macroIndex === macroIndex) {
            localBoardArr.push(cellsState[i]);
        }
    }
    const res = check3x3Win(localBoardArr);
    if (res) {
        macroBoards[macroIndex] = res;
        // Tint all cells inside this macro board to show ownership
        const DOMCells = boardElement.children;
        for (let i = 0; i < 81; i++) {
            if (getCoordinates(i).macroIndex === macroIndex) {
                DOMCells[i].classList.add(`won-${res}`);
            }
        }
    }
}
function determineNextActiveBoard(localIndex) {
    // The local square clicked dictates the next macro board index
    if (macroBoards[localIndex] === '') {
        activeMacroBoard = localIndex; // Targets an open board
    } else {
        activeMacroBoard = -1; // Targets a closed board, giving a wildcard rule
    }
}
function checkGameWinner() {
    const finalResult = check3x3Win(macroBoards);
    if (finalResult === 'X' || finalResult === 'O') {
        statusElement.innerText = `🎉 Player ${finalResult} Wins the Ultimate Match!`;
        gameActive = false;
        clearHighlights();
    } else if (finalResult === 'TIE') {
        statusElement.innerText = `It's an ultimate tie match! 🤝`;
        gameActive = false;
        clearHighlights();
    }
}
// Apply background highlights to open cells where player moves are legally allowed
function updateVisualHighlights() {
    const DOMCells = boardElement.children;
    for (let i = 0; i < 81; i++) {
        const { macroIndex } = getCoordinates(i);
        const isCellEmpty = cellsState[i] === '';
        const isBoardOpen = macroBoards[macroIndex] === '';
        
        let isLegal = false;
        if (activeMacroBoard === -1) {
            isLegal = isCellEmpty && isBoardOpen; // Wildcard target rule
        } else {
            isLegal = isCellEmpty && (macroIndex === activeMacroBoard);
        }

        if (isLegal) {
            DOMCells[i].classList.add('active-board');
        } else {
            isLegal = isCellEmpty && (macroIndex === activeMacroBoard);
        }

        if (isLegal) {
            DOMCells[i].classList.add('active-board');
        } else {
            DOMCells[i].classList.remove('active-board');
        }
    }
}
function clearHighlights() {
  const DOMCells = boardElement.children;
  for (let i = 0; i < 81; i++) {
    DOMCells[i].classList.remove('active-board');
  }
}
function initGame() {
  currentPlayer = 'X';
  gameActive = true;
  cellsState = Array(81).fill('');
  macroBoards = Array(9).fill('');
  activeMacroBoard = -1;
  statusElement.innerText = "Player X's Turn";
  createBoard();updateVisualHighlights();
}
initGame();
