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

const ASSET_MAP = {
  'base_body.png': 'base_body.png',
  'wetsuit_top_red.png': 'wetsuit_top_red.png',
  'wetsuit_top_blue.png': 'wetsuit_top_blue.png',
  'wetsuit_bottom_black.png': 'wetsuit_bottom_black.png',
  'shorts_yellow.png': 'shorts_yellow.png',
  'fullsuit_neon.png': 'fullsuit_neon.png',
  'fullsuit_pro.png': 'fullsuit_pro.png',
  'board_orange.png': 'board_orange.png',
  'board_carbon.png': 'board_carbon.png',
  'boom_classic.png': 'boom_classic.png',
  'glasses_sport.png': 'glasses_sport.png',
  'cap_red.png': 'cap_red.png',
  'cap_red_fixed.png': 'cap_red_fixed.png',
  'sea_bg.jpg': 'sea_bg.jpg'
};

// ============== CATALOGO ITEMS ==============
// Solo cappellino per test layering - le immagini rimangono nella cartella
const CATALOG_ITEMS = [
  // DEFAULT (gratis)
  { id: 'base', name: 'Corpo Base', category: 'top', image_path: 'base_body.png', price: 0, is_default: true, z_index: 10 },
  
  // ACCESSORY - solo cappellino per test (usa versione fixata con trasparenza)
  { id: 'cap', name: 'Berretto Rosso', category: 'accessory', image_path: 'cap_red_fixed.png', price: 40, is_default: false, z_index: 35 }
];

