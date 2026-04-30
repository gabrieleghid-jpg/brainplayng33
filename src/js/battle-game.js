/**
 * Logica Principale Gioco di Combattimento - Stile Slay the Spire
 * Gestione stato di gioco, combattimenti, mappa e progressione
 */

// Stato Globale del Gioco
let gameState = {
    currentAct: 1,
    currentFloor: 1,
    playerHealth: 75,
    maxPlayerHealth: 75,
    playerEnergy: 3,
    maxPlayerEnergy: 3,
    playerBlock: 0,
    credits: 0,
    currentMonster: null,
    currentQuestion: null,
    handCards: [],
    deckCards: [],
    discardCards: [],
    energyThisTurn: 3,
    turnCount: 0,
    inBattle: false,
    onMap: true,
    mapNodes: [],
    currentNode: 0,
    battleLog: []
};

// Inizializzazione Gioco
function initBattleGame() {
    loadGameState();
    generateMap();
    updateUI();
    addLogEntry("Benvenuto nella Mappa della Conoscenza!");
}

// Generazione Mappa
function generateMap() {
    const mapGrid = document.getElementById('mapGrid');
    mapGrid.innerHTML = '';
    gameState.mapNodes = [];
    
    // Genera 15 nodi per atto
    for (let i = 0; i < 15; i++) {
        const node = createMapNode(i);
        gameState.mapNodes.push(node);
        mapGrid.appendChild(node.element);
    }
    
    // Imposta il nodo iniziale come corrente
    gameState.currentNode = 0;
    updateMapDisplay();
}

function createMapNode(index) {
    const nodeElement = document.createElement('div');
    nodeElement.className = 'map-node';
    
    let nodeType = 'normal';
    let emoji = '⚔️';
    
    // Determina tipo di nodo
    if (index === 14) {
        nodeType = 'boss';
        emoji = '👹';
    } else if (index === 3 || index === 8 || index === 12) {
        nodeType = 'shop';
        emoji = '🛍️';
    } else if (Math.random() < 0.3) {
        nodeType = 'treasure';
        emoji = '💎';
    } else {
        nodeType = 'normal';
        emoji = '⚔️';
    }
    
    nodeElement.classList.add(nodeType);
    nodeElement.innerHTML = emoji;
    nodeElement.onclick = () => selectNode(index);
    
    return {
        element: nodeElement,
        type: nodeType,
        index: index,
        completed: false,
        emoji: emoji
    };
}

function selectNode(index) {
    if (index !== gameState.currentNode + 1) return;
    
    gameState.currentNode = index;
    updateMapDisplay();
    
    const node = gameState.mapNodes[index];
    if (node.type === 'normal' || node.type === 'boss') {
        document.getElementById('startBattleBtn').disabled = false;
        addLogEntry(`Nodo selezionato: ${node.emoji} ${node.type}`);
    } else if (node.type === 'shop') {
        openShop();
    } else if (node.type === 'treasure') {
        openTreasure();
    }
}

function updateMapDisplay() {
    gameState.mapNodes.forEach((node, index) => {
        node.element.classList.remove('current', 'completed');
        
        if (index < gameState.currentNode) {
            node.element.classList.add('completed');
        } else if (index === gameState.currentNode) {
            node.element.classList.add('current');
        }
    });
    
    document.getElementById('currentFloor').textContent = gameState.currentFloor;
    document.getElementById('currentAct').textContent = gameState.currentAct;
}

// Sistema di Combattimento
function startBattleFromMap() {
    const currentNode = gameState.mapNodes[gameState.currentNode];
    
    if (currentNode.type === 'normal') {
        const monsterKeys = Object.keys(MONSTER_DATABASE).filter(key => 
            MONSTER_DATABASE[key].category !== 'boss'
        );
        const randomMonster = monsterKeys[Math.floor(Math.random() * monsterKeys.length)];
        startBattle(MONSTER_DATABASE[randomMonster]);
    } else if (currentNode.type === 'boss') {
        startBattle(MONSTER_DATABASE["Esame Finale"]);
    }
}

