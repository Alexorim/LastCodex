import { Component, OnInit, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular/lazy';
import { ToastController, LoadingController } from '@ionic/angular';
import { Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import ForceGraph from 'force-graph';
import { marked } from 'marked';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  listOutline,
  gitNetworkOutline,
  syncOutline,
  searchOutline,
  closeCircle,
  scanOutline,
  shareSocialOutline,
  closeOutline,
  arrowForwardCircleOutline,
  arrowBackCircleOutline
} from 'ionicons/icons';
import { VaultService, VaultGraphData, VaultNode } from '../../services/vault.service';

@Component({
  selector: 'app-obsidian-vault',
  templateUrl: './obsidian-vault.page.html',
  styleUrls: ['./obsidian-vault.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class ObsidianVaultPage implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('graphContainer') graphContainerRef!: ElementRef<HTMLDivElement>;

  vaultData: VaultGraphData | null = null;
  filteredNodes: VaultNode[] = [];
  categories: string[] = [];
  selectedCategory: string = 'ALL';

  viewMode: 'graph' | 'list' = 'graph';
  searchQuery: string = '';
  isSyncing: boolean = false;
  currentLang: string = 'es';

  // Selected note state
  selectedNode: VaultNode | null = null;
  selectedNoteHtml: SafeHtml = '';
  incomingLinks: VaultNode[] = [];
  outgoingNodes: VaultNode[] = [];

  private graphInstance: any = null;
  private vaultSub?: Subscription;
  private resizeObserver?: ResizeObserver;

  constructor(
    private vaultService: VaultService,
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    addIcons({
      arrowBackOutline,
      listOutline,
      gitNetworkOutline,
      syncOutline,
      searchOutline,
      closeCircle,
      scanOutline,
      shareSocialOutline,
      closeOutline,
      arrowForwardCircleOutline,
      arrowBackCircleOutline
    });
  }

  async ngOnInit(): Promise<void> {
    const savedLang = localStorage.getItem('lastresources_lang') || 'es';
    this.currentLang = savedLang;

    this.vaultSub = this.vaultService.vaultData$.subscribe(data => {
      if (data) {
        this.vaultData = data;
        this.extractCategories();
        this.applyFilter();
        if (this.viewMode === 'graph') {
          setTimeout(() => this.renderGraph(), 100);
        }
      }
    });

    await this.vaultService.loadVaultData();
  }

  ngAfterViewInit(): void {
    if (this.viewMode === 'graph' && this.vaultData) {
      setTimeout(() => this.renderGraph(), 150);
    }

    if (this.graphContainerRef?.nativeElement) {
      this.resizeObserver = new ResizeObserver(() => {
        if (this.graphInstance && this.graphContainerRef?.nativeElement) {
          const width = this.graphContainerRef.nativeElement.clientWidth;
          const height = this.graphContainerRef.nativeElement.clientHeight;
          if (width > 0 && height > 0) {
            this.graphInstance.width(width).height(height);
          }
        }
      });
      this.resizeObserver.observe(this.graphContainerRef.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.vaultSub?.unsubscribe();
    this.resizeObserver?.disconnect();
    if (this.graphInstance) {
      this.graphInstance._destructor();
      this.graphInstance = null;
    }
  }

  goBack(): void {
    this.router.navigate(['/settings']);
  }

  setViewMode(mode: 'graph' | 'list'): void {
    this.viewMode = mode;
    this.cdr.detectChanges();
    if (mode === 'graph') {
      setTimeout(() => this.renderGraph(), 100);
    }
  }

  extractCategories(): void {
    if (!this.vaultData) return;
    const cats = new Set<string>();
    this.vaultData.nodes.forEach(n => {
      if (n.category) cats.add(n.category);
    });
    this.categories = Array.from(cats).sort();
  }

  applyFilter(): void {
    if (!this.vaultData) {
      this.filteredNodes = [];
      return;
    }

    const query = this.searchQuery.trim().toLowerCase();
    this.filteredNodes = this.vaultData.nodes.filter(node => {
      const matchesCategory = this.selectedCategory === 'ALL' || node.category === this.selectedCategory;
      const matchesQuery = !query ||
        node.title.toLowerCase().includes(query) ||
        node.id.toLowerCase().includes(query) ||
        node.category.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });

    if (this.graphInstance) {
      this.updateGraphHighlights();
    }
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilter();
  }

  renderGraph(): void {
    if (!this.graphContainerRef?.nativeElement || !this.vaultData) return;
    const container = this.graphContainerRef.nativeElement;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || (window.innerHeight - 130);

    const gData = {
      nodes: this.vaultData.nodes.map(n => ({ ...n })),
      links: this.vaultData.links.map(l => ({ ...l }))
    };

    if (this.graphInstance) {
      this.graphInstance._destructor();
      container.innerHTML = '';
    }

    const isSakura = document.body.classList.contains('sakura-theme');
    const isLight = document.body.classList.contains('light-theme');
    const bgColor = isLight ? '#f4ede4' : (isSakura ? '#160d15' : '#0b0c10');

    this.graphInstance = (ForceGraph as any)()(container)
      .graphData(gData)
      .width(width)
      .height(height)
      .backgroundColor(bgColor)
      .nodeId('id')
      .nodeVal((node: any) => {
        return Math.max(1, Math.min(3.5, ((node.links?.length || 1) * 0.3) + 1));
      })
      .nodeLabel((node: any) => {
        return `<div style="background: rgba(15,18,25,0.95); padding: 4px 8px; border-radius: 5px; border: 1px solid #7c3aed; color: #fff; font-size: 11px; font-weight: 600;">${node.title || node.id}</div>`;
      })
      .nodeAutoColorBy('category')
      .nodeCanvasObject((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const query = this.searchQuery.trim().toLowerCase();
        const isMatched = !query ||
          node.title?.toLowerCase().includes(query) ||
          node.id?.toLowerCase().includes(query);
        const isSelected = this.selectedNode && this.selectedNode.id === node.id;

        // Tamaño compacto estilo Obsidian nativo
        const linkCount = node.links?.length || 1;
        const r = isSelected ? 4 : Math.max(1.5, Math.min(3.6, 1.4 + linkCount * 0.22));

        // Punto exterior / brillo sutil
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
        ctx.fillStyle = isSelected ? '#c084fc' : (isMatched ? (node.color || '#8b5cf6') : 'rgba(80, 80, 100, 0.18)');
        if (isSelected) {
          ctx.shadowColor = '#c084fc';
          ctx.shadowBlur = 8;
        } else if (isMatched && query) {
          ctx.shadowColor = node.color || '#8b5cf6';
          ctx.shadowBlur = 4;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Núcleo blanco diminuto solo en nodos destacados o medianos
        if (r > 2.4 || isSelected) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, Math.max(0.6, r * 0.4), 0, 2 * Math.PI, false);
          ctx.fillStyle = '#ffffff';
          ctx.fill();
        }

        // Etiqueta solo con buen nivel de zoom, seleccionado o búsqueda activa
        if (globalScale > 1.8 || isSelected || (query && isMatched)) {
          const label = node.title || node.id;
          const fontSize = Math.max(7 / globalScale, 2.5);
          ctx.font = `${isSelected ? 'bold ' : ''}${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = isSelected ? '#f5d0fe' : (isMatched ? '#cbd5e1' : 'rgba(120, 120, 140, 0.3)');
          ctx.fillText(label, node.x, node.y + r + 1.2);
        }
      })
      .linkColor(() => 'rgba(147, 51, 234, 0.18)')
      .linkWidth(0.6)
      .linkDirectionalParticles(0)
      .onNodeClick((node: any) => {
        this.openNote(node);
      });

    // Ajuste de físicas D3 para que el grafo respire y no se aglomere
    this.graphInstance.d3Force('charge')?.strength(-40);
    this.graphInstance.d3Force('link')?.distance(28);

    // Center view
    setTimeout(() => {
      this.graphInstance?.zoomToFit(400, 40);
    }, 500);
  }

  updateGraphHighlights(): void {
    if (!this.graphInstance) return;
    this.graphInstance.refresh();
  }

  openNote(nodeOrId: VaultNode | string): void {
    if (!this.vaultData) return;
    let node: VaultNode | undefined;
    if (typeof nodeOrId === 'string') {
      node = this.vaultService.getNode(nodeOrId);
    } else {
      node = nodeOrId;
    }

    if (!node) return;
    this.selectedNode = node;

    // Calculate incoming and outgoing links
    this.incomingLinks = this.vaultData.nodes.filter(n =>
      n.links?.some(l => l.toLowerCase() === node!.id.toLowerCase() || l.toLowerCase() === node!.title.toLowerCase())
    );

    this.outgoingNodes = (node.links || [])
      .map(targetName => this.vaultService.getNode(targetName))
      .filter((n): n is VaultNode => !!n);

    // Parse Markdown to HTML
    let md = node.content || '';
    // Strip YAML frontmatter for cleaner reading
    md = md.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '');

    // Replace [[wikilinks]] with custom clickable badges
    md = md.replace(/\[\[(.*?)\]\]/g, (match, linkText) => {
      const parts = linkText.split('|');
      const target = parts[0].trim();
      const display = (parts[1] || parts[0]).trim();
      return `<a class="vault-wikilink" href="javascript:void(0)" data-target="${target}">🔗 ${display}</a>`;
    });

    const parsed = marked.parse(md, { breaks: true, gfm: true }) as string;
    this.selectedNoteHtml = this.sanitizer.bypassSecurityTrustHtml(parsed);

    this.cdr.detectChanges();

    // Center on node if in graph mode
    if (this.graphInstance && (node as any).x !== undefined) {
      this.graphInstance.centerAt((node as any).x, (node as any).y, 500);
      this.graphInstance.zoom(2.2, 500);
    }
  }

  closeNote(): void {
    this.selectedNode = null;
    this.selectedNoteHtml = '';
    this.incomingLinks = [];
    this.outgoingNodes = [];
    this.cdr.detectChanges();
  }

  onReaderContentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const linkEl = target.closest('.vault-wikilink');
    if (linkEl) {
      event.preventDefault();
      const dest = linkEl.getAttribute('data-target');
      if (dest) {
        this.openNote(dest);
      }
    }
  }

  async syncWithGitHub(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;
    this.cdr.detectChanges();

    const loading = await this.loadingCtrl.create({
      message: this.currentLang === 'es' ? 'Sincronizando bóveda con GitHub...' : 'Syncing vault with GitHub...',
      duration: 10000,
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const res = await this.vaultService.syncWithGitHub();
      await loading.dismiss();

      const toast = await this.toastCtrl.create({
        message: res.message,
        duration: 3500,
        position: 'bottom',
        color: res.success ? 'success' : 'warning',
        buttons: [{ text: 'OK', role: 'cancel' }]
      });
      await toast.present();

      if (res.updated) {
        if (this.viewMode === 'graph') {
          this.renderGraph();
        }
      }
    } catch (err) {
      await loading.dismiss();
      const toast = await this.toastCtrl.create({
        message: this.currentLang === 'es' ? 'Error al sincronizar con GitHub.' : 'Failed to sync with GitHub.',
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
      await toast.present();
    } finally {
      this.isSyncing = false;
      this.cdr.detectChanges();
    }
  }

  resetGraphZoom(): void {
    if (this.graphInstance) {
      this.graphInstance.zoomToFit(400, 30);
    }
  }
}
