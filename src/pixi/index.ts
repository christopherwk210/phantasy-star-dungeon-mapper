import * as PIXI from 'pixi.js';
// import { Map } from './map';
// import { DungeonView } from './dungeon-view';
import { loadTextures } from './images';

export async function init(parent: HTMLElement) {
  await loadTextures();

  const { Map } = await import('./map');
  const { DungeonView } = await import('./dungeon-view');

  const app = new PIXI.Application({
    resizeTo: parent,
    background: 0x1E1E1C
  });
  (globalThis as any).__PIXI_APP__ = app;
  parent.appendChild(app.view as any);

  const map = new Map(app);
  const dungeonView = new DungeonView(app);

  const getActiveView = () => {
    if (map.container.pipMode === 'full') return map;
    return dungeonView;
  };

  return {
    switchView: () => {
      map.container.pipMode = map.container.pipMode === 'full' ? 'pip' : 'full';
      dungeonView.container.pipMode = dungeonView.container.pipMode === 'full' ? 'pip' : 'full';
    },
    zoomIn: () => getActiveView().container.zoomIn(),
    zoomOut: () => getActiveView().container.zoomOut(),
    resetZoom: () => getActiveView().resizeToFitScreen(),
    gridVisible: () => map.isGridVisible,
    setGridVisible: (visible: boolean) => map.setGridVisible(visible),
    loadMap: (skipValidation?: boolean) => map.loadMap(skipValidation),
    updatePalette: () => dungeonView.updatePallete(),
    triggerDungeonViewUpdate: () => dungeonView.triggerDungeonViewUpdate()
  }
}