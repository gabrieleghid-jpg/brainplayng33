/**
 * Logica Avatar Personalizzabile - Sistema Image Layering
 * Gestione negozio, acquisti, e vestizione dinamica
 */

// Stato Globale Avatar
let avatarState = {
    equippedItems: {
        clothes: "vestito_default",
        hair: "nessun_capello", 
        "head-accessories": "nessun_cappello",
        glasses: "nessun_occhiale"
    },
    ownedItems: new Set(),
    credits: 0,
    currentCategory: "clothes"
};

// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    loadAvatarState();
    loadCredits();
    updateUI();
    renderShopItems();
    renderInventory();
    applyEquippedItems();
});

// Caricamento Stato Avatar
function loadAvatarState() {
    const saved = localStorage.getItem('avatarState');
    if (saved) {
        const data = JSON.parse(saved);
        avatarState.equippedItems = data.equippedItems || avatarState.equippedItems;
        avatarState.ownedItems = new Set(data.ownedItems || []);
    } else {
        // Aggiungi item di default ai posseduti
        const defaults = getDefaultItems();
        Object.values(defaults).forEach(itemId => {
            avatarState.ownedItems.add(itemId);
        });
        saveAvatarState();
    }
}

function saveAvatarState() {
    const data = {
        equippedItems: avatarState.equippedItems,
        ownedItems: Array.from(avatarState.ownedItems)
    };
    localStorage.setItem('avatarState', JSON.stringify(data));
}

// Gestione Crediti
function loadCredits() {
    const credits = localStorage.getItem('crediti') || '0';
    avatarState.credits = parseInt(credits);
    updateCreditsDisplay();
}

function updateCreditsDisplay() {
    document.getElementById('avatarCredits').textContent = avatarState.credits;
    document.getElementById('ownedItems').textContent = avatarState.ownedItems.size;
}

// Sistema Layering - Funzione Principale di Vestizione
function equipItem(itemId, category) {
    if (!avatarState.ownedItems.has(itemId)) {
        showMessage("Devi prima acquistare questo oggetto!", "error");
        return;
    }
    
    // Rimuovi classe equipped dal vecchio item
    const oldItemId = avatarState.equippedItems[category];
    if (oldItemId) {
        const oldElement = document.querySelector(`[data-item-id="${oldItemId}"]`);
        if (oldElement) {
            oldElement.classList.remove('equipped');
        }
    }
    
    // Equipaggia nuovo item
    avatarState.equippedItems[category] = itemId;
    
    // Aggiorna UI
    const newElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (newElement) {
        newElement.classList.add('equipped');
    }
    
    // Applica cambiamento all'avatar tramite Image Layering
    applyItemToAvatar(itemId, category);
    
    // Salva stato
    saveAvatarState();
    
    showMessage(`${getItemById(itemId).name} equipaggiato!`, "success");
}

// Funzione Chiave: Image Layering Dinamico
function applyItemToAvatar(itemId, category) {
    const item = getItemById(itemId);
    if (!item) return;
    
    // Ottieni il layer corrispondente
    const layerElement = document.getElementById(LAYER_MAPPING[category]);
    if (!layerElement) return;
    
    // Aggiungi animazione di transizione
    layerElement.classList.add('layer-transition');
    
    // Cambia dinamicamente la src dell'immagine
    layerElement.src = item.image_url;
    
    // Rimuovi animazione dopo completamento
    setTimeout(() => {
        layerElement.classList.remove('layer-transition');
    }, 500);
    
    // Debug log
    console.log(`Layer ${category}: applicato item ${itemId} con src ${item.image_url}`);
}

// Applica tutti gli item equipaggiati all'inizio
function applyEquippedItems() {
    Object.keys(avatarState.equippedItems).forEach(category => {
        const itemId = avatarState.equippedItems[category];
        if (itemId) {
            applyItemToAvatar(itemId, category);
        }
    });
}

