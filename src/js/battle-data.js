/**
 * Database Domande e Mostri - Gioco di Combattimento Didattico
 * Contiene tutte le domande, mostri e dati di gioco
 */

// Database Domande per Categoria
const QUESTION_DATABASE = {
    matematica: {
        facile: [
            {
                question: "Quanto fa 7 + 8?",
                answer: "15",
                explanation: "7 + 8 = 15, somma di base",
                difficulty: 1
            },
            {
                question: "Quanto fa 6 × 4?",
                answer: "24",
                explanation: "6 × 4 = 24, moltiplicazione base",
                difficulty: 1
            },
            {
                question: "Qual è la radice quadrata di 49?",
                answer: "7",
                explanation: "7 × 7 = 49, quindi √49 = 7",
                difficulty: 1
            }
        ],
        medio: [
            {
                question: "Risolvi: 3x + 7 = 22",
                answer: "5",
                explanation: "3x + 7 = 22 → 3x = 15 → x = 5",
                difficulty: 2
            },
            {
                question: "Qual è l'area di un cerchio con raggio 3?",
                answer: "28.27",
                explanation: "A = πr² = π × 9 ≈ 28.27",
                difficulty: 2
            },
            {
                question: "Quanto fa 15% di 200?",
                answer: "30",
                explanation: "200 × 0.15 = 30",
                difficulty: 2
            }
        ],
        difficile: [
            {
                question: "Calcola il limite: lim(x→0) sin(x)/x",
                answer: "1",
                explanation: "Limite fondamentale: lim(x→0) sin(x)/x = 1",
                difficulty: 3
            },
            {
                question: "Risolvi: x² - 5x + 6 = 0",
                answer: "2,3",
                explanation: "x² - 5x + 6 = (x-2)(x-3) = 0 → x = 2, 3",
                difficulty: 3
            },
            {
                question: "Qual è la derivata di x³ + 2x?",
                answer: "3x² + 2",
                explanation: "d/dx (x³ + 2x) = 3x² + 2",
                difficulty: 3
            }
        ]
    },
    scienze: {
        facile: [
            {
                question: "Quanti pianeti ci sono nel sistema solare?",
                answer: "8",
                explanation: "8 pianeti: Mercurio, Venere, Terra, Marte, Giove, Saturno, Urano, Nettuno",
                difficulty: 1
            },
            {
                question: "Qual è il simbolo chimico dell'acqua?",
                answer: "H2O",
                explanation: "H₂O: 2 atomi di idrogeno, 1 atomo di ossigeno",
                difficulty: 1
            },
            {
                question: "Quante ossa ha il corpo umano adulto?",
                answer: "206",
                explanation: "Un adulto ha 206 ossa",
                difficulty: 1
            }
        ],
        medio: [
            {
                question: "Qual è la velocità della luce nel vuoto?",
                answer: "300000 km/s",
                explanation: "c ≈ 299.792.458 m/s ≈ 300.000 km/s",
                difficulty: 2
            },
            {
                question: "Cos'è la fotosintesi?",
                answer: "Processo di conversione luce in energia",
                explanation: "Le piante usano luce solare, CO₂ e acqua per produrre glucosio e ossigeno",
                difficulty: 2
            },
            {
                question: "Qual è la terza legge di Newton?",
                answer: "Azione e reazione",
                explanation: "Per ogni azione c'è una reazione uguale e contraria",
                difficulty: 2
            }
        ],
        difficile: [
            {
                question: "Cos'è il principio di indeterminazione di Heisenberg?",
                answer: "Impossibilità di misurare posizione e momento simultaneamente",
                explanation: "Δx·Δp ≥ ℏ/2 - non puoi conoscere esattamente posizione e momento",
                difficulty: 3
            },
            {
                question: "Spiega la seconda legge della termodinamica",
                answer: "L'entropia dell'universo aumenta sempre",
                explanation: "In un sistema isolato, l'entropia non diminuisce mai spontaneamente",
                difficulty: 3
            },
            {
                question: "Cos'è il DNA ricombinante?",
                answer: "DNA combinato da fonti diverse",
                explanation: "Tecnologia che unisce sequenze DNA da organismi diversi",
                difficulty: 3
            }
        ]
    },
    storia: {
        facile: [
            {
                question: "In che anno iniziò la Seconda Guerra Mondiale?",
                answer: "1939",
                explanation: "1 settembre 1939 - invasione della Polonia",
                difficulty: 1
            },
            {
                question: "Chi scoprì l'America?",
                answer: "Cristoforo Colombo",
                explanation: "Cristoforo Colombo raggiunse le Americhe nel 1492",
                difficulty: 1
            },
            {
                question: "Quanto durò l'Impero Romano?",
                answer: "1000 anni",
                explanation: "Circa 1000 anni dal 27 a.C. al 476 d.C.",
                difficulty: 1
            }
        ],
        medio: [
            {
                question: "Cos'era il Rinascimento?",
                answer: "Periodo di rinascita culturale europea",
                explanation: "Movimento culturale tra XIV-XVI secolo con rinnovamento arte, scienza e filosofia",
                difficulty: 2
            },
            {
                question: "Chi fu Leonardo da Vinci?",
                answer: "Artista e scienziato del Rinascimento",
                explanation: "Pittore, scultore, architetto, musicista, scienziato e inventore italiano",
                difficulty: 2
            },
            {
                question: "Cos'era la Rivoluzione Industriale?",
                answer: "Trasformazione tecnologica e sociale",
                explanation: "Periodo di cambiamenti tecnologici e sociali tra XVIII-XIX secolo",
                difficulty: 2
            }
        ],
        difficile: [
            {
                question: "Spiega la caduta dell'Impero Romano d'Occidente",
                answer: "Combinazione di crisi economiche, militari e sociali",
                explanation: "Crisi economica, pressione barbarica, instabilità politica, declino militare",
                difficulty: 3
            },
            {
                question: "Quali furono le cause della Prima Guerra Mondiale?",
                answer: "Nazionalismo, alleanze, militarismo, imperialismo",
                explanation: "Sistema di alleanze, nazionalismo esasperato, corsa agli armamenti, competizione coloniale",
                difficulty: 3
            },
            {
                question: "Cos'era la Guerra Fredda?",
                answer: "Conflitto ideologico USA-URSS senza combattimenti diretti",
                explanation: "Tensione geopolitica tra blocchi capitalistico e comunista dal 1947 al 1991",
                difficulty: 3
            }
        ]
    }
};

