
import React from 'react';

export type Direction = 0 | 1 | 2 | 3; // 0: Up, 1: Right, 2: Down, 3: Left

export type BlockType = 
  // Movement (Maze)
  'FORWARD' | 'BACKWARD' | 'TURN_LEFT' | 'TURN_RIGHT' | 'ATTACK' |
  // Potion (Magic Shop)
  'ADD_STARDUST' | 'ADD_FLAME' | 'ADD_SLIME' | 'ADD_HERB' | 'ADD_CRYSTAL' | 'STIR' |
  // Music
  'PLAY_NOTE' | 'REST';

export interface CodeBlock {
  id: string;
  type: BlockType;
  value?: number | string; // Steps, Color, or Note
}

export type EntityType = 'PLAYER' | 'WALL' | 'ENEMY' | 'TREASURE' | 'EMPTY';

export interface Entity {
  type: EntityType;
  x: number;
  y: number;
  id?: string;
}

export interface PlayerState {
  x: number;
  y: number;
  direction: Direction;
}

export type Position = PlayerState;

export interface LevelConfig {
  id: number;
  title: string;
  description: string;
  gridSize: number;
  startPos: { x: number; y: number; direction: Direction };
  targetPos: { x: number; y: number };
  walls: { x: number; y: number }[];
  enemies: { x: number; y: number }[];
  availableBlocks: BlockType[]; 
}

// Potion Shop Level Config
export interface PotionLevelConfig {
  id: number;
  title: string;
  description: string;
  customerRequest: string; // Text displayed by customer
  targetRecipe: BlockType[]; // The sequence required
  availableBlocks: BlockType[];
}

export interface MusicLevelConfig {
  id: number;
  title: string;
  description: string;
  targetMelody: { note: string; duration: number }[];
  availableBlocks: BlockType[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  bgColor: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
