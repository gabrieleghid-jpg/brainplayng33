// Shop Module
class ShopModule {
    constructor() {
        this.products = this.initializeProducts();
        this.userPurchases = this.loadUserPurchases();
    }

    initializeProducts() {
        return {
            // Accessori Avatar
            'glasses-cool': {
                id: 'glasses-cool',
                name: 'Occhiali da Sole Cool',
                price: 50,
                category: 'accessories',
                description: 'Occhiali stile alla moda per il tuo avatar',
                icon: '🕶️',
                owned: false
            },
            'hat-wizard': {
                id: 'hat-wizard',
                name: 'Cappello da Mago',
                price: 100,
                category: 'accessories',
                description: 'Un cappello magico per il tuo avatar',
                icon: '🎩',
                owned: false
            },
            'crown-royal': {
                id: 'crown-royal',
                name: 'Corona Reale',
                price: 200,
                category: 'accessories',
                description: 'Senti come un re con questa corona dorata',
                icon: '👑',
                owned: false
            },
            'headband-ninja': {
                id: 'headband-ninja',
                name: 'Fascia Ninja',
                price: 75,
                category: 'accessories',
                description: 'Stile ninja misterioso per il tuo avatar',
                icon: '🥷',
                owned: false
            },
            
            // Colori Speciali
            'skin-rainbow': {
                id: 'skin-rainbow',
                name: 'Pelle Arcobaleno',
                price: 150,
                category: 'colors',
                description: 'Pelle colorata con tutti i colori dell\'arcobaleno',
                icon: '🌈',
                owned: false
            },
            'hair-golden': {
                id: 'hair-golden',
                name: 'Capelli Dorati',
                price: 120,
                category: 'colors',
                description: 'Capelli splendenti come l\'oro',
                icon: '✨',
                owned: false
            },
            'eyes-glowing': {
                id: 'eyes-glowing',
                name: 'Occhi Luminosi',
                price: 80,
                category: 'colors',
                description: 'Occhi che brillano nel buio',
                icon: '💫',
                owned: false
            },
            
            // Stili Capelli
            'hair-style-mohawk': {
                id: 'hair-style-mohawk',
                name: 'Mohawk Punk',
                price: 90,
                category: 'hairstyles',
                description: 'Stile punk audace per il tuo avatar',
                icon: '🦹',
                owned: false
            },
            'hair-style-braids': {
                id: 'hair-style-braids',
                name: 'Trecce Eleganti',
                price: 110,
                category: 'hairstyles',
                description: 'Trecce sofisticate e eleganti',
                icon: '👩',
                owned: false
            },
            'hair-style-afro': {
                id: 'hair-style-afro',
                name: 'Afro Voluminoso',
                price: 130,
                category: 'hairstyles',
                description: 'Capelli afro stylish e voluminosi',
                icon: '🌳',
                owned: false
            },
            
            // Magliette Speciali
            'shirt-galaxy': {
                id: 'shirt-galaxy',
                name: 'Maglietta Galassia',
                price: 85,
                category: 'shirts',
                description: 'Maglietta con stampa della galassia',
                icon: '🌌',
                owned: false
            },
            'shirt-fire': {
                id: 'shirt-fire',
                name: 'Maglietta Fuoco',
                price: 95,
                category: 'shirts',
                description: 'Maglietta con fiamme stilizzate',
                icon: '🔥',
                owned: false
            },
            'shirt-ice': {
                id: 'shirt-ice',
                name: 'Maglietta Ghiaccio',
                price: 95,
                category: 'shirts',
                description: 'Maglietta con cristalli di ghiaccio',
                icon: '❄️',
                owned: false
            },
            
            // Power-up
            'double-credits-1h': {
                id: 'double-credits-1h',
                name: 'Crediti Doppi 1h',
                price: 300,
                category: 'powerups',
                description: 'Raddoppia i crediti guadagnati per 1 ora',
                icon: '⚡',
                owned: false,
                consumable: true
            },
            'lucky-charm': {
                id: 'lucky-charm',
                name: 'Amuleto Fortunato',
                price: 250,
                category: 'powerups',
                description: 'Aumenta la fortuna nei minigiochi',
                icon: '🍀',
                owned: false,
                consumable: true
            },
            'study-booster': {
                id: 'study-booster',
                name: 'Booster Studio',
                price: 200,
                category: 'powerups',
                description: '+50% crediti bonus nelle attività di studio',
                icon: '📚',
                owned: false,
                consumable: true
            },
            
            // Pacchetti Premium
            'pack-starter': {
                id: 'pack-starter',
                name: 'Pacchetto Starter',
                price: 500,
                category: 'packs',
                description: '5 accessori random + 100 crediti bonus',
                icon: '🎁',
                owned: false,
                consumable: true
            },
            'pack-pro': {
                id: 'pack-pro',
                name: 'Pacchetto Pro',
                price: 1000,
                category: 'packs',
                description: '10 accessori premium + 500 crediti bonus',
                icon: '💎',
                owned: false,
                consumable: true
            },
            
            // Accessori Extra
            'necklace-gold': {
                id: 'necklace-gold',
                name: 'Collana d\'Oro',
                price: 60,
                category: 'accessories',
                description: 'Collana preziosa per il tuo avatar',
                icon: '📿',
                owned: false
            },
            'watch-digital': {
                id: 'watch-digital',
                name: 'Orologio Digitale',
                price: 80,
                category: 'accessories',
                description: 'Orologio smart con display digitale',
                icon: '⌚',
                owned: false
            },
            'backpack-school': {
                id: 'backpack-school',
                name: 'Zaino Scolastico',
                price: 70,
                category: 'accessories',
                description: 'Zaino perfetto per la scuola',
                icon: '🎒',
                owned: false
            },
            'earbuds-wireless': {
                id: 'earbuds-wireless',
                name: 'Cuffie Wireless',
                price: 90,
                category: 'accessories',
                description: 'Cuffie senza fili per ascoltare musica',
                icon: '🎧',
                owned: false
            },
            'ring-diamond': {
                id: 'ring-diamond',
                name: 'Anello Diamante',
                price: 150,
                category: 'accessories',
                description: 'Anello con diamante scintillante',
                icon: '💍',
                owned: false
            },
            'bracelet-friendship': {
                id: 'bracelet-friendship',
                name: 'Bracciale Amicizia',
                price: 45,
                category: 'accessories',
                description: 'Bracciale colorato dell\'amicizia',
                icon: '🔗',
                owned: false
            },
            
            // Magliette Extra
            'hoodie-cool': {
                id: 'hoodie-cool',
                name: 'Felpa con Cappuccio',
                price: 100,
                category: 'shirts',
                description: 'Felpa comoda con cappuccio',
                icon: '🧥',
                owned: false
            },
            'jacket-leather': {
                id: 'jacket-leather',
                name: 'Giubbotto di Pelle',
                price: 180,
                category: 'shirts',
                description: 'Giubbotto elegante in pelle sintetica',
                icon: '🧥',
                owned: false
            },
            'tshirt-vintage': {
                id: 'tshirt-vintage',
                name: 'T-Shirt Vintage',
                price: 65,
                category: 'shirts',
                description: 'T-Shirt stile retrò',
                icon: '👕',
                owned: false
            },
            'polo-sport': {
                id: 'polo-sport',
                name: 'Polo Sport',
                price: 85,
                category: 'shirts',
                description: 'Polo elegante per attività sportive',
                icon: '👔',
                owned: false
            },
            'sweater-winter': {
                id: 'sweater-winter',
                name: 'Maglione Invernale',
                price: 120,
                category: 'shirts',
                description: 'Maglione caldo per l\'inverno',
                icon: '🧤',
                owned: false
            },
            
            // Colori Extra
            'skin-neon': {
                id: 'skin-neon',
                name: 'Pelle Neon',
                price: 200,
                category: 'colors',
                description: 'Pelle fluorescente al neon',
                icon: '🌟',
                owned: false
            },
            'skin-galaxy': {
                id: 'skin-galaxy',
                name: 'Pelle Galassia',
                price: 250,
                category: 'colors',
                description: 'Pelle con effetto galassia',
                icon: '🌌',
                owned: false
            },
            'skin-camouflage': {
                id: 'skin-camouflage',
                name: 'Pelle Camuffaggio',
                price: 180,
                category: 'colors',
                description: 'Pelle mimetica militare',
                icon: '🎯',
                owned: false
            },
            'skin-metallic': {
                id: 'skin-metallic',
                name: 'Pelle Metallica',
                price: 220,
                category: 'colors',
                description: 'Pelle con effetto metallico',
                icon: '⚡',
                owned: false
            },
            'skin-pastel': {
                id: 'skin-pastel',
                name: 'Pelle Pastello',
                price: 160,
                category: 'colors',
                description: 'Pelle con colori pastello delicati',
                icon: '🎨',
                owned: false
            },
            
            // Power-up Extra
            'speed-boost': {
                id: 'speed-boost',
                name: 'Velocità+',
                price: 150,
                category: 'powerups',
                description: 'Aumenta la velocità nei minigiochi',
                icon: '⚡',
                owned: false,
                consumable: true
            },
            'time-freeze': {
                id: 'time-freeze',
                name: 'Tempo Congelato',
                price: 200,
                category: 'powerups',
                description: 'Ferma il tempo per 10 secondi',
                icon: '⏸',
                owned: false,
                consumable: true
            },
            'auto-solve': {
                id: 'auto-solve',
                name: 'Soluzione Automatica',
                price: 500,
                category: 'powerups',
                description: 'Risolve automaticamente un puzzle difficile',
                icon: '🤖',
                owned: false,
                consumable: true
            },
            'double-xp': {
                id: 'double-xp',
                name: 'Esperienza Doppia',
                price: 350,
                category: 'powerups',
                description: 'Raddoppia i punti esperienza',
                icon: '🌟',
                owned: false,
                consumable: true
            },
            'shield-protection': {
                id: 'shield-protection',
                name: 'Scudo Protettivo',
                price: 300,
                category: 'powerups',
                description: 'Protegge da errori nei minigiochi',
                icon: '🛡️',
                owned: false,
                consumable: true
            },
            
            // Pacchetti Extra
            'pack-mega': {
                id: 'pack-mega',
                name: 'Pacchetto Mega',
                price: 2000,
                category: 'packs',
                description: '20 accessori leggendari + 1000 crediti bonus',
                icon: '🏆',
                owned: false,
                consumable: true
            },
            'pack-vip': {
                id: 'pack-vip',
                name: 'Pacchetto VIP',
                price: 5000,
                category: 'packs',
                description: 'Tutti gli accessori + 2000 crediti + status VIP',
                icon: '👑',
                owned: false,
                consumable: true,
                vip: true
            },
            'vip-status': {
                id: 'vip-status',
                name: 'Status VIP',
                price: 10000,
                category: 'vip',
                description: 'Diventa VIP permanente con privilegi esclusivi',
                icon: '👑',
                owned: false,
                consumable: false,
                permanent: true,
                vip: true
            },
            'vip-crown': {
                id: 'vip-crown',
                name: 'Corona VIP Esclusiva',
                price: 2500,
                category: 'vip',
                description: 'Corona dorata con animazioni speciali per utenti VIP',
                icon: '👑',
                owned: false,
                consumable: false,
                vip: true
            },
            'vip-throne': {
                id: 'vip-throne',
                name: 'Trono VIP',
                price: 5000,
                category: 'vip',
                description: 'Trono personale con effetti speciali nella home page',
                icon: '👑',
                owned: false,
                consumable: false,
                vip: true
            }
        };
    }