// Database Mostri - Concetti Didattici
const MONSTER_DATABASE = {
    // Mostri Matematica
    "Equazione Quadratica": {
        name: "Equazione Quadratica",
        emoji: "📐",
        health: 25,
        maxHealth: 25,
        damage: 8,
        block: 0,
        description: "Un mostro matematico che ti sfida con incognite e coefficienti",
        category: "matematica",
        difficulty: "medio",
        rewards: {
            credits: 12,
            cards: 1
        },
        intents: [
            { type: "attack", value: 8, message: "Prepara un'equazione complessa!" },
            { type: "defend", value: 5, message: "Si difende con formule!" },
            { type: "buff", value: 2, message: "Potenzia i suoi coefficienti!" }
        ]
    },
    
    "Teorema di Pitagora": {
        name: "Teorema di Pitagora",
        emoji: "📏",
        health: 30,
        maxHealth: 30,
        damage: 10,
        block: 3,
        description: "Un guardiano geometrico che misura ogni angolo del campo di battaglia",
        category: "matematica",
        difficulty: "medio",
        rewards: {
            credits: 15,
            cards: 1
        },
        intents: [
            { type: "attack", value: 10, message: "a² + b² = danno!" },
            { type: "defend", value: 7, message: "Costruisce una difesa triangolare!" },
            { type: "attack", value: 12, message: "Ipotenusa il tuo attacco!" }
        ]
    },
    
    // Mostri Scienze
    "Cellula Ribelle": {
        name: "Cellula Ribelle",
        emoji: "🧬",
        health: 20,
        maxHealth: 20,
        damage: 6,
        block: 5,
        description: "Una cellula che si è ribellata al sistema immunitario della conoscenza",
        category: "scienze",
        difficulty: "facile",
        rewards: {
            credits: 10,
            cards: 1
        },
        intents: [
            { type: "attack", value: 6, message: "Attacco mitocondriale!" },
            { type: "buff", value: 1, message: "Attiva la fotosintesi!" },
            { type: "defend", value: 5, message: "Forma una membrana protettiva!" }
        ]
    },
    
    "Atomo Instabile": {
        name: "Atomo Instabile",
        emoji: "⚛️",
        health: 35,
        maxHealth: 35,
        damage: 12,
        block: 0,
        description: "Un atomo radioattivo che emette radiazioni cognitive",
        category: "scienze",
        difficulty: "difficile",
        rewards: {
            credits: 20,
            cards: 2
        },
        intents: [
            { type: "attack", value: 12, message: "Emissione beta!" },
            { type: "attack", value: 15, message: "Decadimento alfa!" },
            { type: "buff", value: 3, message: "Fissione nucleare imminente!" }
        ]
    },
    
    // Mostri Storia
    "Fantasma Romano": {
        name: "Fantasma Romano",
        emoji: "🏛️",
        health: 28,
        maxHealth: 28,
        damage: 9,
        block: 4,
        description: "Lo spirito di un legionario romano che protegge la conoscenza antica",
        category: "storia",
        difficulty: "medio",
        rewards: {
            credits: 14,
            cards: 1
        },
        intents: [
            { type: "attack", value: 9, message: "Carica da legionario!" },
            { type: "defend", value: 6, message: "Forma la testuggine!" },
            { type: "attack", value: 11, message: "Colpo di gladio!" }
        ]
    },
    
    // Boss Finali
    "Esame Finale": {
        name: "Esame Finale",
        emoji: "🎓",
        health: 50,
        maxHealth: 50,
        damage: 15,
        block: 8,
        description: "Il boss finale che mette alla prova tutte le tue conoscenze",
        category: "boss",
        difficulty: "difficile",
        rewards: {
            credits: 50,
            cards: 3
        },
        intents: [
            { type: "attack", value: 15, message: "Domanda a sorpresa!" },
            { type: "defend", value: 10, message: "Tempo scaduto!" },
            { type: "buff", value: 4, message: "Bonus difficoltà!" },
            { type: "attack", value: 20, message: "Domanda impossibile!" }
        ]
    }
};

