const game = document.getElementById("game");
const startScreen = document.getElementById("start-screen");
const winScreen = document.getElementById("win-screen");
const gameContainer = document.getElementById("game-container");
const recordsScreen = document.getElementById("records-screen");
const startButton = document.getElementById("start-button");
const nextLevelButton = document.getElementById("next-level-button");
const restartButton = document.getElementById("restart-button");
const showRecordsButton = document.getElementById("show-records-button");
const clearRecordsButton = document.getElementById("clear-records-button");
const backToStartButton = document.getElementById("back-to-start-button");
const moveCountSpan = document.getElementById("move-count");
const timerSpan = document.getElementById("timer");
const currentLevelSpan = document.getElementById("current-level");
const finalMovesSpan = document.getElementById("final-moves");
const finalTimeSpan = document.getElementById("final-time");
const recordsTableBody = document.querySelector("#records-table tbody");
const backToStartFromWinButton = document.getElementById("back-to-start-from-win-button");


const maps = [
    // Fase 1
    [
        "##########",
        "# S      #", // Adicionado 'S' para o início
        "#  ####  #",
        "#  #  #  #",
        "#  # G   #",
        "#  #  #  #",
        "#  ####  #",
        "#        #",
        "##########"
    ],
    // Fase 2
    [
        "############",
        "# S        #", // Adicionado 'S' para o início
        "# ##########",
        "# #        #",
        "# ## ##### #",
        "# #  #   # #",
        "# #  #G  # #",
        "# ####   # #",
        "#          #",
        "############"
    ],
    // Fase 3
    [
        "##############",
        "# S          #",
        "## ###########",
        "#  #         #",
        "#  #### ###  #",
        "#    # #     #",
        "#### # #     #",
        "#    # ###   #",
        "# ### #      #",
        "# #  #####   #",
        "#G#          #",
        "##############"
    ],
    // Fase 4: O Corredor Estreito (já com S e G separados)
   
    [



        "##############",



        "# S          #",



        "## ###########",



        "#  #         #",



        "#  ##### ### #",



        "#    #   #   #",



        "#### # ### # #",



        "#    #   # # #",



        "# #### ### # #",



        "# #        # #",



        "# ########## #",



        "#            #",



        "############G#"



    ],
    // Fase 5: A Teia de Aranha (já com S e G separados)
    [

        "##################",

        "# S              #",

        "## ############# #",

        "#  #           # #",

        "#  ### # # ### # #",

        "#    # # # #   # #",

        "#### # # # ### # #",

        "#  # # # # #   # #",

        "#  # ### # # ### #",

        "#  #     # # #   #",

        "########## # # ###",

        "#          #     #",

        "############# ## #",

        "# #              #",

        "# #############  #",

        "#G               #",

        "##################"

    ]

];
let currentLevel = 0;
let playerPos = { x: 0, y: 0 };
let moveCount = 0;
let startTime;
let timerInterval;
let totalTimeElapsed = 0; // Para acumular o tempo total das fases

function initPlayerPos() {
    for (let y = 0; y < maps[currentLevel].length; y++) {
        for (let x = 0; x < maps[currentLevel][y].length; x++) {
            // Primeiro, procura pelo caractere 'S' (Start)
            if (maps[currentLevel][y][x] === 'S') {
                return { x, y };
            }
        }
    }
    // Fallback: Se 'S' não for encontrado, procura pelo primeiro espaço vazio.
    for (let y = 0; y < maps[currentLevel].length; y++) {
        for (let x = 0; x < maps[currentLevel][y].length; x++) {
            if (maps[currentLevel][y][x] === ' ') {
                return { x, y };
            }
        }
    }
    // Último recurso: Se nem 'S' nem ' ' forem encontrados, retorna uma posição padrão.
    console.warn("Nenhum ponto de início ('S' ou ' ') encontrado no mapa. Usando (1,1).");
    return { x: 1, y: 1 };
}

