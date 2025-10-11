import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BOARD_SIZE = 15;
const WIN_CONDITION = 5;

type Player = 'X' | 'O' | '';
type Board = Player[][];

interface Scores {
  X: number;
  O: number;
  draws: number;
}

export default function TicTacToe() {
  const [gameBoard, setGameBoard] = useState<Board>(() =>
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(''))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [gameActive, setGameActive] = useState(true);
  const [winMessage, setWinMessage] = useState('');
  const [winningCells, setWinningCells] = useState<[number, number][]>([]);
  const [scores, setScores] = useState<Scores>({ X: 0, O: 0, draws: 0 });

  const handleCellClick = (row: number, col: number) => {
    if (!gameActive || gameBoard[row][col] !== '') return;

    const newBoard = gameBoard.map(r => [...r]);
    newBoard[row][col] = currentPlayer;
    setGameBoard(newBoard);

    const winResult = checkWin(newBoard, row, col, currentPlayer);
    if (winResult) {
      setGameActive(false);
      setWinMessage(`Hráč ${currentPlayer} vyhrál!`);
      setWinningCells(winResult);
      setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 1 }));
    } else if (checkDraw(newBoard)) {
      setGameActive(false);
      setWinMessage('Remíza!');
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const checkWin = (board: Board, row: number, col: number, player: Player): [number, number][] | null => {
    const directions: [number, number][] = [
      [0, 1],  // horizontal
      [1, 0],  // vertical
      [1, 1],  // diagonal down-right
      [1, -1]  // diagonal down-left
    ];

    for (const [dx, dy] of directions) {
      let count = 1;
      const cells: [number, number][] = [[row, col]];

      // Check both directions
      for (const direction of [1, -1]) {
        let r = row + direction * dx;
        let c = col + direction * dy;

        while (
          r >= 0 && r < BOARD_SIZE &&
          c >= 0 && c < BOARD_SIZE &&
          board[r][c] === player
        ) {
          count++;
          cells.push([r, c]);
          r += direction * dx;
          c += direction * dy;
        }
      }

      if (count >= WIN_CONDITION) {
        return cells;
      }
    }

    return null;
  };

  const checkDraw = (board: Board): boolean => {
    return board.every(row => row.every(cell => cell !== ''));
  };

  const restartGame = () => {
    setGameBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill('')));
    setGameActive(true);
    setCurrentPlayer('X');
    setWinMessage('');
    setWinningCells([]);
  };

  const isWinningCell = (row: number, col: number) => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-[60px] bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
        <div className="flex items-center gap-3">
          <img src="/assets/images/icon.webp" alt="Logo" className="h-10 w-auto" />
          <h1 className="text-xl md:text-2xl font-bold tracking-wide">TicTacToe 15x15</h1>
        </div>
        <Link
          to="/"
          className="absolute right-4 text-2xl hover:scale-125 transition-transform duration-200"
        >
          <Home />
        </Link>
      </header>

      {/* Main Content */}
      <main className="pt-[80px] pb-[60px] px-4 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-2xl"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
              <span className="inline-block animate-pulse" style={{ textShadow: '0 0 10px #ff0099, 0 0 20px #ff0099' }}>
                🎮 Piškvorky 15x15
              </span>
            </h1>

            {/* Status Bar */}
            <div className="flex justify-between items-center bg-black/20 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2">
                <span>Na tahu:</span>
                <span className={`text-2xl font-bold ${currentPlayer === 'X' ? 'text-[#ff00cc]' : 'text-[#3333ff]'}`}>
                  {currentPlayer}
                </span>
              </div>
              <div className="text-sm">
                <span>Pro výhru: 5 v řadě</span>
              </div>
            </div>

            {/* Score Display */}
            <div className="flex justify-around bg-black/20 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[#ff00cc] font-bold">X:</span>
                <span className="text-[#ff00cc] text-xl font-bold">{scores.X}</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Remízy:</span>
                <span className="text-gray-300 text-xl font-bold">{scores.draws}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#3333ff] font-bold">O:</span>
                <span className="text-[#3333ff] text-xl font-bold">{scores.O}</span>
              </div>
            </div>

            {/* Game Board */}
            <div className="overflow-auto max-h-[500px] mb-4 rounded-lg bg-black/10 p-2">
              <div
                className="grid gap-[2px] mx-auto"
                style={{
                  gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                  maxWidth: 'fit-content'
                }}
              >
                {gameBoard.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <motion.button
                      key={`${rowIndex}-${colIndex}`}
                      whileHover={gameActive && !cell ? { scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.2)' } : {}}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      className={`
                        w-7 h-7 md:w-8 md:h-8 bg-white/10 rounded flex items-center justify-center
                        font-bold text-sm md:text-base transition-all duration-200
                        ${cell === 'X' ? 'text-[#ff00cc]' : cell === 'O' ? 'text-[#3333ff]' : ''}
                        ${isWinningCell(rowIndex, colIndex) ? 'bg-yellow-400/30 ring-2 ring-yellow-400' : ''}
                        ${!cell && gameActive ? 'cursor-pointer hover:bg-white/20' : 'cursor-default'}
                      `}
                      disabled={!gameActive || cell !== ''}
                      style={{
                        textShadow: cell === 'X'
                          ? '0 0 5px #ff00cc'
                          : cell === 'O'
                          ? '0 0 5px #3333ff'
                          : 'none'
                      }}
                    >
                      {cell}
                    </motion.button>
                  ))
                )}
              </div>
            </div>

            {/* Win Message */}
            <AnimatePresence>
              {winMessage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={`text-center text-2xl font-bold p-4 rounded-lg bg-black/20 mb-4 ${
                    winMessage.includes('X')
                      ? 'text-[#ff00cc]'
                      : winMessage.includes('O')
                      ? 'text-[#3333ff]'
                      : 'text-gray-300'
                  }`}
                  style={{ animation: 'pulse 2s infinite' }}
                >
                  {winMessage}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={restartGame}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ff00cc] to-[#3333ff] rounded-full font-bold hover:from-[#3333ff] hover:to-[#ff00cc] transition-all duration-300 shadow-lg"
              >
                <RotateCcw className="w-5 h-5" />
                Restart hry
              </motion.button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 h-[40px] bg-black/40 flex items-center justify-center text-sm">
        <p>Spráskáno ve škole v učebně 4 &copy; 2025 Motolský Ajťáci</p>
      </footer>
    </div>
  );
}
