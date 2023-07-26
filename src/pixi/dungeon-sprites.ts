import * as PIXI from 'pixi.js';
import { textures, type imageRecord } from './images';

export function assembleSprites(spriteModifier: (sprite: PIXI.AnimatedSprite) => void = () => {}) {
  const sprites: Record<keyof typeof textures.assets, Record<string, Record<string, PIXI.AnimatedSprite>>> = {} as any;

  for (const key in textures.assets) {
    const assetKey = key as keyof typeof textures.assets

    switch (assetKey) {
      case 'dungeon': break;
      case 'cross-passage-turn':
      case 'wall-to-passage-turn':
      case 'wall-to-wall-turn':
        sprites[assetKey] = assembleRoot(textures.assets[assetKey]) as any;
        break;
      default:
        sprites[assetKey] = assembleSorted(textures.assets[assetKey as keyof typeof textures.assets], spriteModifier);
        break;
    }
  }

  return sprites;
}

function assembleRoot(assetMap: Record<string, imageRecord>) {
  return new PIXI.AnimatedSprite(Object.values(assetMap).map(({ texture }) => texture));
}

function assembleSorted(assetMap: Record<string, imageRecord>, spriteModifier: (sprite: PIXI.AnimatedSprite) => void) {
  const textureMap: Record<string, Record<string, PIXI.Texture[]>> = {};
  const spriteMap: Record<string, Record<string, PIXI.AnimatedSprite>> = {};

  for (const key of Object.keys(assetMap).sort()) {
    const matches = /(\d)_(\d_to_\d)_\d/g.exec(key);
    if (!matches) continue;

    const sliceIndex = matches[1];
    const sequenceName = matches[2];
    if (!textureMap[sequenceName]) textureMap[sequenceName] = {};
    if (!textureMap[sequenceName][sliceIndex]) textureMap[sequenceName][sliceIndex] = [];
    textureMap[sequenceName][sliceIndex].push(assetMap[key].texture);
  }

  for (const sequenceName in textureMap) {
    if (!spriteMap[sequenceName]) spriteMap[sequenceName] = {};

    const sequence = textureMap[sequenceName];
    for (const sliceIndex in sequence) {
      spriteMap[sequenceName][sliceIndex] = new PIXI.AnimatedSprite(sequence[sliceIndex]);
      spriteModifier(spriteMap[sequenceName][sliceIndex]);
    }
  }

  return spriteMap;
}