function startBattle(monster) {
    gameState.currentMonster = {...monster};
    gameState.currentMonster.health = monster.maxHealth;
    gameState.inBattle = true;
    gameState.onMap = false;
    gameState.playerBlock = 0;
    gameState.energyThisTurn = gameState.maxPlayerEnergy;
    gameState.turnCount = 0;
    
    // Inizializza mazzo carte
    initializeDeck();
    drawHand();
    
    // Mostra arena di combattimento
    document.getElementById('gameMap').style.display = 'none';
    document.getElementById('battleArena').style.display = 'grid';
    
    // Aggiorna UI mostro
    updateMonsterUI();
    updatePlayerUI();
    
    addLogEntry(`Inizia il combattimento contro ${monster.name}!`);
    
    // Mostra domanda per iniziare
    setTimeout(() => showQuestion(), 1000);
}

function initializeDeck() {
    // Crea mazzo base con carte disponibili
    gameState.deckCards = [];
    gameState.discardCards = [];
    
    // Aggiungi carte base
    const basicCards = ["Addizione Rapida", "Concentrazione"];
    const commonCards = ["Moltiplicazione Potente", "Studio Intensivo"];
    
    // 3 copie di ogni carta base
    basicCards.forEach(cardName => {
        for (let i = 0; i < 3; i++) {
            gameState.deckCards.push({...CARD_DATABASE[cardName], id: `${cardName}_${i}`});
        }
    });
    
    // 2 copie di ogni carta comune
    commonCards.forEach(cardName => {
        for (let i = 0; i < 2; i++) {
            gameState.deckCards.push({...CARD_DATABASE[cardName], id: `${cardName}_${i}`});
        }
    });
    
    // Mischia il mazzo
    shuffleArray(gameState.deckCards);
}

function drawHand() {
    gameState.handCards = [];
    
    // Pesca 5 carte o fino a esaurimento mazzo
    for (let i = 0; i < 5 && gameState.deckCards.length > 0; i++) {
        gameState.handCards.push(gameState.deckCards.pop());
    }
    
    updateHandDisplay();
}

function updateHandDisplay() {
    const handContainer = document.getElementById('handCards');
    handContainer.innerHTML = '';
    
    gameState.handCards.forEach((card, index) => {
        const cardElement = createCardElement(card, index);
        handContainer.appendChild(cardElement);
    });
    
    updateDeckInfo();
}

function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.className = `card ${card.type}`;
    
    const playable = card.cost <= gameState.energyThisTurn;
    if (playable) {
        cardDiv.classList.add('playable');
    } else {
        cardDiv.classList.add('unplayable');
    }
    
    cardDiv.innerHTML = `
        <div class="card-cost">${card.cost}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-description">${card.description}</div>
        <div class="card-type">${card.type.toUpperCase()}</div>
    `;
    
    cardDiv.onclick = () => playCard(index);
    
    return cardDiv;
}

function playCard(cardIndex) {
    const card = gameState.handCards[cardIndex];
    
    if (card.cost > gameState.energyThisTurn) {
        addLogEntry("Energia insufficiente per giocare questa carta!");
        return;
    }
    
    // Rimuovi carta dalla mano
    gameState.handCards.splice(cardIndex, 1);
    gameState.discardCards.push(card);
    gameState.energyThisTurn -= card.cost;
    
    // Applica effetto carta
    applyCardEffect(card);
    
    // Aggiorna UI
    updateHandDisplay();
    updatePlayerUI();
    
    // Mostra domanda per conferma
    showQuestion();
}

function applyCardEffect(card) {
    switch (card.type) {
        case 'attack':
            addLogEntry(`Giocata carta: ${card.name} - ${card.damage} danni!`);
            break;
        case 'skill':
            gameState.playerBlock += card.block;
            addLogEntry(`Giocata carta: ${card.name} - +${card.block} blocchi!`);
            break;
        case 'power':
            addLogEntry(`Giocata carta: ${card.name} - Effetto permanente attivato!`);
            break;
    }
}

