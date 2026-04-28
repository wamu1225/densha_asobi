import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { TopPage } from './pages/TopPage'
import { MathSprint } from './games/MathSprint'
import { WhichBigger } from './games/WhichBigger'
import { ClockReading } from './games/ClockReading'
import { TrainBingo } from './games/TrainBingo'
import { ColorChallenge } from './games/ColorChallenge'
import { MemoryCards } from './games/MemoryCards'
import { WhatsNext } from './games/WhatsNext'
import { NumberMaze } from './games/NumberMaze'
import { WordScramble } from './games/WordScramble'
import { HiraganaSearch } from './games/HiraganaSearch'
import { DotConnect } from './games/DotConnect'
import { Simon } from './games/Simon'

export default function App() {
  return (
    <BrowserRouter basename="/densha_asobi">
      <Routes>
        <Route path="/" element={<TopPage />} />
        <Route path="/math" element={<MathSprint />} />
        <Route path="/bigger" element={<WhichBigger />} />
        <Route path="/clock" element={<ClockReading />} />
        <Route path="/bingo" element={<TrainBingo />} />
        <Route path="/color" element={<ColorChallenge />} />
        <Route path="/memory" element={<MemoryCards />} />
        <Route path="/next" element={<WhatsNext />} />
        <Route path="/maze" element={<NumberMaze />} />
        <Route path="/scramble" element={<WordScramble />} />
        <Route path="/search" element={<HiraganaSearch />} />
        <Route path="/dots" element={<DotConnect />} />
        <Route path="/simon" element={<Simon />} />
      </Routes>
    </BrowserRouter>
  )
}
