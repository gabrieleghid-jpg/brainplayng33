/**
 * Character Creator Adapter
 * Adatta il codice React di Lovable al progetto BrainPlay (vanilla JS)
 * 
 * Istruzioni:
 * 1. Copia le immagini da Lovable: fonte/risorse/avatar/* → public/assets/avatar/
 * 2. Prendi il codice TSX di CharacterCreator e convertilo in JS usando questa struttura
 */

class CharacterCreatorAdapter {
    constructor(config) {
        this.container = document.querySelector(config.container);
        this.userData = config.userData || {};
        this.onSave = config.onSave || (() => {});
        this.avatarConfig = {
            base: config.initialConfig?.base || 'neutral',
            head: config.initialConfig?.head || null,
            top: config.initialConfig?.top || null,
            bottom: config.initialConfig?.bottom || null,
            accessory: config.initialConfig?.accessory || null
        };
        
        this.init();
    }
    
    init() {
        this.renderUI();
        this.loadAssets();
        this.attachEventListeners();
        this.renderAvatar();
    }
    
    renderUI() {
        this.container.innerHTML = `
            <div class="character-creator-wrapper" style="
                display: grid;
                grid-template-columns: 1fr 350px;
                height: 100vh;
                background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                font-family: 'Segoe UI', system-ui, sans-serif;
            ">
                <!-- Area Preview -->
                <div class="preview-area" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 2rem;
                    position: relative;
                ">
                    <div class="avatar-container" style="
                        width: 300px;
                        height: 400px;
                        background: white;
                        border-radius: 20px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.15);
                        position: relative;
                        overflow: hidden;
                    ">
                        <canvas id="avatarCanvas" width="300" height="400" style="width: 100%; height: 100%;"></canvas>
                    </div>
                    
                    <div class="action-buttons" style="
                        margin-top: 2rem;
                        display: flex;
                        gap: 1rem;
                    ">
                        <button id="randomizeBtn" class="creator-btn secondary">🎲 Random</button>
                        <button id="saveBtn" class="creator-btn primary">💾 Salva Avatar</button>
                        <button id="resetBtn" class="creator-btn secondary">🔄 Reset</button>
                    </div>
                </div>
                
                <!-- Area Selezione -->
                <div class="selection-panel" style="
                    background: white;
                    border-left: 1px solid #e0e0e0;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                ">
                    <!-- Categorie Tabs -->
                    <div class="category-tabs" style="
                        display: flex;
                        background: #f8f9fa;
                        border-bottom: 1px solid #e0e0e0;
                    ">
                        <button class="tab active" data-category="heads">Testa</button>
                        <button class="tab" data-category="tops">Camicie</button>
                        <button class="tab" data-category="bottoms">Pantaloni</button>
                        <button class="tab" data-category="accessories">Accessori</button>
                    </div>
                    
                    <!-- Grid Items -->
                    <div class="items-grid" id="itemsGrid" style="
                        flex: 1;
                        overflow-y: auto;
                        padding: 1rem;
                        display: grid;
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    ">
                        <!-- Items caricati dinamicamente -->
                    </div>
                </div>
            </div>
            
            <style>
                .creator-btn {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    font-size: 1rem;
                }
                
                .creator-btn.primary {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                
                .creator-btn.secondary {
                    background: #e0e0e0;
                    color: #333;
                }
                
                .creator-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                }
                
                .tab {
                    flex: 1;
                    padding: 1rem;
                    border: none;
                    background: transparent;
                    cursor: pointer;
                    font-weight: 600;
                    color: #666;
                    transition: all 0.3s;
                }
                
                .tab.active {
                    color: #667eea;
                    background: white;
                    border-bottom: 3px solid #667eea;
                }
                
                .item-card {
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    padding: 1rem;
                    cursor: pointer;
                    transition: all 0.3s;
                    text-align: center;
                }
                
                .item-card:hover {
                    border-color: #667eea;
                    transform: translateY(-3px);
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .item-card.equipped {
                    border-color: #38ef7d;
                    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                }
                
                .item-preview {
                    width: 60px;
                    height: 60px;
                    margin: 0 auto 0.5rem;
                    object-fit: contain;
                }
                
                .item-name {
                    font-size: 0.85rem;
                    font-weight: 600;
                    color: #333;
                }
            </style>
        `;
        
        this.canvas = this.container.querySelector('#avatarCanvas');
        this.ctx = this.canvas.getContext('2d');
    }
    