// Sistema Domande
function showQuestion() {
    if (!gameState.currentMonster) return;
    
    const category = gameState.currentMonster.category;
    const difficulty = getDifficultyFromMonster(gameState.currentMonster.difficulty);
    
    const questions = QUESTION_DATABASE[category] && QUESTION_DATABASE[category][difficulty];
    if (!questions || questions.length === 0) {
        // Fallback a matematica facile
        const fallbackQuestions = QUESTION_DATABASE.matematica.facile;
        gameState.currentQuestion = fallbackQuestions[Math.floor(Math.random() * fallbackQuestions.length)];
    } else {
        gameState.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
    }
    
    // Mostra area domanda
    document.getElementById('questionArea').style.display = 'block';
    document.getElementById('questionText').textContent = gameState.currentQuestion.question;
    document.getElementById('answerInput').value = '';
    document.getElementById('answerInput').focus();
    
    // Aggiorna categoria e difficoltà
    updateQuestionCategory();
    
    addLogEntry(`Domanda: ${gameState.currentQuestion.question}`);
}

function updateQuestionCategory() {
    const categoryMap = {
        'matematica': '📐 Matematica',
        'scienze': '🔬 Scienze',
        'storia': '📚 Storia',
        'boss': '🎓 Esame Finale'
    };
    
    const difficultyMap = {
        'facile': 'Facile',
        'medio': 'Medio',
        'difficile': 'Difficile'
    };
    
    const category = gameState.currentMonster.category === 'boss' ? 'boss' : 
                    QUESTION_DATABASE[gameState.currentMonster.category] ? gameState.currentMonster.category : 'matematica';
    
    document.getElementById('questionCategory').textContent = categoryMap[category] || '📐 Matematica';
    document.getElementById('questionDifficulty').textContent = difficultyMap[gameState.currentQuestion.difficulty] || 'Medio';
}

function getDifficultyFromMonster(monsterDifficulty) {
    const mapping = {
        'facile': 'facile',
        'medio': 'medio',
        'difficile': 'difficile'
    };
    return mapping[monsterDifficulty] || 'medio';
}

function submitAnswer() {
    const userAnswer = document.getElementById('answerInput').value.trim().toLowerCase();
    const correctAnswer = gameState.currentQuestion.answer.toLowerCase();
    
    if (userAnswer === correctAnswer) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer();
    }
    
    // Nascondi area domanda
    document.getElementById('questionArea').style.display = 'none';
}

function handleCorrectAnswer() {
    const damage = BATTLE_CONFIG.DAMAGE.CORRECT_ANSWER * gameState.currentQuestion.difficulty;
    gameState.currentMonster.health -= damage;
    
    addLogEntry(`✅ Risposta corretta! Infligge ${damage} danni a ${gameState.currentMonster.name}`);
    addLogEntry(`💡 ${gameState.currentQuestion.explanation}`);
    
    updateMonsterUI();
    
    // Controlla se mostro è sconfitto
    if (gameState.currentMonster.health <= 0) {
        endBattle(true);
    } else {
        updateMonsterIntent();
    }
}

function handleWrongAnswer() {
    const damage = BATTLE_CONFIG.DAMAGE.WRONG_ANSWER_PENALTY;
    const actualDamage = Math.max(0, damage - gameState.playerBlock);
    gameState.playerHealth -= actualDamage;
    gameState.playerBlock = Math.max(0, gameState.playerBlock - damage);
    
    addLogEntry(`❌ Risposta errata! Subisci ${actualDamage} danni alla concentrazione`);
    addLogEntry(`💡 La risposta corretta era: ${gameState.currentQuestion.answer}`);
    
    updatePlayerUI();
    
    // Controlla se giocatore è sconfitto
    if (gameState.playerHealth <= 0) {
        endBattle(false);
    } else {
        monsterTurn();
    }
}

