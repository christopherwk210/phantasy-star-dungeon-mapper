import type { PhantasyStar } from './map.interface';

export function createBlankMap(): PhantasyStar.FloorMap {
  const floorMap = [];

  for (let i = 0; i < 14; i++) {
    const row = [];
    for (let j = 0; j < 14; j++) {
      row.push({type: 'wall'});
    }
    floorMap.push(row);
  }

  return floorMap as PhantasyStar.FloorMap;
}