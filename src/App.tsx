import { HashRouter, Routes, Route } from 'react-router-dom'
import { TopPage } from './pages/TopPage'
import { MathSprint } from './games/MathSprint'
import { WhichBigger } from './games/WhichBigger'
import { ClockReading } from './games/ClockReading'
import { Riddles } from './games/Riddles'
import { TrainBingo } from './games/TrainBingo'
import { ColorChallenge } from './games/ColorChallenge'
import { MemoryCards } from './games/MemoryCards'
import { WhatsNext } from './games/WhatsNext'
import { NumberMaze } from './games/NumberMaze'
import { WordScramble } from './games/WordScramble'
import { HiraganaSearch } from './games/HiraganaSearch'
import { DotConnect } from './games/DotConnect'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/math" element={<MathSprint />} />
        <Route path="/bigger" element={<WhichBigger />} />
        <Route path="/clock" element={<ClockReading />} />
        <Route path="/riddles" element={<Riddles />} />
        <Route path="/bingo" element={<TrainBingo />} />
        <Route path="/color" element={<ColorChallenge />} />
        <Route path="/memory" element={<MemoryCards />} />
        <Route path="/next" element={<WhatsNext />} />
        <Route path="/maze" element={<NumberMaze />} />
        <Route path="/scramble" element={<WordScramble />} />
        <Route path="/search" element={<HiraganaSearch />} />
        <Route path="/dots" element={<DotConnect />} />
      </Routes>
    </HashRouter>
  )
}