// Turno Mostro
function monsterTurn() {
    if (!gameState.currentMonster) return;
    
    const intent = gameState.currentMonster.intents[gameState.turnCount % gameState.currentMonster.intents.length];
    
    switch (intent.type) {
        case 'attack':
            const damage = intent.value;
            const actualDamage = Math.max(0, damage - gameState.playerBlock);
            gameState.playerHealth -= actualDamage;
            gameState.playerBlock = Math.max(0, gameState.playerBlock - damage);
            addLogEntry(`👹 ${gameState.currentMonster.name}: ${intent.message} - ${actualDamage} danni!`);
            break;
            
        case 'defend':
            gameState.currentMonster.block = (gameState.currentMonster.block || 0) + intent.value;
            addLogEntry(`👹 ${gameState.currentMonster.name}: ${intent.message} - +${intent.value} blocchi!`);
            break;
            
        case 'buff':
            addLogEntry(`👹 ${gameState.currentMonster.name}: ${intent.message}`);
            break;
    }
    
    updatePlayerUI();
    updateMonsterUI();
    
    // Controlla sconfitta giocatore
    if (gameState.playerHealth <= 0) {
        endBattle(false);
    } else {
        startNewTurn();
    }
}

function updateMonsterIntent() {
    if (!gameState.currentMonster) return;
    
    const intent = gameState.currentMonster.intents[gameState.turnCount % gameState.currentMonster.intents.length];
    document.getElementById('monsterIntent').textContent = intent.message;
}

function startNewTurn() {
    gameState.turnCount++;
    gameState.energyThisTurn = gameState.maxPlayerEnergy;
    gameState.playerBlock = 0;
    
    // Pesca carte
    if (gameState.deckCards.length === 0) {
        // Ricicla scarti nel mazzo
        gameState.deckCards = [...gameState.discardCards];
        gameState.discardCards = [];
        shuffleArray(gameState.deckCards);
    }
    
    // Pesca fino a 5 carte
    while (gameState.handCards.length < 5 && gameState.deckCards.length > 0) {
        gameState.handCards.push(gameState.deckCards.pop());
    }
    
    updateHandDisplay();
    updatePlayerUI();
    
    // Abilita pulsante termina turno
    document.getElementById('endTurnBtn').disabled = false;
    
    addLogEntry("--- Nuovo Turno ---");
}

function endTurn() {
    if (gameState.handCards.length > 0) {
        addLogEntry("Devi giocare tutte le carte prima di terminare il turno!");
        return;
    }
    
    document.getElementById('endTurnBtn').disabled = true;
    monsterTurn();
}

// Fine Combattimento
function endBattle(victory) {
    gameState.inBattle = false;
    
    if (victory) {
        // Vittoria
        const credits = gameState.currentMonster.rewards.credits;
        const cards = gameState.currentMonster.rewards.cards;
        
        gameState.credits += credits;
        
        document.getElementById('victoryCredits').textContent = credits;
        document.getElementById('victoryCards').textContent = cards;
        document.getElementById('victoryScreen').style.display = 'flex';
        
        addLogEntry(`🎉 Vittoria! Guadagnati ${credits} crediti e ${cards} carte!`);
        
        // Marca nodo come completato
        gameState.mapNodes[gameState.currentNode].completed = true;
        
    } else {
        // Sconfitta
        document.getElementById('defeatScreen').style.display = 'flex';
        addLogEntry("💀 Sconfitta! La concentrazione si è esaurita...");
    }
    
    saveGameState();
}

function continueToNextFloor() {
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('battleArena').style.display = 'none';
    document.getElementById('gameMap').style.display = 'block';
    
    gameState.currentFloor++;
    
    if (gameState.currentFloor > 15) {
        // Prossimo atto
        gameState.currentAct++;
        gameState.currentFloor = 1;
        
        if (gameState.currentAct > 3) {
            // Gioco completato
            showGameComplete();
            return;
        }
    }
    
    updateMapDisplay();
    gameState.onMap = true;
    
    addLogEntry(`Avanza al piano ${gameState.currentFloor} dell'Atto ${gameState.currentAct}`);
}