    loadUserPurchases() {
        try {
            const saved = localStorage.getItem('bp_shop_purchases');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Error loading purchases:', error);
            return {};
        }
    }

    saveUserPurchases() {
        try {
            localStorage.setItem('bp_shop_purchases', JSON.stringify(this.userPurchases));
            return true;
        } catch (error) {
            console.error('Error saving purchases:', error);
            return false;
        }
    }

    getProductsByCategory(category) {
        if (category === 'all') {
            return Object.values(this.products);
        }
        return Object.values(this.products).filter(product => product.category === category);
    }

    getProduct(productId) {
        return this.products[productId];
    }

    isProductOwned(productId) {
        return this.userPurchases[productId] === true;
    }

    purchaseProduct(productId) {
        const product = this.getProduct(productId);
        if (!product) {
            return { success: false, message: 'Prodotto non trovato' };
        }

        // Check if already owned
        if (this.isProductOwned(productId) && !product.consumable) {
            return { success: false, message: 'Hai già questo prodotto' };
        }

        // Check if user has enough credits
        if (!window.CreditsModule.canAfford(product.price)) {
            return { success: false, message: 'Crediti insufficienti' };
        }

        // Process purchase
        const success = window.CreditsModule.spendCrediti(product.price, `Acquisto: ${product.name}`);
        if (!success) {
            return { success: false, message: 'Errore nell\'acquisto' };
        }

        // Mark as owned
        this.userPurchases[productId] = true;
        this.saveUserPurchases();

        // Apply effects
        this.applyProductEffects(product);

        return { 
            success: true, 
            message: `Acquisto completato: ${product.name}`,
            product: product 
        };
    }