// ============== CLASSE PRINCIPALE ==============
class WindRiderAvatar {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.items = CATALOG_ITEMS;
    this.owned = new Set();
    this.equipped = {};
    this.credits = CONFIG.DEFAULT_CREDITS;
    this.currentTab = 'top';
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
    // Carica dati da localStorage
    const ownedRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.OWNED);
    const equippedRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.EQUIPPED);
    const creditsRaw = localStorage.getItem(CONFIG.STORAGE_KEYS.CREDITS);
    
    // Default: possiedi gli item is_default
    const defaults = this.items.filter(i => i.is_default).map(i => i.id);
    this.owned = new Set(ownedRaw ? JSON.parse(ownedRaw) : defaults);
    this.equipped = equippedRaw ? JSON.parse(equippedRaw) : {};
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
      // Prova ad acquistare
      const res = this.buy(item);
      if (!res.ok) {
        this.showToast(res.error, 'error');
        return;
      }
      this.showToast(`Acquistato: ${item.name}!`);
    }
    
    // Toggle equip
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
    toast.className = `wr-toast wr-toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('wr-toast-hide');
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }
  
  // ============== RENDERING ==============
  renderUI() {
    this.container.innerHTML = `
      <div class="wr-container">
        <!-- Header -->
        <header class="wr-header">
          <div class="wr-brand">
            <div class="wr-logo">✨</div>
            <div>
              <h1 class="wr-title">WINDRIDER</h1>
              <p class="wr-subtitle">CHARACTER CREATOR</p>
            </div>
          </div>
          <div class="wr-credits">
            <span class="wr-coin">🪙</span>
            <span class="wr-credits-value" id="wrCredits">${this.credits}</span>
          </div>
        </header>
        
        <!-- Main Content -->
        <main class="wr-main">
          <!-- Avatar Stage -->
          <section class="wr-stage-section">
            <div class="wr-stage" id="wrStage">
              <!-- Avatar renderizzato qui -->
            </div>
            <div class="wr-actions">
              <button class="wr-btn wr-btn-outline" id="wrResetBtn">
                ↺ Reset
              </button>
              <button class="wr-btn wr-btn-primary" id="wrSaveBtn">
                👕 Salva look
              </button>
            </div>
          </section>
          
          <!-- Inventory Panel -->
          <section class="wr-panel">
            <div class="wr-panel-header">
              <h2 class="wr-panel-title">EQUIPAGGIAMENTO</h2>
              <span class="wr-panel-count">${this.owned.size} / ${this.items.length} sbloccati</span>
            </div>
            
            <!-- Tabs -->
            <div class="wr-tabs" id="wrTabs">
              ${CATEGORY_ORDER.map(cat => `
                <button class="wr-tab ${cat === this.currentTab ? 'active' : ''}" data-category="${cat}">
                  ${CATEGORY_LABEL[cat]}
                </button>
              `).join('')}
            </div>
            
            <!-- Grid -->
            <div class="wr-grid" id="wrGrid">
              <!-- Items renderizzati qui -->
            </div>
            
            <p class="wr-help-text">
              Clicca uno slot per equipaggiarlo. Gli oggetti bloccati richiedono crediti.
            </p>
          </section>
        </main>
      </div>
      
      <style>
        .wr-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #f8fafc;
          font-family: 'Inter', system-ui, sans-serif;
        }
        
        .wr-header {
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        
        .wr-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .wr-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
        }
        
        .wr-title {
          font-size: 1.1rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          margin: 0;
        }
        
        .wr-subtitle {
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          color: #94a3b8;
          margin: 0;
        }
        
        .wr-credits {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.05);
          padding: 0.5rem 1rem;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .wr-coin {
          font-size: 1.1rem;
        }
        
        .wr-credits-value {
          font-weight: 600;
          color: #fbbf24;
          font-variant-numeric: tabular-nums;
        }
        
        .wr-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }
        
        @media (max-width: 1024px) {
          .wr-main {
            grid-template-columns: 1fr;
          }
        }
        
        .wr-stage-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        
        .wr-stage {
          width: 100%;
          max-width: 520px;
          aspect-ratio: 1;
          background: linear-gradient(180deg, rgba(15, 23, 42, 0.3) 0%, rgba(15, 23, 42, 0.6) 100%),
                      url('${CONFIG.ASSETS_BASE}sea_bg.jpg');
          background-size: cover;
          background-position: center;
          border-radius: 24px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255,255,255,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .wr-stage::before {
          content: '';
          position: absolute;
          inset: 0;
          box-shadow: inset 0 0 0 1px rgba(0, 212, 255, 0.2);
          border-radius: 24px;
          pointer-events: none;
        }
        
        .wr-stage::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(15, 23, 42, 0.7) 100%);
          pointer-events: none;
        }
        
        .wr-avatar-stack {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5%;
        }
        
        .wr-avatar-inner {
          position: relative;
          width: 88%;
          aspect-ratio: 1;
          animation: wrFloat 3s ease-in-out infinite;
        }
        
        @keyframes wrFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .wr-avatar-layer {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          pointer-events: none;
        }
        
        .wr-avatar-shadow {
          position: absolute;
          left: 50%;
          bottom: 3%;
          transform: translateX(-50%);
          width: 55%;
          height: 12px;
          background: rgba(0,0,0,0.55);
          border-radius: 50%;
          filter: blur(8px);
          z-index: 1;
        }
        
        .wr-hud {
          position: absolute;
          padding: 0.5rem 0.75rem;
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(4px);
          border-radius: 6px;
          border: 1px solid rgba(0, 212, 255, 0.3);
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          font-weight: 600;
        }
        
        .wr-hud-top {
          top: 12px;
          left: 12px;
          color: #00ff88;
        }
        
        .wr-hud-bottom {
          bottom: 12px;
          right: 12px;
          color: #94a3b8;
        }
        
        .wr-actions {
          margin-top: 1.5rem;
          display: flex;
          gap: 0.75rem;
        }
        
        .wr-btn {
          padding: 0.75rem 1.5rem;
          border-radius: 10px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .wr-btn-primary {
          background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
          color: #0f172a;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
        }
        
        .wr-btn-primary:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        
        .wr-btn-outline {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #f8fafc;
        }
        
        .wr-btn-outline:hover {
          border-color: rgba(255,255,255,0.4);
          background: rgba(255,255,255,0.05);
        }
        
        .wr-panel {
          background: rgba(30, 41, 59, 0.6);
          border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          padding: 1.5rem;
        }
        
        .wr-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        
        .wr-panel-title {
          font-size: 1rem;
          letter-spacing: 0.1em;
          margin: 0;
        }
        
        .wr-panel-count {
          font-size: 0.65rem;
          letter-spacing: 0.15em;
          color: #94a3b8;
        }
        
        .wr-tabs {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          background: rgba(15, 23, 42, 0.5);
          padding: 0.5rem;
          border-radius: 10px;
          margin-bottom: 1rem;
        }
        
        @media (min-width: 640px) {
          .wr-tabs {
            grid-template-columns: repeat(6, 1fr);
          }
        }
        
        .wr-tab {
          padding: 0.75rem 0.5rem;
          background: transparent;
          border: none;
          border-radius: 6px;
          color: #94a3b8;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-transform: uppercase;
        }
        
        .wr-tab:hover {
          color: #f8fafc;
          background: rgba(255,255,255,0.05);
        }
        
        .wr-tab.active {
          background: linear-gradient(135deg, #00d4ff 0%, #00ff88 100%);
          color: #0f172a;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
        }
        
        .wr-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        
        @media (min-width: 640px) {
          .wr-grid {
            grid-template-columns: repeat(4, 1fr);
          }
        }
        
        .wr-slot {
          aspect-ratio: 1;
          background: rgba(15, 23, 42, 0.5);
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.5rem;
        }
        
        .wr-slot:hover {
          border-color: rgba(0, 212, 255, 0.4);
          transform: translateY(-2px);
        }
        
        .wr-slot.owned {
          border-color: rgba(255,255,255,0.2);
        }
        
        .wr-slot.owned:hover {
          border-color: rgba(0, 212, 255, 0.6);
        }
        
        .wr-slot.equipped {
          border-color: #00ff88;
          box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
        
        .wr-slot.locked {
          border-color: rgba(255,255,255,0.05);
        }
        
        .wr-slot.locked:hover {
          border-color: rgba(255,255,255,0.15);
        }
        
        .wr-slot img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: all 0.2s;
        }
        
        .wr-slot.locked img {
          filter: grayscale(100%);
          opacity: 0.5;
        }
        
        .wr-slot:hover.locked img {
          opacity: 0.7;
        }
        
        .wr-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          width: 20px;
          height: 20px;
          background: #00ff88;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.7rem;
          color: #0f172a;
          box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
        }
        
        .wr-price {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 0.25rem 0.5rem;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(4px);
          border-top: 1px solid rgba(255,255,255,0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .wr-lock {
          font-size: 0.7rem;
          opacity: 0.5;
        }
        
        .wr-price-value {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        
        .wr-price-value.affordable {
          color: #00d4ff;
        }
        
        .wr-price-value.expensive {
          color: #ef4444;
        }
        
        .wr-name {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 0.25rem;
          background: linear-gradient(to bottom, rgba(15,23,42,0.9), transparent);
          font-size: 0.6rem;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          opacity: 0;
          transition: opacity 0.2s;
        }
        
        .wr-slot:hover .wr-name {
          opacity: 1;
        }
        
        .wr-help-text {
          font-size: 0.7rem;
          color: #94a3b8;
          line-height: 1.5;
          margin: 0;
        }
        
        .wr-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 10px;
          color: #f8fafc;
          font-weight: 600;
          z-index: 10000;
          animation: wrToastIn 0.3s ease;
          backdrop-filter: blur(10px);
        }
        
        .wr-toast-success {
          border-color: rgba(0, 255, 136, 0.5);
          background: rgba(0, 255, 136, 0.1);
        }
        
        .wr-toast-error {
          border-color: rgba(239, 68, 68, 0.5);
          background: rgba(239, 68, 68, 0.1);
        }
        
        @keyframes wrToastIn {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .wr-toast-hide {
          animation: wrToastOut 0.3s ease forwards;
        }
        
        @keyframes wrToastOut {
          to {
            opacity: 0;
            transform: translateX(100px);
          }
        }
      </style>
    `;
  }
  
  renderAvatar() {
    const stage = this.container.querySelector('#wrStage');
    
    // Ottieni tutti gli items equipaggiati ordinati per z-index (dal più basso al più alto)
    const equippedItems = Object.entries(this.equipped)
      .map(([cat, id]) => id ? this.items.find(i => i.id === id) : null)
      .filter(Boolean)
      .sort((a, b) => (a.z_index || 0) - (b.z_index || 0));
    
    // Controlla se c'è un fullsuit equipaggiato
    const fullsuitItem = equippedItems.find(item => item.category === 'fullsuit');
    const hasFullsuit = !!fullsuitItem;
    
    // Separa items che coprono il corpo da quelli che vanno sopra
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
    
    // Costruisci i layer in ordine corretto
    let layersHtml = '';
    
    // 1. Base body (z-index 10) - solo se non c'è fullsuit
    if (!hasFullsuit) {
      layersHtml += `<img src="${CONFIG.ASSETS_BASE}base_body.png" alt="Base" class="wr-avatar-layer" style="z-index: 10;">`;
    }
    
    // 2. Body items (vestiti) in ordine di z-index
    bodyItems.forEach(item => {
      const zIndex = item.category === 'fullsuit' ? 20 : (item.z_index || 30);
      layersHtml += `<img src="${CONFIG.ASSETS_BASE}${item.image_path}" alt="${item.name}" class="wr-avatar-layer" style="z-index: ${zIndex};">`;
    });
    
    // 3. Overlay items (tavola, accessori, etc.)
    overlayItems.forEach(item => {
      const zIndex = item.z_index || 50;
      // Per il cappello, usa mix-blend-mode per far diventare trasparente il bianco
      const blendMode = item.id === 'cap' ? 'mix-blend-mode: multiply;' : '';
      layersHtml += `<img src="${CONFIG.ASSETS_BASE}${item.image_path}" alt="${item.name}" class="wr-avatar-layer" style="z-index: ${zIndex}; ${blendMode}">`;
    });
    
    stage.innerHTML = `
      <div class="wr-avatar-stack">
        <div class="wr-avatar-inner">
          ${layersHtml}
          <div class="wr-avatar-shadow"></div>
        </div>
      </div>
      <div class="wr-hud wr-hud-top">RIDER · 01</div>
      <div class="wr-hud wr-hud-bottom">T-POSE · LIVE PREVIEW</div>
    `;
  }
  
  renderInventory() {
    const grid = this.container.querySelector('#wrGrid');
    const creditsEl = this.container.querySelector('#wrCredits');
    
    // Aggiorna crediti
    if (creditsEl) creditsEl.textContent = this.credits;
    
    // Filtra items per categoria corrente
    const itemsInCategory = this.items.filter(i => i.category === this.currentTab);
    
    grid.innerHTML = itemsInCategory.map(item => {
      const isOwned = this.owned.has(item.id);
      const isEquipped = this.equipped[item.category] === item.id;
      const canAfford = this.credits >= item.price;
      
      return `
        <div class="wr-slot ${isOwned ? 'owned' : 'locked'} ${isEquipped ? 'equipped' : ''}" 
             data-item-id="${item.id}"
             title="${item.name}">
          ${isEquipped ? '<div class="wr-badge">✓</div>' : ''}
          
          <img src="${CONFIG.ASSETS_BASE}${item.image_path}" alt="${item.name}">
          
          <div class="wr-name">${item.name}</div>
          
          ${!isOwned ? `
            <div class="wr-price">
              <span class="wr-lock">🔒</span>
              <span class="wr-price-value ${canAfford ? 'affordable' : 'expensive'}">${item.price}</span>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
    
    // Attach click handlers
    grid.querySelectorAll('.wr-slot').forEach(slot => {
      slot.addEventListener('click', () => {
        const itemId = slot.dataset.itemId;
        const item = this.items.find(i => i.id === itemId);
        if (item) this.handleSlotClick(item);
      });
    });
  }
  
  attachEventListeners() {
    // Tab switching
    this.container.querySelectorAll('.wr-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.container.querySelectorAll('.wr-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.currentTab = tab.dataset.category;
        this.renderInventory();
      });
    });
    
    // Reset button
    this.container.querySelector('#wrResetBtn').addEventListener('click', () => this.reset());
    
    // Save button
    this.container.querySelector('#wrSaveBtn').addEventListener('click', () => this.saveLook());
  }
}

// Inizializza globale
window.WindRiderAvatar = WindRiderAvatar;
