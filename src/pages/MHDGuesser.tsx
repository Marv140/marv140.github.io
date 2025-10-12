import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, Bus, Maximize, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import MHD_IMAGES from '../../js/mhd_images';

interface MHDImage {
  city: string;
  image: string;
}

export default function MHDGuesser() {
  const [currentImage, setCurrentImage] = useState<MHDImage | null>(null);
  const [choices, setChoices] = useState<string[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showButtons, setShowButtons] = useState(true);
  const [usedIndices, setUsedIndices] = useState<number[]>([]);
  const [showPopup, setShowPopup] = useState(true);

  const shuffleArray = <T,>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const loadQuestion = () => {
    let currentUsed = usedIndices;
    if (currentUsed.length >= MHD_IMAGES.length) {
      currentUsed = [];
      setUsedIndices([]);
    }

    const remaining = MHD_IMAGES.filter((_, i) => !currentUsed.includes(i));
    const randomImage = remaining[Math.floor(Math.random() * remaining.length)];
    const imageIndex = MHD_IMAGES.indexOf(randomImage);

    setUsedIndices([...currentUsed, imageIndex]);
    setCurrentImage(randomImage);

    const allCities = Array.from(new Set(MHD_IMAGES.map(x => x.city)));
    const wrongCities = allCities.filter(c => c !== randomImage.city);
    const shuffledWrong = shuffleArray(wrongCities);
    const options = [randomImage.city, shuffledWrong[0], shuffledWrong[1]];

    setChoices(shuffleArray(options));
    setResult(null);
    setShowButtons(true);
  };

  useEffect(() => {
    loadQuestion();
  }, []);

  const handleAnswer = (selectedCity: string) => {
    if (!currentImage) return;

    setShowButtons(false);

    if (selectedCity === currentImage.city) {
      setResult('correct');
    } else {
      setResult('incorrect');
    }
  };

  const handleNext = () => {
    loadQuestion();
  };

  const handleTryAgain = () => {
    setResult(null);
    setShowButtons(true);
  };

  const handleFullscreen = () => {
    const img = document.getElementById('mhd-image') as HTMLImageElement;
    if (img?.requestFullscreen) {
      img.requestFullscreen();
    } else if ((img as any)?.mozRequestFullScreen) {
      (img as any).mozRequestFullScreen();
    } else if ((img as any)?.webkitRequestFullscreen) {
      (img as any).webkitRequestFullscreen();
    } else if ((img as any)?.msRequestFullscreen) {
      (img as any).msRequestFullscreen();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bus className="w-8 h-8 text-yellow-600" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">MHD Guesser</h1>
          </div>
          <Link
            to="/"
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Domů"
          >
            <Home className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </Link>
        </div>
      </header>

      <main className="pt-24 pb-12 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center flex items-center justify-center gap-3 text-gray-900 dark:text-white">
              <Bus className="w-8 h-8 text-yellow-600" />
              Uhádni město podle MHD
            </h2>

            {currentImage && (
              <div className="space-y-6">
                <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 group">
                  <motion.img
                    key={currentImage.image}
                    id="mhd-image"
                    src={currentImage.image}
                    alt="MHD obrázek"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-auto max-h-[500px] object-contain"
                  />
                  <button
                    onClick={handleFullscreen}
                    className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Celá obrazovka"
                  >
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {showButtons && result === null && (
                    <motion.div
                      key="buttons"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {choices.map((city, index) => (
                        <motion.button
                          key={city}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => handleAnswer(city)}
                          className="px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                        >
                          {city}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}

                  {result === 'correct' && (
                    <motion.div
                      key="correct"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="text-center p-6 bg-green-100 dark:bg-green-900/30 border-2 border-green-500 rounded-xl">
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          Správně!
                        </p>
                      </div>
                      <button
                        onClick={handleNext}
                        className="w-full px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Další
                      </button>
                    </motion.div>
                  )}

                  {result === 'incorrect' && (
                    <motion.div
                      key="incorrect"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="space-y-4"
                    >
                      <div className="text-center p-6 bg-red-100 dark:bg-red-900/30 border-2 border-red-500 rounded-xl">
                        <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                          Špatně... Zkus to znovu
                        </p>
                      </div>
                      <button
                        onClick={handleTryAgain}
                        className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                      >
                        Zkusit Znovu
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-gray-600 dark:text-gray-400">
        <p>Spráskáno ve škole v učebně 4 &copy; 2025 Motolský Ajťáci</p>
      </footer>

      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upozornění</h2>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Tato hra je stále v procesu vývoje. Některé funkce nemusí fungovat správně, a obsah se může měnit. Děkujeme za vaši trpělivost!
              </p>
              <button
                onClick={() => setShowPopup(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Zavřít
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
