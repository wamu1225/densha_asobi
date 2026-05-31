// PWA用アイコンPNGを生成（純Node.js / 外部依存なし）
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const crcTable = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1)
  crcTable[n] = c
}
function crc32(buf) {
  let c = 0xFFFFFFFF
  for (const b of buf) c = crcTable[(c ^ b) & 0xFF] ^ (c >>> 8)
  return (c ^ 0xFFFFFFFF) >>> 0
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii')
  const len = Buffer.allocUnsafe(4); len.writeUInt32BE(data.length, 0)
  const crcBuf = Buffer.allocUnsafe(4); crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0)
  return Buffer.concat([len, t, data, crcBuf])
}

function makePNG(size, drawFn) {
  const ihdr = Buffer.allocUnsafe(13)
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8; ihdr[9] = 6  // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0

  const rows = []
  for (let y = 0; y < size; y++) {
    const row = Buffer.allocUnsafe(1 + size * 4)
    row[0] = 0
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = drawFn(x, y, size)
      row[1 + x * 4] = r; row[2 + x * 4] = g; row[3 + x * 4] = b; row[4 + x * 4] = a
    }
    rows.push(row)
  }

  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(Buffer.concat(rows))),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

// でんしゃあそび アイコン: 紺背景 + 電車シルエット
function drawIcon(x, y, size) {
  const cx = size / 2, cy = size / 2
  const pad = size * 0.12
  const r = size / 2 - pad

  // 円形クリップ
  const dx = x - cx, dy = y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist > r) return [0, 0, 0, 0]  // 透明

  // 背景: 濃い紺 #1C2B40
  const bgR = 28, bgG = 43, bgB = 64

  // 電車シルエット (白)
  const s = size
  const trainX = s * 0.18, trainW = s * 0.64
  const trainTopY = s * 0.28, trainBotY = s * 0.70
  const wheelR = s * 0.095
  const w1x = s * 0.32, w2x = s * 0.68, wheelY = s * 0.67
  const winTopY = s * 0.34, winBotY = s * 0.52
  const winM = s * 0.07, winH = winBotY - winTopY
  const win1x = trainX + winM, win2x = trainX + trainW / 2 + winM * 0.5
  const winW = (trainW / 2) - winM * 2

  let isTrain = false
  // 車体
  if (x >= trainX && x <= trainX + trainW && y >= trainTopY && y <= trainBotY) {
    // 角丸 (四隅カット)
    const cornerR = s * 0.08
    const inCorner =
      (x < trainX + cornerR && y < trainTopY + cornerR &&
        Math.hypot(x - (trainX + cornerR), y - (trainTopY + cornerR)) > cornerR) ||
      (x > trainX + trainW - cornerR && y < trainTopY + cornerR &&
        Math.hypot(x - (trainX + trainW - cornerR), y - (trainTopY + cornerR)) > cornerR)
    if (!inCorner) isTrain = true
  }
  // 車輪
  if (Math.hypot(x - w1x, y - wheelY) < wheelR) isTrain = true
  if (Math.hypot(x - w2x, y - wheelY) < wheelR) isTrain = true

  // 窓（背景色で抜く）
  const isWin =
    (x >= win1x && x <= win1x + winW && y >= winTopY && y <= winBotY) ||
    (x >= win2x && x <= win2x + winW && y >= winTopY && y <= winBotY)

  if (isTrain && !isWin) return [255, 255, 255, 255]
  if (isWin) return [bgR, bgG, bgB, 255]

  // 背景グラデーション (少し明るく)
  const grad = 1 - dist / r * 0.25
  return [Math.round(bgR * grad), Math.round(bgG * grad), Math.round(bgB * grad), 255]
}

writeFileSync('./public/icon-192.png', makePNG(192, drawIcon))
writeFileSync('./public/icon-512.png', makePNG(512, drawIcon))
console.log('✓ icon-192.png / icon-512.png を生成しました')