// Sistema Negozio
function renderShopItems() {
    const shopGrid = document.getElementById('shopGrid');
    const items = getItemsByCategory(avatarState.currentCategory);
    
    shopGrid.innerHTML = '';
    
    if (items.length === 0) {
        shopGrid.innerHTML = '<div class="empty-state">Nessun oggetto disponibile</div>';
        return;
    }
    
    items.forEach(item => {
        const itemElement = createShopItemElement(item);
        shopGrid.appendChild(itemElement);
    });
}

function createShopItemElement(item) {
    const div = document.createElement('div');
    div.className = 'shop-item';
    div.dataset.itemId = item.id;
    div.dataset.category = item.category;
    
    // Aggiungi classi di stato
    if (avatarState.ownedItems.has(item.id)) {
        div.classList.add('owned');
    }
    if (avatarState.equippedItems[item.category] === item.id) {
        div.classList.add('equipped');
    }
    
    // Colore rarità
    const rarityColor = RARITY_COLORS[item.rarity] || '#9e9e9e';
    
    div.innerHTML = `
        <div class="shop-item-image" style="background-color: ${rarityColor}20; border: 2px solid ${rarityColor};">
            ${getItemEmoji(item.category)}
        </div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price">${item.price === 0 ? 'GRATIS' : `${item.price} 💰`}</div>
        <div class="shop-item-actions">
            ${createItemActions(item)}
        </div>
        ${avatarState.ownedItems.has(item.id) ? '<div class="item-badge">✓</div>' : ''}
        ${avatarState.equippedItems[item.category] === item.id ? '<div class="item-badge equipped">⚡</div>' : ''}
    `;
    
    return div;
}

function getItemEmoji(category) {
    const emojis = {
        'clothes': '👕',
        'hair': '💇',
        'head-accessories': '🎩',
        'glasses': '👓'
    };
    return emojis[category] || '📦';
}

function createItemActions(item) {
    const isOwned = avatarState.ownedItems.has(item.id);
    const isEquipped = avatarState.equippedItems[item.category] === item.id;
    const canAfford = avatarState.credits >= item.price;
    
    if (isEquipped) {
        return `<button class="shop-item-btn unequip" onclick="unequipItem('${item.id}', '${item.category}')">Rimuovi</button>`;
    } else if (isOwned) {
        return `<button class="shop-item-btn equip" onclick="equipItem('${item.id}', '${item.category}')">Indossa</button>`;
    } else if (item.price === 0) {
        return `<button class="shop-item-btn buy" onclick="buyItem('${item.id}', '${item.category}')">Ottieni</button>`;
    } else if (canAfford) {
        return `<button class="shop-item-btn buy" onclick="buyItem('${item.id}', '${item.category}')">Compra (${item.price} 💰)</button>`;
    } else {
        return `<button class="shop-item-btn buy" disabled>Non hai crediti</button>`;
    }
}

function buyItem(itemId, category) {
    const item = getItemById(itemId);
    if (!item) return;
    
    if (avatarState.credits < item.price) {
        showMessage("Crediti insufficienti!", "error");
        return;
    }
    
    if (avatarState.ownedItems.has(itemId)) {
        showMessage("Possiedi già questo oggetto!", "error");
        return;
    }
    
    // Sottrai crediti
    avatarState.credits -= item.price;
    localStorage.setItem('crediti', avatarState.credits.toString());
    
    // Aggiungi ai posseduti
    avatarState.ownedItems.add(itemId);
    
    // Se è il primo item della categoria, equipaggialo automaticamente
    if (!avatarState.equippedItems[category] || avatarState.equippedItems[category] === getDefaultItems()[category]) {
        equipItem(itemId, category);
    }
    
    // Salva stato
    saveAvatarState();
    
    // Aggiorna UI
    updateCreditsDisplay();
    renderShopItems();
    renderInventory();
    
    showMessage(`${item.name} acquistato!`, "success");
}