function retryBattle() {
    document.getElementById('defeatScreen').style.display = 'none';
    
    // Resetta salute giocatore
    gameState.playerHealth = gameState.maxPlayerHealth;
    
    // Ricomincia il combattimento
    startBattle(gameState.currentMonster);
}

function backToMap() {
    document.getElementById('victoryScreen').style.display = 'none';
    document.getElementById('defeatScreen').style.display = 'none';
    document.getElementById('battleArena').style.display = 'none';
    document.getElementById('gameMap').style.display = 'block';
    
    gameState.onMap = true;
    updateMapDisplay();
}

// Funzioni UI
function updatePlayerUI() {
    document.getElementById('playerHealth').style.width = `${(gameState.playerHealth / gameState.maxPlayerHealth) * 100}%`;
    document.getElementById('playerHealthText').textContent = gameState.playerHealth;
    document.getElementById('playerMaxHealth').textContent = gameState.maxPlayerHealth;
    
    document.getElementById('playerEnergy').style.width = `${(gameState.energyThisTurn / gameState.maxPlayerEnergy) * 100}%`;
    document.getElementById('playerEnergyText').textContent = gameState.energyThisTurn;
    document.getElementById('playerMaxEnergy').textContent = gameState.maxPlayerEnergy;
}

function updateMonsterUI() {
    if (!gameState.currentMonster) return;
    
    const healthPercent = Math.max(0, (gameState.currentMonster.health / gameState.currentMonster.maxHealth) * 100);
    document.getElementById('monsterHealth').style.width = `${healthPercent}%`;
    document.getElementById('monsterHealthText').textContent = Math.max(0, gameState.currentMonster.health);
    document.getElementById('monsterMaxHealth').textContent = gameState.currentMonster.maxHealth;
    
    document.getElementById('monsterName').textContent = gameState.currentMonster.name;
    document.getElementById('monsterDescription').textContent = gameState.currentMonster.description;
    document.getElementById('monsterEmoji').textContent = gameState.currentMonster.emoji;
}

function updateDeckInfo() {
    document.getElementById('deckCount').textContent = gameState.deckCards.length;
    document.getElementById('discardCount').textContent = gameState.discardCards.length;
}

function addLogEntry(message) {
    const logContent = document.getElementById('combatLog');
    const logEntry = document.createElement('div');
    logEntry.className = 'log-entry';
    logEntry.innerHTML = message;
    
    logContent.appendChild(logEntry);
    logContent.scrollTop = logContent.scrollHeight;
    
    // Mantieni solo ultimi 20 messaggi
    while (logContent.children.length > 20) {
        logContent.removeChild(logContent.firstChild);
    }
}

// Funzioni Utilità
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function saveGameState() {
    localStorage.setItem('battleGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const saved = localStorage.getItem('battleGameState');
    if (saved) {
        const loadedState = JSON.parse(saved);
        Object.assign(gameState, loadedState);
    }
    
    // Carica crediti dal sistema principale
    const mainCredits = localStorage.getItem('crediti') || '0';
    gameState.credits = parseInt(mainCredits);
}

function pauseBattle() {
    // Implementa pausa
    addLogEntry("Gioco in pausa");
}

function fleeBattle() {
    if (confirm("Sei sicuro di voler fuggire? Perderai progressi!")) {
        backToMap();
        addLogEntry("Sei fuggito dal combattimento!");
    }
}

function backToHome() {
    window.location.href = 'home.html';
}

function openShop() {
    addLogEntry("Negozio non ancora implementato");
}

function openTreasure() {
    addLogEntry("Tesoro non ancora implementato");
}

function showGameComplete() {
    alert("Congratulazioni! Hai completato tutti gli atti!");
    backToHome();
}

// Inizializzazione al caricamento
document.addEventListener('DOMContentLoaded', initBattleGame);
