import fs from 'fs'
import path from 'path'

function checkPng(filePath) {
    try {
        const buf = fs.readFileSync(filePath)
        const stat = fs.statSync(filePath)
        // PNG: width and height in bytes 16-23 (big-endian)
        if (buf.length < 24) return { path: filePath, error: 'file too small' }
        const width = buf.readUInt32BE(16)
        const height = buf.readUInt32BE(20)
        return { path: filePath, size: stat.size, width, height }
    } catch (err) {
        return { path: filePath, error: err.message }
    }
}

const base = process.cwd()
const files = [
    path.join(base, 'dist', 'icons', 'icon-192.png'),
    path.join(base, 'dist', 'icons', 'icon-512.png'),
    path.join(base, 'public', 'icons', 'icon-192.png'),
    path.join(base, 'public', 'icons', 'icon-512.png')
]

for (const f of files) {
    const res = checkPng(f)
    if (res.error) {
        console.log(`${f} -> ERROR: ${res.error}`)
    } else {
        console.log(`${f} -> ${res.size} bytes, ${res.width}x${res.height}`)
    }
}
