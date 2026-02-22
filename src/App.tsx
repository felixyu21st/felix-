/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  RotateCcw, 
  Play, 
  Clock, 
  Zap, 
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { useGameLogic } from './hooks/useGameLogic';
import { GameMode, GameStatus } from './types';
import { GRID_COLS, GRID_ROWS } from './constants';

export default function App() {
  const {
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
  } = useGameLogic();

  const [showInstructions, setShowInstructions] = useState(false);

  // Calculate block size based on screen
  const blockSize = "h-14 w-14 sm:h-16 sm:w-16";
  const gridWidth = "w-[calc(14*6rem)] sm:w-[calc(16*6rem)]"; // Approximation

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans selection:bg-rose-500/30 overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-rose-500 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500 blur-[120px] rounded-full" />
      </div>

      <AnimatePresence mode="wait">
        {status === GameStatus.MENU && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative z-10 w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 shadow-2xl"
          >
            <div className="text-center mb-8">
              <motion.div 
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl mb-4 shadow-lg shadow-rose-500/20"
              >
                <Zap className="w-10 h-10 text-white fill-current" />
              </motion.div>
              <h1 className="text-4xl font-black tracking-tighter mb-2 bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                数字消除
              </h1>
              <p className="text-white/40 text-sm font-medium uppercase tracking-widest">数学益智挑战</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={() => startGame(GameMode.CLASSIC)}
                className="group relative w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-between px-6 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 fill-current" />
                  <span>经典模式</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => startGame(GameMode.TIME)}
                className="group relative w-full bg-[#2A2A2A] text-white font-bold py-4 rounded-2xl flex items-center justify-between px-6 border border-white/5 transition-all hover:bg-[#333] hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5" />
                  <span>计时模式</span>
                </div>
                <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button 
                onClick={() => setShowInstructions(true)}
                className="w-full text-white/40 text-sm font-semibold hover:text-white transition-colors flex items-center justify-center gap-2 py-2"
              >
                <Info className="w-4 h-4" />
                玩法说明
              </button>
            </div>
          </motion.div>
        )}

        {status === GameStatus.PLAYING && (
          <motion.div 
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 w-full max-w-2xl flex flex-col items-center"
          >
            {/* HUD */}
            <div className="w-full flex justify-between items-end mb-6 px-2">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">当前得分</p>
                <div className="text-3xl font-black tabular-nums">{score.toLocaleString()}</div>
              </div>

              <div className="flex flex-col items-center">
                <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 flex flex-col items-center min-w-[140px] shadow-xl">
                  <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-1">目标和</p>
                  <motion.div 
                    key={targetSum}
                    initial={{ scale: 1.5, color: "#f43f5e" }}
                    animate={{ scale: 1, color: "#ffffff" }}
                    className="text-5xl font-black"
                  >
                    {targetSum}
                  </motion.div>
                </div>
                
                {/* Progress Bar for Sum */}
                <div className="w-full h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                  <motion.div 
                    className="h-full bg-rose-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((currentSum / targetSum) * 100, 100)}%` }}
                    transition={{ type: "spring", bounce: 0 }}
                  />
                </div>
                <div className="mt-1 text-[10px] font-bold text-white/40 tabular-nums">
                  当前和: {currentSum} / {targetSum}
                </div>
              </div>

              <div className="space-y-1 text-right">
                {mode === GameMode.TIME ? (
                  <>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">剩余时间</p>
                    <div className={`text-3xl font-black tabular-nums ${timeLeft <= 5 ? 'text-rose-500 animate-pulse' : ''}`}>
                      {timeLeft}秒
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-[0.2em]">模式</p>
                    <div className="text-xl font-black">经典模式</div>
                  </>
                )}
              </div>
            </div>

            {/* Game Board */}
            <div 
              className="relative bg-[#0A0A0A] border-4 border-[#1A1A1A] rounded-3xl p-2 shadow-inner overflow-hidden scale-[0.85] sm:scale-100 origin-center"
              style={{ 
                width: `calc(${GRID_COLS} * 4rem + 1rem)`,
                height: `calc(${GRID_ROWS} * 4rem + 1rem)`
              }}
            >
              {/* Grid Lines Overlay */}
              <div className="absolute inset-0 grid grid-cols-6 grid-rows-10 pointer-events-none opacity-[0.03]">
                {Array.from({ length: 60 }).map((_, i) => (
                  <div key={i} className="border border-white" />
                ))}
              </div>

              <AnimatePresence>
                {grid.map((block) => (
                  <motion.button
                    key={block.id}
                    layoutId={block.id}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: 1,
                      x: block.col * 64, // 4rem = 64px
                      y: (GRID_ROWS - 1 - block.row) * 64,
                    }}
                    exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
                    onClick={() => handleBlockClick(block.id)}
                    className={`absolute w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black transition-all shadow-lg
                      ${selectedIds.includes(block.id) 
                        ? 'ring-4 ring-white scale-110 z-20 brightness-125' 
                        : 'hover:scale-105 z-10'
                      }
                      ${block.color}
                    `}
                    style={{
                      left: '0.5rem',
                      top: '0.5rem',
                    }}
                  >
                    <span className="drop-shadow-md">{block.value}</span>
                  </motion.button>
                ))}
              </AnimatePresence>

              {/* Danger Zone Warning */}
              <div className="absolute top-0 left-0 w-full h-16 bg-gradient-to-b from-rose-500/10 to-transparent pointer-events-none" />
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-4">
              <button 
                onClick={() => setStatus(GameStatus.MENU)}
                className="p-4 bg-[#1A1A1A] border border-white/10 rounded-2xl hover:bg-[#222] transition-colors"
              >
                <RotateCcw className="w-6 h-6 text-white/60" />
              </button>
            </div>
          </motion.div>
        )}

        {status === GameStatus.GAMEOVER && (
          <motion.div 
            key="gameover"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 w-full max-w-md bg-[#1A1A1A] border border-rose-500/20 rounded-3xl p-10 text-center shadow-2xl"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-rose-500/10 rounded-full mb-6">
              <Trophy className="w-10 h-10 text-rose-500" />
            </div>
            <h2 className="text-4xl font-black mb-2">游戏结束</h2>
            <p className="text-white/40 font-medium mb-8">方块触顶了！</p>
            
            <div className="bg-black/20 rounded-2xl p-6 mb-8">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-1">最终得分</p>
              <div className="text-5xl font-black text-white">{score.toLocaleString()}</div>
            </div>

            <button 
              onClick={() => setStatus(GameStatus.MENU)}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              再试一次
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {showInstructions && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-8 max-w-sm w-full relative"
            >
              <button 
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <h3 className="text-2xl font-black mb-6">玩法说明</h3>
              <ul className="space-y-4 text-white/70 text-sm font-medium">
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">1</div>
                  <p>点击方块选择数字，选中的数字会自动相加。</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">2</div>
                  <p>使数字之和等于 <span className="text-white font-bold">目标和</span> 即可消除方块并获得分数。</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">3</div>
                  <p>不要让方块堆积到网格顶部！</p>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex-shrink-0 flex items-center justify-center text-[10px] text-white font-bold">4</div>
                  <p>在 <span className="text-white font-bold">计时模式</span> 中，你必须在倒计时结束前完成消除。</p>
                </li>
              </ul>
              
              <button 
                onClick={() => setShowInstructions(false)}
                className="w-full mt-8 bg-[#2A2A2A] text-white font-bold py-3 rounded-xl hover:bg-[#333] transition-colors"
              >
                知道了
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="fixed bottom-6 text-white/10 text-[10px] font-bold tracking-[0.3em] uppercase pointer-events-none">
        数字消除 v1.0 • 极致速度
      </div>
    </div>
  );
}
