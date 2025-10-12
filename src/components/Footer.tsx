import { motion } from 'framer-motion';
import { Heart, Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative py-12 px-4 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center font-bold text-white text-lg shadow-lg">
              M
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Marv140
            </span>
          </div>

          {/* Social links */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.a
              href="https://github.com/marv140"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="GitHub"
            >
              <Github className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.a>
            <motion.a
              href="mailto:contact@marv140.dev"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </motion.a>
          </div>

          {/* Copyright */}
          <p className="text-gray-600 dark:text-gray-400 mb-2 flex items-center justify-center gap-2">
            <span>&copy; 2025 Marv140. Všechna práva vyhrazena.</span>
          </p>

          {/* Made with love */}
          <p className="text-sm text-gray-500 dark:text-gray-500 flex items-center justify-center gap-2">
            <span>Vytvořeno s</span>
            <motion.span
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            </motion.span>
            <span>a React</span>
          </p>
        </motion.div>
      </div>
    </footer>
  );
}
