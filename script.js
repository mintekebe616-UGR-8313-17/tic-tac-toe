let board = Array(9).fill(null);
let currentPlayer = "X";
let gameMode = null;
let gameActive = false;
let scores = { X: 0, O: 0 };
let playerNames = { X: "Player 1", O: "Player 2" };

// Create audio objects with proper error handling
let winSound = new Audio();
let loseSound = new Audio();
let drawSound = new Audio();
let moveSound = new Audio();

// Set sound sources (use relative paths)
winSound.src = "assets/win.mp3";
loseSound.src = "assets/lose.mp3";
drawSound.src = "assets/draw.mp3";
moveSound.src = "assets/move.mp3";

// Preload sounds
winSound.load();
loseSound.load();
drawSound.load();
moveSound.load();

// Set volume (optional)
winSound.volume = 0.5;
loseSound.volume = 0.5;
drawSound.volume = 0.5;
moveSound.volume = 0.3;

// Test if sounds loaded properly
winSound.addEventListener('canplaythrough', function() {
    console.log("✅ win.mp3 loaded successfully");
});
winSound.addEventListener('error', function(e) {
    console.log("❌ win.mp3 failed to load - check file path");
});

loseSound.addEventListener('canplaythrough', function() {
    console.log("✅ lose.mp3 loaded successfully");
});
loseSound.addEventListener('error', function(e) {
    console.log("❌ lose.mp3 failed to load - check file path");
});

drawSound.addEventListener('canplaythrough', function() {
    console.log("✅ draw.mp3 loaded successfully");
});
drawSound.addEventListener('error', function(e) {
    console.log("❌ draw.mp3 failed to load - check file path");
});

moveSound.addEventListener('canplaythrough', function() {
    console.log("✅ move.mp3 loaded successfully");
});
moveSound.addEventListener('error', function(e) {
    console.log("❌ move.mp3 failed to load - check file path");
});

// Function to play sound safely
function playSound(sound) {
    if (!sound) return;
    
    // Reset sound to beginning
    sound.currentTime = 0;
    
    // Play sound and handle any errors
    let playPromise = sound.play();
    
    if (playPromise !== undefined) {
        playPromise.catch(function(error) {
            console.log("Sound play failed:", error);
            // Try playing after user interaction
            document.addEventListener('click', function() {
                sound.play();
            }, { once: true });
        });
    }
}

let singlePlayerBtn = document.getElementById("singlePlayerBtn");
let twoPlayerBtn = document.getElementById("twoPlayerBtn");
let playerInputs = document.getElementById("playerInputs");
let playerXInput = document.getElementById("playerX");
let playerOInput = document.getElementById("playerO");
let startGameBtn = document.getElementById("startGameBtn");
let scoreBoard = document.getElementById("scoreBoard");
let scoreXName = document.getElementById("scoreXName");
let scoreOName = document.getElementById("scoreOName");
let scoreX = document.getElementById("scoreX");
let scoreO = document.getElementById("scoreO");
let gameBoard = document.getElementById("gameBoard");
let boardElement = document.getElementById("board");
let turnIndicator = document.getElementById("turnIndicator");
let currentTurnText = document.getElementById("currentTurnText");
let restartRoundBtn = document.getElementById("restartRoundBtn");
let resetGameBtn = document.getElementById("resetGameBtn");
let gameOverModal = document.getElementById("gameOverModal");
let gameOverMessage = document.getElementById("gameOverMessage");
let playAgainBtn = document.getElementById("playAgainBtn");

function createBoard() {
    boardElement.innerHTML = "";
    for (let i = 0; i < 9; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.setAttribute("data-index", i);
        boardElement.appendChild(cell);
    }
}
createBoard();

singlePlayerBtn.addEventListener("click", function() {
    gameMode = "single";
    singlePlayerBtn.classList.add("active");
    twoPlayerBtn.classList.remove("active");
    playerInputs.classList.remove("hidden");
    playerOInput.value = "Computer";
    playerOInput.disabled = true;
});

twoPlayerBtn.addEventListener("click", function() {
    gameMode = "two";
    twoPlayerBtn.classList.add("active");
    singlePlayerBtn.classList.remove("active");
    playerInputs.classList.remove("hidden");
    playerOInput.value = "Player 2";
    playerOInput.disabled = false;
});

startGameBtn.addEventListener("click", function() {
    playerNames.X = playerXInput.value.trim() || "Player 1";
    playerNames.O = playerOInput.value.trim() || (gameMode === "single" ? "Computer" : "Player 2");
    
    scoreXName.textContent = playerNames.X;
    scoreOName.textContent = playerNames.O;
    
    playerInputs.classList.add("hidden");
    scoreBoard.classList.remove("hidden");
    gameBoard.classList.remove("hidden");
    
    resetBoard();
    gameActive = true;
    updateTurnIndicator();
});

