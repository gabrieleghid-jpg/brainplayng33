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
            { id: 'accessories', name: 'Accessori', icon: '🎭' },
            { id: 'colors', name: 'Colori Speciali', icon: '🎨' },
            { id: 'hairstyles', name: 'Stili Capelli', icon: '💇‍♀️' },
            { id: 'shirts', name: 'Magliette', icon: '👕' },
            { id: 'powerups', name: 'Power-up', icon: '⚡' },
            { id: 'packs', name: 'Pacchetti', icon: '🎁' }
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
}

// Export for global use
window.ShopModule = ShopModule;
