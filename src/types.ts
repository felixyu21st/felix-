export enum GameMode {
  CLASSIC = 'CLASSIC',
  TIME = 'TIME',
}

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAMEOVER = 'GAMEOVER',
}

export interface BlockData {
  id: string;
  value: number;
  row: number;
  col: number;
  color: string;
}

export interface GameState {
  grid: BlockData[];
  targetSum: number;
  selectedIds: string[];
  score: number;
  status: GameStatus;
  mode: GameMode;
  timeLeft: number;
  level: number;
}
