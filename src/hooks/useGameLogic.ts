import { useState, useEffect, useCallback, useRef } from 'react';
import { GameMode, GameStatus, BlockData } from '../types';
import { 
  GRID_COLS, 
  GRID_ROWS, 
  INITIAL_ROWS, 
  TIME_MODE_DURATION, 
  BLOCK_COLORS,
  TARGET_MIN,
  TARGET_MAX,
  BLOCK_MIN,
  BLOCK_MAX
} from '../constants';

export const useGameLogic = () => {
  const [grid, setGrid] = useState<BlockData[]>([]);
  const [targetSum, setTargetSum] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  const [mode, setMode] = useState<GameMode>(GameMode.CLASSIC);
  const [timeLeft, setTimeLeft] = useState(TIME_MODE_DURATION);
  const [level, setLevel] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateTarget = useCallback(() => {
    return Math.floor(Math.random() * (TARGET_MAX - TARGET_MIN + 1)) + TARGET_MIN;
  }, []);

  const createBlock = (row: number, col: number): BlockData => ({
    id: Math.random().toString(36).substr(2, 9),
    value: Math.floor(Math.random() * (BLOCK_MAX - BLOCK_MIN + 1)) + BLOCK_MIN,
    row,
    col,
    color: BLOCK_COLORS[Math.floor(Math.random() * BLOCK_COLORS.length)],
  });

  const addRow = useCallback(() => {
    setGrid(prev => {
      // Check for game over
      const willOverflow = prev.some(b => b.row >= GRID_ROWS - 1);
      if (willOverflow) {
        setStatus(GameStatus.GAMEOVER);
        return prev;
      }

      // Move existing up
      const moved = prev.map(b => ({ ...b, row: b.row + 1 }));
      
      // Add new row at bottom (row 0)
      const newRow: BlockData[] = [];
      for (let c = 0; c < GRID_COLS; c++) {
        newRow.push(createBlock(0, c));
      }
      
      return [...moved, ...newRow];
    });
  }, []);

  const startGame = (selectedMode: GameMode) => {
    const initialGrid: BlockData[] = [];
    for (let r = 0; r < INITIAL_ROWS; r++) {
      for (let c = 0; c < GRID_COLS; c++) {
        initialGrid.push(createBlock(r, c));
      }
    }
    setGrid(initialGrid);
    setTargetSum(generateTarget());
    setSelectedIds([]);
    setScore(0);
    setStatus(GameStatus.PLAYING);
    setMode(selectedMode);
    setTimeLeft(TIME_MODE_DURATION);
    setLevel(1);
  };

  const handleBlockClick = (id: string) => {
    if (status !== GameStatus.PLAYING) return;

    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      }
      return [...prev, id];
    });
  };

  const currentSum = grid
    .filter(b => selectedIds.includes(b.id))
    .reduce((acc, b) => acc + b.value, 0);

  // Check sum effect
  useEffect(() => {
    if (currentSum === targetSum && targetSum !== 0) {
      // Success!
      const removedIds = [...selectedIds];
      setScore(prev => prev + targetSum * removedIds.length);
      setSelectedIds([]);
      setTargetSum(generateTarget());

      setGrid(prev => {
        const remaining = prev.filter(b => !removedIds.includes(b.id));
        
        // Apply gravity
        const newGrid: BlockData[] = [];
        for (let c = 0; c < GRID_COLS; c++) {
          const colBlocks = remaining
            .filter(b => b.col === c)
            .sort((a, b) => a.row - b.row);
          
          colBlocks.forEach((b, index) => {
            newGrid.push({ ...b, row: index });
          });
        }
        return newGrid;
      });

      if (mode === GameMode.CLASSIC) {
        addRow();
      } else {
        // Time mode: reset timer on success
        setTimeLeft(TIME_MODE_DURATION);
      }
    } else if (currentSum > targetSum) {
      // Fail - clear selection
      setSelectedIds([]);
    }
  }, [currentSum, targetSum, selectedIds, mode, addRow, generateTarget]);

  // Timer effect for Time Mode
  useEffect(() => {
    if (status === GameStatus.PLAYING && mode === GameMode.TIME) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            addRow();
            return TIME_MODE_DURATION;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, mode, addRow]);

  return {
    grid,
    targetSum,
    selectedIds,
    score,
    status,
    mode,
    timeLeft,
    currentSum,
    startGame,
    handleBlockClick,
    setStatus,
  };
};
