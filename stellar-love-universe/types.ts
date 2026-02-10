
export interface Point {
  x: number;
  y: number;
  z: number;
}

export interface Star extends Point {
  targetX: number;
  targetY: number;
  targetZ: number;
  originX: number;
  originY: number;
  originZ: number;
  size: number;
  color: string;
}

export enum GestureState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED'
}
