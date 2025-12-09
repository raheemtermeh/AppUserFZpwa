import fs from 'fs'
import path from 'path'

const base = process.cwd()
const srcIcon = path.join(base, 'public', 'icons', 'icon-512.png')
const outDir = path.join(base, 'public', 'screenshots')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

function writeScreenshot(targetPath, width, height) {
    try {
        const buf = fs.readFileSync(srcIcon)
        // overwrite width/height in PNG IHDR (bytes 16..23)
        const copy = Buffer.from(buf)
        copy.writeUInt32BE(width, 16)
        copy.writeUInt32BE(height, 20)
        fs.writeFileSync(targetPath, copy)
        console.log('Wrote', targetPath, `${width}x${height}`)
    } catch (err) {
        console.error('Error creating', targetPath, err.message)
        process.exit(1)
    }
}

writeScreenshot(path.join(outDir, 'screenshot-wide.png'), 1024, 512)
writeScreenshot(path.join(outDir, 'screenshot-portrait.png'), 640, 720)

console.log('Screenshots generated in', outDir)
