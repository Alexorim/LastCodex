/**
 * RPG World Cartographer - Standalone Player Map Viewer (LastCodex APK)
 * Read-only, Touch gestures, Cities & Buildings exploration.
 */

const DEFAULT_ICONS = {
  city: '🏰',
  building: '🏛️',
  dungeon: '💀',
  teleport: '🌀',
  celestial_tower: '🗼',
  arena: '⚔️',
  monument: '🗿',
  zone: '🌲',
  poi: '⭐',
  directory: '📁'
};

const TYPE_NAMES_ES = {
  city: 'Ciudad / Asentamiento',
  building: 'Edificio / Servicio',
  dungeon: 'Dungeon / Cueva',
  teleport: 'Portal / Waypoint',
  celestial_tower: 'Torre Celestial',
  arena: 'Arena de Combate',
  monument: 'Monumento',
  zone: 'Región / Zona',
  poi: 'Punto de Interés'
};

class LastCodexMapViewer {
  constructor() {
    this.projectName = "Hero of Aethric";
    this.mapImagePath = "proyects/Hero of Aethric/map.png";
    this.items = [];
    this.selectedItem = null;
    this.activeCity = null;

    // Filters
    this.searchQuery = "";
    this.selectedTier = "all";
    this.selectedType = "all";

    // World Map Pan & Zoom
    this.scale = 1;
    this.panX = 0;
    this.panY = 0;
    this.isPanning = false;
    this.startPanX = 0;
    this.startPanY = 0;
    this.touchStartPos = { x: 0, y: 0 };
    this.isPinching = false;
    this.initialPinchDistance = 0;
    this.initialPinchScale = 1;

    // City Map Pan & Zoom
    this.cityScale = 1;
    this.cityPanX = 0;
    this.cityPanY = 0;
    this.isCityPanning = false;
    this.startCityPanX = 0;
    this.startCityPanY = 0;
    this.cityTouchStartPos = { x: 0, y: 0 };
    this.isCityPinching = false;
    this.initialCityPinchDistance = 0;
    this.initialCityPinchScale = 1;

    this.initElements();
    this.setupEventListeners();
    this.loadProjectData();
  }

  initElements() {
    // Top Bar
    this.searchInput = document.getElementById('searchInput');
    this.tierChips = document.querySelectorAll('.tier-chip');
    this.typeChips = document.querySelectorAll('.type-chip');

    // World Map Viewport
    this.mapViewport = document.getElementById('mapViewport');
    this.mapStage = document.getElementById('mapStage');
    this.worldMapImg = document.getElementById('worldMapImg');
    this.markersLayer = document.getElementById('markersLayer');

    // Zoom HUD
    this.btnZoomIn = document.getElementById('btnZoomIn');
    this.btnZoomOut = document.getElementById('btnZoomOut');
    this.btnZoomReset = document.getElementById('btnZoomReset');

    // Detail Drawer
    this.detailDrawer = document.getElementById('detailDrawer');
    this.drawerCloseBtn = document.getElementById('drawerCloseBtn');
    this.drawerIconBox = document.getElementById('drawerIconBox');
    this.drawerTitle = document.getElementById('drawerTitle');
    this.drawerBadgeType = document.getElementById('drawerBadgeType');
    this.drawerBadgeTier = document.getElementById('drawerBadgeTier');
    this.drawerBadgeLevel = document.getElementById('drawerBadgeLevel');
    this.drawerLore = document.getElementById('drawerLore');
    this.drawerDetailsText = document.getElementById('drawerDetailsText');
    this.drawerDetailsRow = document.getElementById('drawerDetailsRow');
    this.drawerBuildingsSection = document.getElementById('drawerBuildingsSection');
    this.drawerBuildingsGrid = document.getElementById('drawerBuildingsGrid');
    this.btnEnterCity = document.getElementById('btnEnterCity');

    // City View Overlay
    this.cityOverlay = document.getElementById('cityOverlay');
    this.btnBackToWorld = document.getElementById('btnBackToWorld');
    this.cityTitleText = document.getElementById('cityTitleText');
    this.cityBldCount = document.getElementById('cityBldCount');
    this.cityViewport = document.getElementById('cityViewport');
    this.cityStage = document.getElementById('cityStage');
    this.cityMapImg = document.getElementById('cityMapImg');
    this.cityMarkersLayer = document.getElementById('cityMarkersLayer');
  }

