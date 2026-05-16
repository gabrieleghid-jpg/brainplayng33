/**
 * WindRider Avatar System
 * Convertito da CharacterForge (React/TypeScript) a JavaScript vanilla
 * per integrazione con BrainPlay
 */

// ============== CONFIGURAZIONE ==============
const CONFIG = {
  STORAGE_KEYS: {
    EQUIPPED: 'wr_guest_equipped',
    OWNED: 'wr_guest_owned',
    CREDITS: 'wr_guest_credits'
  },
  ASSETS_BASE: '/assets/avatar/',
  DEFAULT_CREDITS: 500
};

// ============== TYPES / COSTANTI ==============
const CATEGORY_LABEL = {
  top: 'Top',
  bottom: 'Bottom',
  fullsuit: 'Muta intera',
  board: 'Tavole',
  boom: 'Boma',
  accessory: 'Accessori'
};

const CATEGORY_ORDER = ['top', 'bottom', 'fullsuit', 'board', 'boom', 'accessory'];

// ============== CATALOGO ITEMS ==============
const CATALOG_ITEMS = [
  // DEFAULT (gratis)
  { id: 'base', name: 'Corpo Base', category: 'top', image_path: 'base_body.png', price: 0, is_default: true, z_index: 10 },
  
  // HATS
  { id: 'nessun_cappello', name: 'Nessun Cappello', category: 'accessory', image_path: 'nessun_cappello.png', price: 0, is_default: true, z_index: 30 },
  { id: 'cappello_baseball', name: 'Cappellino Baseball', category: 'accessory', image_path: 'cappello_baseball.png', price: 40, z_index: 30 },
  { id: 'cappello_cowboy', name: 'Cappello Cowboy', category: 'accessory', image_path: 'cappello_cowboy.png', price: 50, z_index: 30 },
  { id: 'cappello_punta', name: 'Cappello a Punta', category: 'accessory', image_path: 'cappello_punta.png', price: 60, z_index: 30 },
  { id: 'elmo_vichingo', name: 'Elmo Vichingo', category: 'accessory', image_path: 'elmo_vichingo.png', price: 80, z_index: 30 }
];

