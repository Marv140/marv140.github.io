import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

interface Project {
  title: string;
  image: string;
  link: string;
}

const projects: Project[] = [
  {
    title: 'MHD Guesser',
    image: '/assets/images/games/mhd_guesser.webp',
    link: '/mhd-guesser',
  },
  {
    title: 'Code Guesser',
    image: '/assets/images/games/code_guesser.webp',
    link: '/code-guesser',
  },
  {
    title: 'Piškvorky 15x15',
    image: '/assets/images/games/tictactoe.webp',
    link: '/tictactoe',
  },
];

const MotolProjects = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-radial from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Particle Background */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/static/images/particles.gif')" }}
      />

      {/* Fixed Header */}
      <header className="fixed top-0 left-0 w-full h-[60px] bg-black/40 z-[999] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <img
            src="/assets/images/icon.webp"
            alt="Logo"
            className="h-10 w-auto"
          />
          <h1 className="text-2xl text-white tracking-wider">Hlavní Menu</h1>
        </div>
      </header>

      {/* Main Content - Cover Grid */}
      <main className="absolute top-[60px] bottom-[40px] left-0 right-0 z-[1] overflow-hidden flex flex-col lg:flex-row">
        {projects.map((project, index) => (
          <Link
            key={project.title}
            to={project.link}
            className="relative flex-1 overflow-hidden group no-underline"
          >
            {/* Background Image with Zoom Effect */}
            <motion.div
              className="absolute inset-0 bg-cover bg-center z-[1]"
              style={{ backgroundImage: `url('${project.image}')` }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/30 z-[2]" />

            {/* Centered Text */}
            <div className="relative z-[3] w-full h-full flex justify-center items-center text-center">
              <motion.h2
                className="text-3xl uppercase tracking-[2px] text-white"
                style={{
                  textShadow: '0 0 10px #ff0099, 0 0 20px #ff0099, 0 0 30px #ff0099',
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                {project.title}
              </motion.h2>
            </div>
          </Link>
        ))}
      </main>

      {/* Fixed Footer */}
      <footer className="fixed bottom-0 left-0 w-full h-[40px] bg-black/40 flex justify-center items-center text-white text-sm z-[999]">
        <p>Spráskáno ve škole v učebně 4 &copy; 2025 Motolský Ajťáci</p>
      </footer>

      {/* Home Button (Optional) */}
      <Link
        to="/"
        className="fixed top-20 left-4 z-[1000] p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-white hover:scale-110 transition-transform duration-200"
      >
        <Home size={24} />
      </Link>
    </div>
  );
};

export default MotolProjects;