  setupEventListeners() {
    // Search
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.searchQuery = (e.target.value || '').trim().toLowerCase();
        this.renderWorldMarkers();
      });
    }

    // Filter Chips
    this.tierChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.tierChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedTier = chip.dataset.tier;
        this.renderWorldMarkers();
      });
    });

    this.typeChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.typeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedType = chip.dataset.type;
        this.renderWorldMarkers();
      });
    });

    // Zoom Buttons
    if (this.btnZoomIn) this.btnZoomIn.addEventListener('click', () => this.zoomWorld(1.3));
    if (this.btnZoomOut) this.btnZoomOut.addEventListener('click', () => this.zoomWorld(0.77));
    if (this.btnZoomReset) this.btnZoomReset.addEventListener('click', () => this.resetWorldView());

    // Drawer Close
    if (this.drawerCloseBtn) {
      this.drawerCloseBtn.addEventListener('click', () => this.closeDrawer());
    }

    // Enter City Button
    if (this.btnEnterCity) {
      this.btnEnterCity.addEventListener('click', () => {
        if (this.selectedItem && this.selectedItem.type === 'city') {
          this.openCity(this.selectedItem);
        }
      });
    }

    // Back from City to World Map
    if (this.btnBackToWorld) {
      this.btnBackToWorld.addEventListener('click', () => this.closeCity());
    }

    // World Map Mouse Events
    this.mapViewport.addEventListener('mousedown', (e) => this.onWorldMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onWorldMouseMove(e));
    window.addEventListener('mouseup', () => this.onWorldMouseUp());
    this.mapViewport.addEventListener('wheel', (e) => this.onWorldWheel(e), { passive: false });

    // World Map Touch Events
    this.mapViewport.addEventListener('touchstart', (e) => this.onWorldTouchStart(e), { passive: false });
    this.mapViewport.addEventListener('touchmove', (e) => this.onWorldTouchMove(e), { passive: false });
    this.mapViewport.addEventListener('touchend', () => this.onWorldTouchEnd());
    this.mapViewport.addEventListener('touchcancel', () => this.onWorldTouchEnd());

    // City Map Mouse Events
    this.cityViewport.addEventListener('mousedown', (e) => this.onCityMouseDown(e));
    window.addEventListener('mousemove', (e) => this.onCityMouseMove(e));
    window.addEventListener('mouseup', () => this.onCityMouseUp());
    this.cityViewport.addEventListener('wheel', (e) => this.onCityWheel(e), { passive: false });

    // City Map Touch Events
    this.cityViewport.addEventListener('touchstart', (e) => this.onCityTouchStart(e), { passive: false });
    this.cityViewport.addEventListener('touchmove', (e) => this.onCityTouchMove(e), { passive: false });
    this.cityViewport.addEventListener('touchend', () => this.onCityTouchEnd());
    this.cityViewport.addEventListener('touchcancel', () => this.onCityTouchEnd());

    // Window Resize
    window.addEventListener('resize', () => {
      this.clampWorldPan();
      this.updateWorldTransform();
    });

    // Tap outside to close drawer
    this.mapViewport.addEventListener('click', (e) => {
      if (!e.target.closest('.viewer-marker') && !e.target.closest('.detail-drawer')) {
        this.closeDrawer();
      }
    });
  }

  async loadProjectData() {
    let loaded = false;

    // Check pre-loaded global data first (100% offline file:// compatibility)
    if (window.HERO_OF_AETHRIC_DATA && Array.isArray(window.HERO_OF_AETHRIC_DATA.items)) {
      this.items = window.HERO_OF_AETHRIC_DATA.items;
      if (window.HERO_OF_AETHRIC_DATA.mapImage) {
        this.mapImagePath = window.HERO_OF_AETHRIC_DATA.mapImage;
      }
      loaded = true;
    }

    if (!loaded) {
      const candidates = [
        'markers.json',
        'proyects/Hero of Aethric/project.json',
        'project.json'
      ];

      for (const file of candidates) {
        try {
          const res = await fetch(file);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data.items) && data.items.length > 0) {
              this.items = data.items;
              if (data.mapImage) {
                this.mapImagePath = data.mapImage;
              }
              loaded = true;
              break;
            }
          }
        } catch (err) {
          // Continue to next candidate
        }
      }
    }

    // Set Map Image
    this.worldMapImg.onload = () => {
      this.resetWorldView();
      this.renderWorldMarkers();
    };
    this.worldMapImg.src = this.mapImagePath;
  }

  /* =========================================================
     World Map Pan & Zoom Logic
     ========================================================= */
  resetWorldView() {
    if (!this.worldMapImg.naturalWidth) return;
    const vpW = this.mapViewport.clientWidth;
    const vpH = this.mapViewport.clientHeight;
    const imgW = this.worldMapImg.naturalWidth || 2048;
    const imgH = this.worldMapImg.naturalHeight || 2048;

    // Scale to fit screen comfortably
    const scaleX = vpW / imgW;
    const scaleY = vpH / imgH;
    this.scale = Math.max(scaleX, scaleY) * 0.9;
    if (this.scale > 1.2) this.scale = 1;
    if (this.scale < 0.25) this.scale = 0.25;

    this.panX = (vpW - imgW * this.scale) / 2;
    this.panY = (vpH - imgH * this.scale) / 2;
    this.clampWorldPan();
    this.updateWorldTransform();
  }

  zoomWorld(factor) {
    const newScale = Math.max(0.18, Math.min(4.5, this.scale * factor));
    const vpW = this.mapViewport.clientWidth;
    const vpH = this.mapViewport.clientHeight;
    const centerX = vpW / 2;
    const centerY = vpH / 2;

    this.panX = centerX - (centerX - this.panX) * (newScale / this.scale);
    this.panY = centerY - (centerY - this.panY) * (newScale / this.scale);
    this.scale = newScale;
    this.clampWorldPan();
    this.updateWorldTransform();
  }

  clampWorldPan() {
    const vpW = this.mapViewport.clientWidth;
    const vpH = this.mapViewport.clientHeight;
    const imgW = (this.worldMapImg.naturalWidth || 2048) * this.scale;
    const imgH = (this.worldMapImg.naturalHeight || 2048) * this.scale;

    const minX = vpW - imgW - 200;
    const maxX = 200;
    const minY = vpH - imgH - 200;
    const maxY = 200;

    if (imgW < vpW) {
      this.panX = (vpW - imgW) / 2;
    } else {
      this.panX = Math.max(minX, Math.min(maxX, this.panX));
    }

    if (imgH < vpH) {
      this.panY = (vpH - imgH) / 2;
    } else {
      this.panY = Math.max(minY, Math.min(maxY, this.panY));
    }
  }

  updateWorldTransform() {
    this.mapStage.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.scale})`;
  }

  onWorldMouseDown(e) {
    if (e.button !== 0 && e.button !== 2) return;
    this.isPanning = true;
    this.startPanX = e.clientX - this.panX;
    this.startPanY = e.clientY - this.panY;
    this.mapViewport.classList.add('is-panning');
  }

  onWorldMouseMove(e) {
    if (!this.isPanning) return;
    this.panX = e.clientX - this.startPanX;
    this.panY = e.clientY - this.startPanY;
    this.clampWorldPan();
    this.updateWorldTransform();
  }

  onWorldMouseUp() {
    this.isPanning = false;
    this.mapViewport.classList.remove('is-panning');
  }

  onWorldWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    const rect = this.mapViewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.max(0.18, Math.min(4.5, this.scale * factor));
    this.panX = mouseX - (mouseX - this.panX) * (newScale / this.scale);
    this.panY = mouseY - (mouseY - this.panY) * (newScale / this.scale);
    this.scale = newScale;
    this.clampWorldPan();
    this.updateWorldTransform();
  }

  onWorldTouchStart(e) {
    if (e.touches.length === 1) {
      this.isPanning = true;
      this.isPinching = false;
      const touch = e.touches[0];
      this.startPanX = touch.clientX - this.panX;
      this.startPanY = touch.clientY - this.panY;
    } else if (e.touches.length === 2) {
      this.isPanning = false;
      this.isPinching = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.initialPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      this.initialPinchScale = this.scale;
    }
  }

  onWorldTouchMove(e) {
    if (this.isPanning && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      this.panX = touch.clientX - this.startPanX;
      this.panY = touch.clientY - this.startPanY;
      this.clampWorldPan();
      this.updateWorldTransform();
    } else if (this.isPinching && e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (this.initialPinchDistance > 0) {
        const factor = currentDist / this.initialPinchDistance;
        const newScale = Math.max(0.18, Math.min(4.5, this.initialPinchScale * factor));
        const centerX = (t1.clientX + t2.clientX) / 2;
        const centerY = (t1.clientY + t2.clientY) / 2;

        this.panX = centerX - (centerX - this.panX) * (newScale / this.scale);
        this.panY = centerY - (centerY - this.panY) * (newScale / this.scale);
        this.scale = newScale;
        this.clampWorldPan();
        this.updateWorldTransform();
      }
    }
  }

  onWorldTouchEnd() {
    this.isPanning = false;
    this.isPinching = false;
  }

  /* =========================================================
     World Markers Rendering
     ========================================================= */
  renderWorldMarkers() {
    this.markersLayer.innerHTML = '';

    // Collect all valid markers (exclude directories and buildings inside cities)
    const validMarkers = this.items.filter(item => {
      if (item.type === 'directory') return false;
      
      // If it is a building inside a city, do not show on world map
      if (item.parentId) {
        const parent = this.items.find(p => p.id === item.parentId);
        if (parent && parent.type === 'city') return false;
      }

      // Filter by Tier
      if (this.selectedTier !== 'all' && item.tier !== this.selectedTier) {
        return false;
      }

      // Filter by Type
      if (this.selectedType !== 'all') {
        if (this.selectedType === 'other') {
          if (['city', 'teleport', 'dungeon', 'celestial_tower', 'arena', 'monument'].includes(item.type)) {
            return false;
          }
        } else if (item.type !== this.selectedType) {
          return false;
        }
      }

      // Search Query
      if (this.searchQuery) {
        const name = (item.name || '').toLowerCase();
        const desc = (item.description || '').toLowerCase();
        const details = (item.details || '').toLowerCase();
        if (!name.includes(this.searchQuery) && !desc.includes(this.searchQuery) && !details.includes(this.searchQuery)) {
          return false;
        }
      }

      return true;
    });

    validMarkers.forEach(item => {
      const pin = document.createElement('div');
      pin.className = 'viewer-marker';
      pin.dataset.id = item.id;
      pin.style.left = `${item.x}%`;
      pin.style.top = `${item.y}%`;

      const iconContent = this.getIconHTML(item);
      const tierStar = item.tier ? `<span class="marker-tier-stars">${item.tier}</span>` : '';

      pin.innerHTML = `
        <div class="marker-pin-head">
          <div class="marker-icon-content">${iconContent}</div>
          ${tierStar}
        </div>
        <div class="marker-label rpg-font">
          ${item.name || 'Sin nombre'}
          ${item.tier ? `<span class="tier-inline">${item.tier}</span>` : ''}
        </div>
      `;

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectItem(item);
      });

      this.markersLayer.appendChild(pin);
    });
  }

  getIconHTML(item) {
    if (item.customIcon) {
      return `<img src="${item.customIcon}" alt="icon" class="marker-png-img" />`;
    }
    return DEFAULT_ICONS[item.type] || '📍';
  }

  selectItem(item) {
    this.selectedItem = item;

    // Highlight pin
    document.querySelectorAll('.viewer-marker').forEach(m => {
      m.classList.toggle('active', m.dataset.id === item.id);
    });

    // Populate Drawer
    this.drawerIconBox.innerHTML = this.getIconHTML(item);
    this.drawerTitle.textContent = item.name || 'Sin nombre';

    this.drawerBadgeType.textContent = TYPE_NAMES_ES[item.type] || item.type;
    this.drawerBadgeTier.textContent = item.tier || '★1';
    this.drawerBadgeLevel.textContent = item.level ? `Nv. ${item.level}` : '';
    this.drawerBadgeLevel.style.display = item.level ? 'inline-block' : 'none';

    // Lore & Details
    if (item.description && item.description.trim()) {
      this.drawerLore.textContent = `"${item.description}"`;
      this.drawerLore.style.display = 'block';
    } else {
      this.drawerLore.style.display = 'none';
    }

    if (item.details && item.details.trim()) {
      this.drawerDetailsText.textContent = item.details;
      this.drawerDetailsRow.style.display = 'flex';
    } else {
      this.drawerDetailsRow.style.display = 'none';
    }

    // City Specific (Enter city button & interior buildings preview)
    if (item.type === 'city') {
      this.btnEnterCity.style.display = 'flex';

      // Find interior buildings
      const insideBuildings = this.items.filter(b => b.parentId === item.id);
      if (insideBuildings.length > 0) {
        this.drawerBuildingsSection.style.display = 'block';
        this.drawerBuildingsGrid.innerHTML = insideBuildings.map(b => `
          <div class="building-chip">
            <span>${this.getIconHTML(b)}</span>
            <span class="rpg-font">${b.name}</span>
          </div>
        `).join('');
      } else {
        this.drawerBuildingsSection.style.display = 'none';
      }
    } else {
      this.btnEnterCity.style.display = 'none';
      this.drawerBuildingsSection.style.display = 'none';
    }

    this.detailDrawer.classList.add('open');
  }

  closeDrawer() {
    this.detailDrawer.classList.remove('open');
    this.selectedItem = null;
    document.querySelectorAll('.viewer-marker').forEach(m => m.classList.remove('active'));
    document.querySelectorAll('.city-building-pin').forEach(m => m.classList.remove('active'));
  }

  /* =========================================================
     City Interior View
     ========================================================= */
  openCity(city) {
    this.activeCity = city;
    this.closeDrawer();

    this.cityTitleText.textContent = `${city.name} (${city.tier || '★1'})`;

    // Count buildings
    const cityBuildings = this.items.filter(b => b.parentId === city.id);
    this.cityBldCount.textContent = `${cityBuildings.length} Edificios`;

    // Load City Image
    const mapSrc = city.cityMapImage || 'proyects/Hero of Aethric/map.png';
    this.cityMapImg.onload = () => {
      this.resetCityView();
      this.renderCityBuildings(cityBuildings);
    };
    this.cityMapImg.src = mapSrc;

    this.cityOverlay.classList.add('active');
  }

  closeCity() {
    this.cityOverlay.classList.remove('active');
    this.activeCity = null;
    this.closeDrawer();
  }

  resetCityView() {
    const vpW = this.cityViewport.clientWidth;
    const vpH = this.cityViewport.clientHeight;
    const imgW = this.cityMapImg.naturalWidth || 1024;
    const imgH = this.cityMapImg.naturalHeight || 1024;

    const scaleX = vpW / imgW;
    const scaleY = vpH / imgH;
    this.cityScale = Math.max(scaleX, scaleY) * 0.95;
    if (this.cityScale > 1.5) this.cityScale = 1.2;
    if (this.cityScale < 0.3) this.cityScale = 0.3;

    this.cityPanX = (vpW - imgW * this.cityScale) / 2;
    this.cityPanY = (vpH - imgH * this.cityScale) / 2;
    this.updateCityTransform();
  }

  updateCityTransform() {
    this.cityStage.style.transform = `translate3d(${this.cityPanX}px, ${this.cityPanY}px, 0) scale(${this.cityScale})`;
  }

  renderCityBuildings(buildings) {
    this.cityMarkersLayer.innerHTML = '';

    buildings.forEach(bld => {
      const pin = document.createElement('div');
      pin.className = 'city-building-pin';
      pin.dataset.id = bld.id;
      pin.style.left = `${bld.x}%`;
      pin.style.top = `${bld.y}%`;

      const iconContent = this.getIconHTML(bld);

      pin.innerHTML = `
        <div class="bld-pin-head">
          <div class="bld-pin-icon">${iconContent}</div>
        </div>
        <div class="bld-label rpg-font">
          ${bld.name || 'Edificio'}
          ${bld.tier ? `<span class="tier-inline" style="color:#fbbf24">${bld.tier}</span>` : ''}
        </div>
      `;

      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectCityBuilding(bld);
      });

      this.cityMarkersLayer.appendChild(pin);
    });
  }

  selectCityBuilding(bld) {
    document.querySelectorAll('.city-building-pin').forEach(m => {
      m.classList.toggle('active', m.dataset.id === bld.id);
    });

    // Populate drawer with building details
    this.drawerIconBox.innerHTML = this.getIconHTML(bld);
    this.drawerTitle.textContent = bld.name || 'Edificio';

    this.drawerBadgeType.textContent = TYPE_NAMES_ES[bld.type] || 'Edificio';
    this.drawerBadgeTier.textContent = bld.tier || '★1';
    this.drawerBadgeLevel.textContent = bld.level ? `Nv. ${bld.level}` : '';
    this.drawerBadgeLevel.style.display = bld.level ? 'inline-block' : 'none';

    if (bld.description && bld.description.trim()) {
      this.drawerLore.textContent = `"${bld.description}"`;
      this.drawerLore.style.display = 'block';
    } else {
      this.drawerLore.style.display = 'none';
    }

    if (bld.details && bld.details.trim()) {
      this.drawerDetailsText.textContent = bld.details;
      this.drawerDetailsRow.style.display = 'flex';
    } else {
      this.drawerDetailsRow.style.display = 'none';
    }

    this.btnEnterCity.style.display = 'none';
    this.drawerBuildingsSection.style.display = 'none';

    this.detailDrawer.classList.add('open');
  }

  /* City Pan & Zoom Events */
  onCityMouseDown(e) {
    if (e.button !== 0 && e.button !== 2) return;
    this.isCityPanning = true;
    this.startCityPanX = e.clientX - this.cityPanX;
    this.startCityPanY = e.clientY - this.cityPanY;
  }

  onCityMouseMove(e) {
    if (!this.isCityPanning) return;
    this.cityPanX = e.clientX - this.startCityPanX;
    this.cityPanY = e.clientY - this.startCityPanY;
    this.updateCityTransform();
  }

  onCityMouseUp() {
    this.isCityPanning = false;
  }

  onCityWheel(e) {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    const rect = this.cityViewport.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const newScale = Math.max(0.2, Math.min(5, this.cityScale * factor));
    this.cityPanX = mouseX - (mouseX - this.cityPanX) * (newScale / this.cityScale);
    this.cityPanY = mouseY - (mouseY - this.cityPanY) * (newScale / this.cityScale);
    this.cityScale = newScale;
    this.updateCityTransform();
  }

  onCityTouchStart(e) {
    if (e.touches.length === 1) {
      this.isCityPanning = true;
      this.isCityPinching = false;
      const touch = e.touches[0];
      this.startCityPanX = touch.clientX - this.cityPanX;
      this.startCityPanY = touch.clientY - this.cityPanY;
    } else if (e.touches.length === 2) {
      this.isCityPanning = false;
      this.isCityPinching = true;
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      this.initialCityPinchDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      this.initialCityPinchScale = this.cityScale;
    }
  }

  onCityTouchMove(e) {
    if (this.isCityPanning && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      this.cityPanX = touch.clientX - this.startCityPanX;
      this.cityPanY = touch.clientY - this.startCityPanY;
      this.updateCityTransform();
    } else if (this.isCityPinching && e.touches.length === 2) {
      e.preventDefault();
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      if (this.initialCityPinchDistance > 0) {
        const factor = currentDist / this.initialCityPinchDistance;
        const newScale = Math.max(0.2, Math.min(5, this.initialCityPinchScale * factor));
        const centerX = (t1.clientX + t2.clientX) / 2;
        const centerY = (t1.clientY + t2.clientY) / 2;

        this.cityPanX = centerX - (centerX - this.cityPanX) * (newScale / this.cityScale);
        this.cityPanY = centerY - (centerY - this.cityPanY) * (newScale / this.cityScale);
        this.cityScale = newScale;
        this.updateCityTransform();
      }
    }
  }

  onCityTouchEnd() {
    this.isCityPanning = false;
    this.isCityPinching = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.viewerApp = new LastCodexMapViewer();
});
