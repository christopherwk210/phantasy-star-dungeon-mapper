import { reactive } from 'vue';
import * as PIXI from 'pixi.js';

const images = import.meta.glob('@/assets/images/dungeon/**/*.png', { eager: true, as: 'url' });

export type imageRecord = { url: string; texture: PIXI.Texture; sprite: PIXI.Sprite; };

export const textures = reactive({
  array: [] as string[],
  assets: {} as {
    'cross-passage-turn': Record<string, imageRecord>,
    'dead-end': Record<string, imageRecord>,
    'dead-end-half': Record<string, imageRecord>,
    'dead-end-door': Record<string, imageRecord>,
    'dungeon': Record<string, imageRecord>,
    'selection': Record<string, imageRecord>,
    'map-elements': Record<string, imageRecord>,
    'side-exit': Record<string, imageRecord>,
    'straight-step': Record<string, imageRecord>,
    't-side-exit': Record<string, imageRecord>,
    'wall-to-passage-turn': Record<string, imageRecord>,
    'wall-to-wall-turn': Record<string, imageRecord>
  }
});

export async function loadTextures() {
  const { array, assets } = await loadStaticAssets(images);

  textures.array = array;
  textures.assets = assets as any;
}

async function loadStaticAssets(modules: Record<string, string>): Promise<{ array: string[], assets: Record<string, Record<string, imageRecord>> }> {
  return new Promise(async resolve => {
    const array: string[] = [];
    const assets: Record<string, Record<string, imageRecord>> = {};

    const totalAssets = Object.keys(modules).length;
    let assetsLoaded = 0;

    const loadComplete = () => {
      if (++assetsLoaded >= totalAssets) resolve({ assets, array });
    }
    
    for (const path in modules) {
      // modules[path]().then(async () => {
        const imagePath = modules[path];
        const fileName = imagePath.substring(imagePath.lastIndexOf('/') + 1);
        const fileNameNoExtension = fileName.substring(0, fileName.lastIndexOf('.'));
        const key = path.split('/').slice(-2, -1)[0];
        if (!assets[key]) assets[key] = {};
        const texture = await PIXI.Texture.fromURL(imagePath, { scaleMode: PIXI.SCALE_MODES.NEAREST });
        const sprite = new PIXI.Sprite(texture);
        assets[key][fileNameNoExtension] = { url: imagePath, texture, sprite };
        array.push(imagePath);
        loadComplete();
      // });
    }
  });
}