function unequipItem(itemId, category) {
    // Torna all'item di default
    const defaults = getDefaultItems();
    const defaultItemId = defaults[category];
    
    if (defaultItemId && avatarState.ownedItems.has(defaultItemId)) {
        equipItem(defaultItemId, category);
    } else {
        // Rimuovi equipaggiamento
        delete avatarState.equippedItems[category];
        
        // Applica immagine vuota
        const layerElement = document.getElementById(LAYER_MAPPING[category]);
        if (layerElement) {
            layerElement.classList.add('layer-transition');
            layerElement.src = `../../public/assets/avatar/nessun_${category.replace('-', '_')}.png`;
            setTimeout(() => {
                layerElement.classList.remove('layer-transition');
            }, 500);
        }
        
        saveAvatarState();
        renderShopItems();
    }
}

// Gestione Categorie
function switchCategory(category) {
    avatarState.currentCategory = category;
    
    // Aggiorna tab attiva
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });
    
    renderShopItems();
}

// Filtro Prodotti
function filterProducts() {
    const showOwnedOnly = document.getElementById('showOwnedOnly').checked;
    const shopItems = document.querySelectorAll('.shop-item');
    
    shopItems.forEach(item => {
        const itemId = item.dataset.itemId;
        const isOwned = avatarState.ownedItems.has(itemId);
        
        if (showOwnedOnly && !isOwned) {
            item.style.display = 'none';
        } else {
            item.style.display = 'block';
        }
    });
}

// Inventario
function renderInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    inventoryGrid.innerHTML = '';
    
    if (avatarState.ownedItems.size === 0) {
        inventoryGrid.innerHTML = '<div class="empty-state">Nessun oggetto posseduto</div>';
        return;
    }
    
    avatarState.ownedItems.forEach(itemId => {
        const item = getItemById(itemId);
        if (item) {
            const itemElement = createInventoryItemElement(item);
            inventoryGrid.appendChild(itemElement);
        }
    });
}

function createInventoryItemElement(item) {
    const div = document.createElement('div');
    div.className = 'inventory-item';
    div.onclick = () => equipItem(item.id, item.category);
    
    const rarityColor = RARITY_COLORS[item.rarity] || '#9e9e9e';
    const isEquipped = avatarState.equippedItems[item.category] === item.id;
    
    div.innerHTML = `
        <div class="inventory-item-image" style="background-color: ${rarityColor}20; border: 2px solid ${rarityColor};">
            ${getItemEmoji(item.category)}
        </div>
        <div class="inventory-item-name">${item.name}</div>
        <div class="inventory-item-category">${item.category}</div>
        ${isEquipped ? '<div class="item-badge equipped">⚡</div>' : ''}
    `;
    
    return div;
}

// Salvataggio Avatar
function saveAvatar() {
    saveAvatarState();
    showMessage("Avatar salvato con successo!", "success");
}

// Sistema Messaggi
function showMessage(message, type = 'info') {
    // Crea elemento messaggio
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
    `;
    
    // Colore basato sul tipo
    const colors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3',
        warning: '#ff9800'
    };
    messageDiv.style.backgroundColor = colors[type] || colors.info;
    
    document.body.appendChild(messageDiv);
    
    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(messageDiv);
        }, 300);
    }, 3000);
}

// CSS Animazioni per messaggi
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Funzione Debug per testare Image Layering
function testImageLayering() {
    console.log('=== TEST IMAGE LAYERING ===');
    console.log('Layer Mapping:', LAYER_MAPPING);
    console.log('Equipped Items:', avatarState.equippedItems);
    
    // Test ogni layer
    Object.keys(LAYER_MAPPING).forEach(category => {
        const layerElement = document.getElementById(LAYER_MAPPING[category]);
        const itemId = avatarState.equippedItems[category];
        const item = getItemById(itemId);
        
        console.log(`Category: ${category}`);
        console.log(`Layer Element:`, layerElement);
        console.log(`Item ID: ${itemId}`);
        console.log(`Item:`, item);
        console.log(`Current src: ${layerElement ? layerElement.src : 'N/A'}`);
        console.log('---');
    });
}

// Aggiungi funzione di debug alla console
window.testImageLayering = testImageLayering;