    loadAssets() {
        // Carica gli asset disponibili
        // In un caso reale, questi verrebbero dall'API/Supabase
        this.availableItems = {
            heads: [
                { id: 'head-1', name: 'Testa Default', thumbnail: '/assets/avatar/heads/head-1.png' },
                { id: 'head-2', name: 'Testa Felice', thumbnail: '/assets/avatar/heads/head-2.png' },
                { id: 'head-3', name: 'Testa Cool', thumbnail: '/assets/avatar/heads/head-3.png' }
            ],
            tops: [
                { id: 'tshirt-red', name: 'Maglietta Rossa', thumbnail: '/assets/avatar/tops/tshirt-red.png' },
                { id: 'tshirt-blue', name: 'Maglietta Blu', thumbnail: '/assets/avatar/tops/tshirt-blue.png' },
                { id: 'hoodie', name: 'Felpa', thumbnail: '/assets/avatar/tops/hoodie.png' }
            ],
            bottoms: [
                { id: 'jeans', name: 'Jeans', thumbnail: '/assets/avatar/bottoms/jeans.png' },
                { id: 'shorts', name: 'Shorts', thumbnail: '/assets/avatar/bottoms/shorts.png' }
            ],
            accessories: [
                { id: 'glasses', name: 'Occhiali', thumbnail: '/assets/avatar/accessories/glasses.png' },
                { id: 'cap', name: 'Cappellino', thumbnail: '/assets/avatar/accessories/cap.png' },
                { id: 'watch', name: 'Orologio', thumbnail: '/assets/avatar/accessories/watch.png' }
            ]
        };
        
        this.renderItemsGrid('heads');
    }
    
    attachEventListeners() {
        // Tab switching
        this.container.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.container.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.renderItemsGrid(e.target.dataset.category);
            });
        });
        
        // Action buttons
        this.container.querySelector('#randomizeBtn').addEventListener('click', () => this.randomize());
        this.container.querySelector('#saveBtn').addEventListener('click', () => this.save());
        this.container.querySelector('#resetBtn').addEventListener('click', () => this.reset());
    }
    
    renderItemsGrid(category) {
        const grid = this.container.querySelector('#itemsGrid');
        const items = this.availableItems[category] || [];
        
        const configKey = category.slice(0, -1); // 'heads' -> 'head'
        
        grid.innerHTML = items.map(item => {
            const isEquipped = this.avatarConfig[configKey] === item.id;
            
            return `
                <div class="item-card ${isEquipped ? 'equipped' : ''}" 
                     data-item-id="${item.id}" 
                     data-category="${category}"
                     style="${isEquipped ? 'border-color: #38ef7d; background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);' : ''}">
                    <img src="${item.thumbnail}" alt="${item.name}" class="item-preview"
                         style="width: 60px; height: 60px; object-fit: contain;">
                    <div class="item-name">${item.name}</div>
                    ${isEquipped ? '<div style="color: #38ef7d; font-size: 0.8rem;">✓ Indossato</div>' : ''}
                </div>
            `;
        }).join('');
        
        // Attach click handlers
        grid.querySelectorAll('.item-card').forEach(card => {
            card.addEventListener('click', () => {
                const itemId = card.dataset.itemId;
                const cat = card.dataset.category;
                const key = cat.slice(0, -1); // 'heads' -> 'head'
                
                // Toggle selection
                if (this.avatarConfig[key] === itemId) {
                    this.avatarConfig[key] = null; // Remove
                } else {
                    this.avatarConfig[key] = itemId; // Add
                }
                
                this.renderItemsGrid(cat);
                this.renderAvatar();
            });
        });
    }
    
    async renderAvatar() {
        // Clear canvas
        this.ctx.clearRect(0, 0, 300, 400);
        
        // Draw background
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(0, 0, 300, 400);
        
        // Layer order: base -> bottom -> head -> top -> accessory
        const layers = [
            { key: 'base', path: `/assets/avatar/base/body-${this.avatarConfig.base}.png` },
            { key: 'bottom', path: this.avatarConfig.bottom ? `/assets/avatar/bottoms/${this.avatarConfig.bottom}.png` : null },
            { key: 'head', path: this.avatarConfig.head ? `/assets/avatar/heads/${this.avatarConfig.head}.png` : `/assets/avatar/base/head-default.png` },
            { key: 'top', path: this.avatarConfig.top ? `/assets/avatar/tops/${this.avatarConfig.top}.png` : null },
            { key: 'accessory', path: this.avatarConfig.accessory ? `/assets/avatar/accessories/${this.avatarConfig.accessory}.png` : null }
        ];
        
        // Draw each layer
        for (const layer of layers) {
            if (layer.path) {
                try {
                    const img = await this.loadImage(layer.path);
                    this.ctx.drawImage(img, 0, 0, 300, 400);
                } catch (err) {
                    console.warn(`Impossibile caricare: ${layer.path}`);
                }
            }
        }
    }
    
    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
    
    randomize() {
        Object.keys(this.availableItems).forEach(category => {
            const key = category.slice(0, -1);
            const items = this.availableItems[category];
            this.avatarConfig[key] = items[Math.floor(Math.random() * items.length)].id;
        });
        
        this.renderItemsGrid(this.container.querySelector('.tab.active').dataset.category);
        this.renderAvatar();
    }
    
    reset() {
        this.avatarConfig = {
            base: 'neutral',
            head: null,
            top: null,
            bottom: null,
            accessory: null
        };
        
        this.renderItemsGrid(this.container.querySelector('.tab.active').dataset.category);
        this.renderAvatar();
    }
    
    save() {
        // Salva in localStorage
        localStorage.setItem('bp_avatar_config', JSON.stringify(this.avatarConfig));
        
        // Chiama callback
        this.onSave(this.avatarConfig);
        
        // Mostra notifica
        this.showNotification('Avatar salvato con successo! 🎨', 'success');
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' : '#667eea'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// Inizializza globale
window.CharacterCreator = {
    init: (config) => new CharacterCreatorAdapter(config)
};