function updateMoveCount(amount) {
    moveCount += amount;
    moveCountSpan.textContent = moveCount;
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        timerSpan.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function stopTimer() {
    clearInterval(timerInterval);
    const elapsedTime = Date.now() - startTime;
    totalTimeElapsed += elapsedTime;
}

function formatTime(milliseconds) {
    if (isNaN(milliseconds) || milliseconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function drawMap() {
    game.innerHTML = "";
    const currentMap = maps[currentLevel];
    game.style.gridTemplateColumns = `repeat(${currentMap[0].length}, 40px)`;
    game.style.gridTemplateRows = `repeat(${currentMap.length}, 40px)`;

    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (x === playerPos.x && y === playerPos.y) {
                cell.classList.add("player");
                cell.textContent = "🟦";
            } else if (currentMap[y][x] === "#") {
                cell.classList.add("wall");
            } else if (currentMap[y][x] === "R") { // Renderiza paredes vermelhas
                cell.classList.add("wall", "red-wall"); // Adiciona ambas as classes
            } else if (currentMap[y][x] === "G") {
                cell.classList.add("goal");
                cell.textContent = "🏁";
            } else if (currentMap[y][x] === "S") {
                // Se não for a posição do jogador, e for um 'S', renderiza como um espaço vazio.
            }

            game.appendChild(cell);
        }
    }
}

function movePlayer(dx, dy) {
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    const currentMap = maps[currentLevel];

    if (newY >= 0 && newY < currentMap.length && newX >= 0 && newX < currentMap[newY].length) {
        // Verifica se a nova posição é uma parede ('#' ou 'R')
        if (currentMap[newY][newX] === "#" || currentMap[newY][newX] === "R") {
            alert("Você bateu em uma parede! O jogo será reiniciado.");
            startGame(); // Reinicia o jogo
            return;
        } else if (currentMap[newY][newX] === "G") {
            // Se for o objetivo
            playerPos.x = newX;
            playerPos.y = newY;
            updateMoveCount(1);
            drawMap();
            stopTimer();
            showWinScreen();
            return;
        }

        // Se não é parede nem objetivo, apenas move
        playerPos.x = newX;
        playerPos.y = newY;
        updateMoveCount(1);
        drawMap();
    }
}

function showScreen(screenToShow) {
    const screens = [startScreen, winScreen, gameContainer, recordsScreen];
    screens.forEach(screen => {
        if (screen === screenToShow) {
            screen.classList.add("active");
        } else {
            screen.classList.remove("active");
        }
    });
}

function resetGame() {
    playerPos = initPlayerPos();
    moveCount = 0;
    updateMoveCount(0);
    clearInterval(timerInterval);
    timerSpan.textContent = "00:00";
    currentLevelSpan.textContent = currentLevel + 1;
    drawMap();
    showScreen(gameContainer);
    startTimer();
}

function startGame() {
    currentLevel = 0;
    totalTimeElapsed = 0;
    resetGame();
}

function showWinScreen() {
    finalMovesSpan.textContent = moveCount;
    finalTimeSpan.textContent = timerSpan.textContent;

    if (currentLevel < maps.length - 1) {
        nextLevelButton.style.display = "inline-block";
        restartButton.style.display = "none";
        backToStartFromWinButton.style.display = "none"; // Esconde o botão de voltar ao início se ainda há níveis
    } else {
        nextLevelButton.style.display = "none";
        restartButton.style.display = "inline-block";
        // NOVO: Mostra o botão de voltar ao início apenas no final do jogo
        backToStartFromWinButton.style.display = "inline-block"; 

        setTimeout(() => alert(`Parabéns! Você concluiu todas as ${maps.length} fases!\nSeu tempo total foi: ${formatTime(totalTimeElapsed)}`), 100);
        saveRecord(totalTimeElapsed);
    }
    showScreen(winScreen);
}

function nextLevel() {
    currentLevel++;
    if (currentLevel < maps.length) {
        resetGame();
    } else {
        // Se todas as fases foram concluídas, a showWinScreen já lidou com o alerta e saveRecord
        // A próxima ação é geralmente voltar para a tela inicial ou exibir uma tela final de "parabéns"
        showScreen(startScreen); // Volta para a tela inicial se nextLevel for chamado erroneamente no final
    }
}

// --- Funções de Recorde ---
function getRecords() {
    const records = localStorage.getItem("labirintoRecords");
    try {
        const parsedRecords = records ? JSON.parse(records) : [];
        // Filtra para garantir que apenas recordes válidos (com tempo numérico) sejam retornados
        return parsedRecords.filter(record => typeof record.time === 'number' && !isNaN(record.time));
    } catch (e) {
        console.error("Erro ao carregar recordes do localStorage:", e);
        return [];
    }
}

function saveRecord(timeInMs) {
    const records = getRecords();
    const today = new Date();
    const dateString = today.toLocaleDateString('pt-BR');

    records.push({
        date: dateString,
        time: timeInMs
    });

    // CORRIGIDO: Era b.b.time, agora é b.time
    records.sort((a, b) => a.time - b.time);
    // records = records.slice(0, 10); // Opcional: Manter apenas os 10 melhores

    localStorage.setItem("labirintoRecords", JSON.stringify(records));
    displayRecords();
}

function displayRecords() {
    const records = getRecords();
    recordsTableBody.innerHTML = "";

    if (records.length === 0) {
        const row = recordsTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = "Nenhum recorde registrado ainda.";
        cell.style.textAlign = "center";
        return;
    }

    records.forEach(record => {
        const row = recordsTableBody.insertRow();
        const dateCell = row.insertCell();
        const timeCell = row.insertCell();
        dateCell.textContent = record.date;
        timeCell.textContent = formatTime(record.time);
    });
}

function clearRecords() {
    if (confirm("Tem certeza que deseja limpar todos os recordes?")) {
        localStorage.removeItem("labirintoRecords");
        displayRecords();
        alert("Recordes limpos!");
    }
}

// --- Event Listeners ---
startButton.addEventListener("click", startGame);
nextLevelButton.addEventListener("click", nextLevel);
restartButton.addEventListener("click", startGame);
showRecordsButton.addEventListener("click", () => {
    displayRecords();
    showScreen(recordsScreen);
});
clearRecordsButton.addEventListener("click", clearRecords);
backToStartButton.addEventListener("click", () => showScreen(startScreen));
// Event listener para o botão de voltar ao início da tela de vitória
backToStartFromWinButton.addEventListener("click", () => showScreen(startScreen));


document.addEventListener("keydown", (e) => {
    if (gameContainer.classList.contains("active")) {
        if (e.key === "ArrowUp") movePlayer(0, -1);
        else if (e.key === "ArrowDown") movePlayer(0, 1);
        else if (e.key === "ArrowLeft") movePlayer(-1, 0);
        else if (e.key === "ArrowRight") movePlayer(1, 0);
    }
});

// Inicializa mostrando a tela de início
showScreen(startScreen);