import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';

export interface VaultNode {
  id: string;
  title: string;
  category: string;
  color: string;
  path: string;
  links: string[];
  content: string;
}

export interface VaultLink {
  source: string | VaultNode;
  target: string | VaultNode;
}

export interface VaultGraphData {
  generatedAt: string;
  totalNodes: number;
  totalLinks: number;
  nodes: VaultNode[];
  links: VaultLink[];
}

@Injectable({
  providedIn: 'root'
})
export class VaultService {
  private readonly STORAGE_KEY = 'lastresources_vault_graph';
  private readonly GITHUB_RAW_URL = 'https://raw.githubusercontent.com/Alexorim/lastcodex-obsidian/main/vault-graph.json';

  private vaultDataSubject = new BehaviorSubject<VaultGraphData | null>(null);
  public vaultData$ = this.vaultDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Carga los datos del Vault (desde localStorage o bundle local offline de assets).
   */
  async loadVaultData(): Promise<VaultGraphData> {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (cached) {
      try {
        const parsed: VaultGraphData = JSON.parse(cached);
        if (parsed.nodes && parsed.nodes.length > 0) {
          this.vaultDataSubject.next(parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('Error reading cached vault data, falling back to assets:', e);
      }
    }

    try {
      const assetData = await firstValueFrom(this.http.get<VaultGraphData>('assets/vault-graph.json'));
      this.vaultDataSubject.next(assetData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(assetData));
      return assetData;
    } catch (err) {
      console.error('Failed to load local vault-graph.json:', err);
      const empty: VaultGraphData = {
        generatedAt: new Date().toISOString(),
        totalNodes: 0,
        totalLinks: 0,
        nodes: [],
        links: []
      };
      this.vaultDataSubject.next(empty);
      return empty;
    }
  }

  /**
   * Sincroniza la bóveda directamente con el repositorio oficial en GitHub.
   */
  async syncWithGitHub(): Promise<{ success: boolean; updated: boolean; message: string; data?: VaultGraphData }> {
    try {
      // Usamos timestamp para evitar caché agresivo de HTTP
      const url = `${this.GITHUB_RAW_URL}?t=${Date.now()}`;
      const remoteData = await firstValueFrom(this.http.get<VaultGraphData>(url, {
        headers: { 'Accept': 'application/json' }
      }));

      if (!remoteData || !Array.isArray(remoteData.nodes)) {
        return { success: false, updated: false, message: 'Formato inválido de datos desde GitHub.' };
      }

      const current = this.vaultDataSubject.value;
      const isNewer = !current || (remoteData.generatedAt && remoteData.generatedAt !== current.generatedAt) || remoteData.nodes.length !== (current?.nodes?.length || 0);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remoteData));
      this.vaultDataSubject.next(remoteData);

      if (isNewer) {
        return {
          success: true,
          updated: true,
          message: `Sincronizado con GitHub: ${remoteData.nodes.length} notas y ${remoteData.links.length} conexiones actualizadas.`,
          data: remoteData
        };
      } else {
        return {
          success: true,
          updated: false,
          message: 'Tu bóveda ya está en la versión más reciente de GitHub.',
          data: remoteData
        };
      }
    } catch (err: any) {
      console.error('Error syncing vault with GitHub:', err);
      return {
        success: false,
        updated: false,
        message: 'No se pudo conectar a GitHub. Verifica tu conexión a internet.'
      };
    }
  }

  /**
   * Obtiene una nota por su ID o título (case-insensitive).
   */
  getNode(idOrTitle: string): VaultNode | undefined {
    const current = this.vaultDataSubject.value;
    if (!current) return undefined;
    const search = idOrTitle.trim().toLowerCase();
    return current.nodes.find(n => n.id.toLowerCase() === search || n.title.toLowerCase() === search);
  }
}