    applyProductEffects(product) {
        // Apply effects based on product category
        switch(product.category) {
            case 'accessories':
                if (window.avatarStudioController && window.avatarStudioController.renderer) {
                    // Add accessory to avatar
                    const accessoryType = this.getAccessoryType(product.id);
                    if (accessoryType) {
                        window.avatarStudioController.renderer.toggleAccessory(accessoryType);
                    }
                }
                break;
                
            case 'powerups':
                this.activatePowerUp(product);
                break;
                
            case 'packs':
                this.openPack(product);
                break;
        }
    }

    getAccessoryType(productId) {
        const accessoryMap = {
            'glasses-cool': 'glasses',
            'hat-wizard': 'hat',
            'crown-royal': 'crown',
            'headband-ninja': 'headband'
        };
        return accessoryMap[productId];
    }

    activatePowerUp(product) {
        const duration = this.getPowerUpDuration(product.id);
        const endTime = Date.now() + duration;
        
        localStorage.setItem(`bp_powerup_${product.id}`, endTime.toString());
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess(`${product.name} attivato per ${duration/60000} minuti!`);
        }
    }

    getPowerUpDuration(productId) {
        const durations = {
            'double-credits-1h': 60 * 60 * 1000, // 1 hour
            'lucky-charm': 30 * 60 * 1000, // 30 minutes
            'study-booster': 45 * 60 * 1000 // 45 minutes
        };
        return durations[productId] || 30 * 60 * 1000; // Default 30 minutes
    }

    openPack(product) {
        const items = this.getRandomPackItems(product.id);
        
        items.forEach(item => {
            this.userPurchases[item] = true;
        });
        
        this.saveUserPurchases();
        
        if (window.NotificationsModule) {
            window.NotificationsModule.showSuccess(`Pacchetto ${product.name} aperto! Hai ricevuto: ${items.join(', ')}`);
        }
    }

    getRandomPackItems(packId) {
        const allAccessories = Object.keys(this.products).filter(id => 
            this.products[id].category === 'accessories'
        );
        
        const count = packId === 'pack-starter' ? 5 : 10;
        const items = [];
        
        for (let i = 0; i < count; i++) {
            const randomItem = allAccessories[Math.floor(Math.random() * allAccessories.length)];
            items.push(randomItem);
        }
        
        return items;
    }

    getCategories() {
        return [
            { id: 'all', name: 'Tutti', icon: '🛍️' },
            { id: 'accessories', name: 'Accessori', icon: '👓' },
            { id: 'colors', name: 'Colori', icon: '🎨' },
            { id: 'hairstyles', name: 'Stili Capelli', icon: '💇‍♀️' },
            { id: 'shirts', name: 'Magliette', icon: '👕' },
            { id: 'powerups', name: 'Power-up', icon: '⚡' },
            { id: 'packs', name: 'Pacchetti', icon: '🎁' },
            { id: 'vip', name: '👑 VIP', icon: '👑' }
        ];
    }

    getUserStats() {
        const ownedProducts = Object.keys(this.userPurchases).length;
        const totalProducts = Object.keys(this.products).length;
        const totalSpent = Object.keys(this.userPurchases).reduce((total, productId) => {
            const product = this.getProduct(productId);
            return total + (product ? product.price : 0);
        }, 0);
        
        return {
            ownedProducts,
            totalProducts,
            totalSpent,
            completionRate: Math.round((ownedProducts / totalProducts) * 100)
        };
    }

    refreshProductOwnership() {
        Object.keys(this.products).forEach(productId => {
            this.products[productId].owned = this.isProductOwned(productId);
        });
    }

    equipItem(productId) {
        const product = this.getProduct(productId);
        if (!product) {
            return { success: false, message: 'Prodotto non trovato' };
        }

        if (!this.isProductOwned(productId)) {
            return { success: false, message: 'Devi prima acquistare questo oggetto!' };
        }

        // Carica gli oggetti equipaggiati
        let equippedItems = JSON.parse(localStorage.getItem('equippedItems') || '[]');
        
        // Rimuovi l'oggetto se già equipaggiato
        equippedItems = equippedItems.filter(id => id !== productId);
        
        // Aggiungi il nuovo oggetto
        equippedItems.push(productId);
        
        // Salva
        localStorage.setItem('equippedItems', JSON.stringify(equippedItems));
        
        // Aggiorna lo stato
        this.refreshProductOwnership();
        
        return { success: true, item: product };
    }

    unequipItem(productId) {
        const product = this.getProduct(productId);
        if (!product) {
            return { success: false, message: 'Prodotto non trovato' };
        }

        // Carica gli oggetti equipaggiati
        let equippedItems = JSON.parse(localStorage.getItem('equippedItems') || '[]');
        
        // Rimuovi l'oggetto
        equippedItems = equippedItems.filter(id => id !== productId);
        
        // Salva
        localStorage.setItem('equippedItems', JSON.stringify(equippedItems));
        
        // Aggiorna lo stato
        this.refreshProductOwnership();
        
        return { success: true, item: product };
    }

    getEquippedItems() {
        const equippedIds = JSON.parse(localStorage.getItem('equippedItems') || '[]');
        return equippedIds.map(id => this.getProduct(id)).filter(product => product !== null);
    }

    getOwnedProducts() {
        return Object.keys(this.products)
            .filter(productId => this.isProductOwned(productId))
            .map(productId => ({
                ...this.products[productId],
                equipped: this.isEquipped(productId)
            }));
    }

    isEquipped(productId) {
        const equippedIds = JSON.parse(localStorage.getItem('equippedItems') || '[]');
        return equippedIds.includes(productId);
    }

    isVip() {
        const vipPurchases = Object.keys(this.userPurchases).filter(productId => {
            const product = this.getProduct(productId);
            return product && product.vip;
        });
        return vipPurchases.length > 0;
    }

    hasPermanentVip() {
        return this.userPurchases['vip-status'] === true;
    }

    getVipLevel() {
        if (this.hasPermanentVip()) return 'PERMANENT';
        if (this.isVip()) return 'TEMPORARY';
        return 'NORMAL';
    }

    getVipBadge() {
        const level = this.getVipLevel();
        switch(level) {
            case 'PERMANENT': return '👑';
            case 'TEMPORARY': return '🎖';
            default: return '';
        }
    }
}

// Export for global use
window.ShopModule = ShopModule;