// ============== CLASSE PRINCIPALE ==============
class WindRiderAvatar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = CATALOG_ITEMS;
    this.owned = new Set();
    this.equipped = {};
    this.credits = CONFIG.DEFAULT_CREDITS;
    this.currentTab = 'accessory';
    this.loading = true;
    
    this.init();
  }
  
  async init() {
    this.loadState();
    this.renderUI();
    this.renderAvatar();
    this.renderInventory();
    this.attachEventListeners();
    this.loading = false;
  }
  
  loadState() {
    const ownedRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.OWNED);
    const equippedRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.EQUIPPED);
    const creditsRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.CREDITS);
    
    const defaults = this.items.filter(i => i.is_default).map(i => i.id);
    this.owned = new Set(ownedRaw ? JSON.parse(ownedRaw) : defaults);
    this.equipped = equippedRaw ? JSON.parse(equippedRaw) : { accessory: 'nessun_cappello' };
    this.credits = creditsRaw ? parseInt(creditsRaw, 10) : CONFIG.DEFAULT_CREDITS;
  }
  
  saveState() {
    localStorage.setItem(CONFIG.STORAGE_KEYS.OWNED, JSON.stringify(Array.from(this.owned)));
    localStorage.setItem(CONFIG.STORAGE_KEYS.EQUIPPED, JSON.stringify(this.equipped));
    localStorage.setItem(CONFIG.STORAGE_KEYS.CREDITS, String(this.credits));
  }
  
  equip(category, itemId) {
    this.equipped[category] = itemId;
    this.saveState();
    this.renderAvatar();
    this.renderInventory();
    
    if (itemId) {
      const item = this.items.find(i => i.id === itemId);
      this.showToast(item ? `${item.name} equipaggiato!` : 'Oggetto rimosso');
    }
  }
  
  buy(item) {
    if (this.owned.has(item.id)) {
      return { ok: false, error: 'Già posseduto' };
    }
    if (this.credits < item.price) {
      return { ok: false, error: 'Crediti insufficienti' };
    }
    
    this.credits -= item.price;
    this.owned.add(item.id);
    this.saveState();
    
    return { ok: true };
  }
  
  handleSlotClick(item) {
    if (!this.owned.has(item.id)) {
      const res = this.buy(item);
      if (!res.ok) {
        this.showToast(res.error, 'error');
        return;
      }
      this.showToast(`Acquistato: ${item.name}!`);
    }
    
    if (this.equipped[item.category] === item.id) {
      this.equip(item.category, null);
    } else {
      this.equip(item.category, item.id);
    }
  }
  
  reset() {
    this.equipped = {};
    this.saveState();
    this.renderAvatar();
    this.renderInventory();
    this.showToast('Avatar resettato!');
  }
  
  saveLook() {
    this.showToast('Look salvato! 🏄‍♂️', 'success');
  }
  
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      background: white;
      border: 3px solid var(--ink);
      border-radius: 16px;
      font-weight: 600;
      z-index: 10000;
      animation: slideIn 0.3s ease;
      box-shadow: 0 8px 0 var(--ink);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  renderUI() {
    this.container.innerHTML = `
      <div class="avatar-grid">
        <!-- Avatar Stage -->
        <div class="toon-card" style="padding: 2rem; display: flex; flex-direction: column; align-items: center;">
          <div id="wrStage" style="width: 100%; max-width: 400px; aspect-ratio: 1; background: var(--study-soft); border: 3px solid var(--ink); border-radius: 20px; position: relative; overflow: hidden;"></div>
          <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
            <button class="toon-btn" id="wrResetBtn">↺ Reset</button>
            <button class="toon-btn" style="background: var(--accent); color: white;" id="wrSaveBtn">👕 Salva look</button>
          </div>
        </div>
        
        <!-- Inventory Panel -->
        <div class="toon-card" style="padding: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <h3 style="margin: 0; font-family: 'Fredoka', sans-serif; font-size: 1.5rem;">EQUIPAGGIAMENTO</h3>
            <span style="font-size: 0.9rem; opacity: 0.7;">${this.owned.size} / ${this.items.length} sbloccati</span>
          </div>
          
          <!-- Tabs -->
          <div id="wrTabs" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem;">
            ${CATEGORY_ORDER.map(cat => `
              <button class="toon-btn" style="font-size: 0.85rem; padding: 0.5rem 1rem; ${cat === this.currentTab ? 'background: var(--study); color: white;' : ''}" data-category="${cat}">
                ${CATEGORY_LABEL[cat]}
              </button>
            `).join('')}
          </div>
          
          <!-- Grid -->
          <div id="wrGrid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;"></div>
          
          <p style="margin-top: 1.5rem; font-size: 0.9rem; opacity: 0.7;">
            Clicca uno slot per equipaggiarlo. Gli oggetti bloccati richiedono crediti.
          </p>
        </div>
      </div>
    `;
  }
  
  renderAvatar() {
    const stage = this.container.querySelector('#wrStage');
    
    const equippedItems = Object.entries(this.equipped)
      .map(([cat, id]) => id ? this.items.find(i => i.id === id) : null)
      .filter(Boolean)
      .sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
    
    const fullsuitItem = equippedItems.find(item => item.category === 'fullsuit');
    const hasFullsuit = !!fullsuitItem;
    
    const bodyItems = equippedItems.filter(item => 
      item.category === 'fullsuit' || 
      item.category === 'top' || 
      item.category === 'bottom'
    );
    const overlayItems = equippedItems.filter(item => 
      item.category !== 'fullsuit' && 
      item.category !== 'top' && 
      item.category !== 'bottom'
    );
    
    let layersHtml = '';
    
    if (!hasFullsuit) {
      layersHtml += `<img src="${CONFIG.ASSETS_BASE}base_body.png" alt="Base" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 10;">`;
    }
    
    bodyItems.forEach(item => {
      const zIndex = item.category === 'fullsuit' ? 20 : (item.z_index || 30);
      layersHtml += `<img src="${CONFIG.ASSETS_BASE}${item.image_path}" alt="${item.name}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: ${zIndex};">`;
    });
    
    overlayItems.forEach(item => {
      const zIndex = item.z_index || 50;
      const blendMode = item.id === 'cap' ? 'mix-blend-mode: multiply;' : '';
      layersHtml += `<img src="${CONFIG.ASSETS_BASE}${item.image_path}" alt="${item.name}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: ${zIndex}; ${blendMode}">`;
    });
    
    stage.innerHTML = layersHtml;
  }
  
  renderInventory() {
    const grid = this.container.querySelector('#wrGrid');
    
    const itemsInCategory = this.items.filter(i => i.category === this.currentTab);
    
    grid.innerHTML = itemsInCategory.map(item => {
      const isOwned = this.owned.has(item.id);
      const isEquipped = this.equipped[item.category] === item.id;
      const canAfford = this.credits >= item.price;
      
      return `
        <div class="toon-card" style="aspect-ratio: 1; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1rem; ${isEquipped ? 'border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent);' : ''}" 
             data-item-id="${item.id}"
             title="${item.name}">
          <img src="${CONFIG.ASSETS_BASE}${item.image_path}" alt="${item.name}" style="max-width: 80%; max-height: 80%; object-fit: contain;">
          <div style="margin-top: 0.5rem; font-size: 0.85rem; font-weight: 600;">${item.name}</div>
          ${!isOwned ? `<div style="font-size: 0.75rem; color: ${canAfford ? 'var(--accent)' : '#ef4444'};">🔒 ${item.price} 🪙</div>` : (isEquipped ? '<div style="font-size: 0.75rem; color: var(--accent);">✓ Equipaggiato</div>' : '')}
        </div>
      `;
    }).join('');
    
    grid.querySelectorAll('[data-item-id]').forEach(slot => {
      slot.addEventListener('click', () => {
        const itemId = slot.dataset.itemId;
        const item = this.items.find(i => i.id === itemId);
        if (item) this.handleSlotClick(item);
      });
    });
  }
  
  attachEventListeners() {
    this.container.querySelectorAll('[data-category]').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('[data-category]').forEach(t => {
          t.style.background = '';
          t.style.color = '';
        });
        tab.style.background = 'var(--study)';
        tab.style.color = 'white';
        this.currentTab = tab.dataset.category;
        this.renderInventory();
      });
    });
    
    this.container.querySelector('#wrResetBtn').addEventListener('click', () => this.reset());
    this.container.querySelector('#wrSaveBtn').addEventListener('click', () => this.saveLook());
  }
}

window.WindRiderAvatar = WindRiderAvatar;