function resetBoard() {
    board = Array(9).fill(null);
    currentPlayer = "X";
    gameActive = true;
    
    let cells = document.querySelectorAll(".cell");
    cells.forEach(function(cell) {
        cell.textContent = "";
        cell.classList.remove("x", "o", "win", "invalid");
    });
    
    updateTurnIndicator();
}

restartRoundBtn.addEventListener("click", function() {
    resetBoard();
});

resetGameBtn.addEventListener("click", function() {
    scores = { X: 0, O: 0 };
    scoreX.textContent = "0";
    scoreO.textContent = "0";
    resetBoard();
});

boardElement.addEventListener("click", function(e) {
    let cell = e.target.closest(".cell");
    if (!cell || !gameActive) return;
    
    let index = parseInt(cell.getAttribute("data-index"));
    
    if (gameMode === "single" && currentPlayer === "O") return;
    
    if (board[index] === null) {
        makeMove(index);
    } else {
        cell.classList.add("invalid");
        setTimeout(function() {
            cell.classList.remove("invalid");
        }, 500);
    }
});

function makeMove(index) {
    board[index] = currentPlayer;
    
    let cell = document.querySelector(`[data-index="${index}"]`);
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());
    
    // Play move sound
    playSound(moveSound);
    
    let winInfo = checkWinner();
    
    if (winInfo) {
        gameActive = false;
        
        if (winInfo.winner === "X") {
            scores.X++;
            scoreX.textContent = scores.X;
        } else {
            scores.O++;
            scoreO.textContent = scores.O;
        }
        
        winInfo.pattern.forEach(function(i) {
            document.querySelector(`[data-index="${i}"]`).classList.add("win");
        });
        
        let winnerName = winInfo.winner === "X" ? playerNames.X : playerNames.O;
        gameOverMessage.textContent = winnerName + " wins! 🎉";
        gameOverModal.classList.remove("hidden");
        
        // Play win or lose sound
        if (gameMode === "single") {
            if (winInfo.winner === "X") {
                playSound(winSound); // Player wins
            } else {
                playSound(loseSound); // Computer wins
            }
        } else {
            playSound(winSound); // Two player mode - winner sound
        }
        
    } else if (board.every(function(cell) { return cell !== null; })) {
        gameActive = false;
        gameOverMessage.textContent = "It's a draw! 🤝";
        gameOverModal.classList.remove("hidden");
        
        // Play draw sound
        playSound(drawSound);
        
    } else {
        if (currentPlayer === "X") {
            currentPlayer = "O";
        } else {
            currentPlayer = "X";
        }
        updateTurnIndicator();
        
        if (gameMode === "single" && currentPlayer === "O" && gameActive) {
            setTimeout(makeComputerMove, 500);
        }
    }
}

function checkWinner() {
    let patterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let i = 0; i < patterns.length; i++) {
        let [a, b, c] = patterns[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], pattern: patterns[i] };
        }
    }
    return null;
}

function makeComputerMove() {
    if (!gameActive || currentPlayer !== "O") return;
    
    // Try to win
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = "O";
            if (checkWinner()) {
                board[i] = null;
                makeMove(i);
                return;
            }
            board[i] = null;
        }
    }
    
    // Try to block player
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
            board[i] = "X";
            if (checkWinner()) {
                board[i] = null;
                makeMove(i);
                return;
            }
            board[i] = null;
        }
    }
    
    // Take center or corners
    let moves = [4, 0, 2, 6, 8, 1, 3, 5, 7];
    for (let i = 0; i < moves.length; i++) {
        let move = moves[i];
        if (board[move] === null) {
            makeMove(move);
            return;
        }
    }
}

function updateTurnIndicator() {
    let name = currentPlayer === "X" ? playerNames.X : playerNames.O;
    currentTurnText.textContent = name + "'s turn (" + currentPlayer + ")";
}

playAgainBtn.addEventListener("click", function() {
    gameOverModal.classList.add("hidden");
    resetBoard();
});

// Add sound toggle button
let soundEnabled = true;
let soundBtn = document.createElement("button");
soundBtn.textContent = "🔊 Sound ON";
soundBtn.classList.add("control-btn");
soundBtn.style.marginTop = "10px";

soundBtn.onclick = function() {
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? "🔊 Sound ON" : "🔈 Sound OFF";
    
    // Override playSound function
    window.playSound = function(sound) {
        if (soundEnabled && sound) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Sound play failed:", e));
        }
    };
};

document.querySelector(".game-controls").appendChild(soundBtn);

// Initialize the custom playSound function
window.playSound = playSound;