// Database Carte
const CARD_DATABASE = {
    // Carte Attacco Matematica
    "Addizione Rapida": {
        name: "Addizione Rapida",
        type: "attack",
        rarity: "basic",
        cost: 1,
        damage: 6,
        description: "Infligge 6 danni. Semplice e diretto.",
        category: "matematica"
    },
    
    "Moltiplicazione Potente": {
        name: "Moltiplicazione Potente",
        type: "attack",
        rarity: "common",
        cost: 2,
        damage: 12,
        description: "Infligge 12 danni. Raddoppia l'efficacia.",
        category: "matematica"
    },
    
    "Equazione Devastante": {
        name: "Equazione Devastante",
        type: "attack",
        rarity: "uncommon",
        cost: 3,
        damage: 18,
        description: "Infligge 18 danni. Risolvi per distruggere.",
        category: "matematica"
    },
    
    // Carte Abilità
    "Concentrazione": {
        name: "Concentrazione",
        type: "skill",
        rarity: "basic",
        cost: 1,
        block: 8,
        description: "Ottieni 8 blocchi. Focalizza la mente.",
        category: "generale"
    },
    
    "Studio Intensivo": {
        name: "Studio Intensivo",
        type: "skill",
        rarity: "common",
        cost: 2,
        block: 12,
        description: "Ottieni 12 blocchi. Preparati all'esame.",
        category: "generale"
    },
    
    // Carte Potere
    "Conoscenza Assoluta": {
        name: "Conoscenza Assoluta",
        type: "power",
        rarity: "rare",
        cost: 2,
        description: "All'inizio di ogni turno, ottieni +2 energia.",
        effect: "energy_boost",
        category: "generale"
    },
    
    "Memoria Fotografica": {
        name: "Memoria Fotografica",
        type: "power",
        rarity: "uncommon",
        cost: 1,
        description: "Le tue carte costano 1 in meno per il resto del combattimento.",
        effect: "cost_reduction",
        category: "generale"
    }
};

// Esportazione per uso in altri file
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        QUESTION_DATABASE,
        MONSTER_DATABASE,
        CARD_DATABASE
    };
}
