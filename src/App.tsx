import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TicTacToe from './pages/TicTacToe';
import ExcelComp from './pages/ExcelComp';
import ImageConverter from './pages/ImageConverter';
import WorkHours from './pages/WorkHours';
import MotolProjects from './pages/MotolProjects';
import MHDGuesser from './pages/MHDGuesser';
import CodeGuesser from './pages/CodeGuesser';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tictactoe" element={<TicTacToe />} />
        <Route path="/excel-comp" element={<ExcelComp />} />
        <Route path="/img-to-webp" element={<ImageConverter />} />
        <Route path="/work-hours" element={<WorkHours />} />
        <Route path="/motol-projects" element={<MotolProjects />} />
        <Route path="/mhd-guesser" element={<MHDGuesser />} />
        <Route path="/code-guesser" element={<CodeGuesser />} />
      </Routes>
    </Router>
  );
}
