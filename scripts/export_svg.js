import fs from 'fs';
import { Resvg } from '@resvg/resvg-js';

const inPath = 'docs/ARCHITECTURE_DIAGRAM_POLISHED.svg';
const outPath = 'docs/ARCHITECTURE_DIAGRAM_POLISHED.png';
const width = 1400;
const height = 900;

const svg = fs.readFileSync(inPath, 'utf8');
const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: width }, background: '#ffffff' });
const pngData = resvg.render();
fs.writeFileSync(outPath, pngData.asPng());
console.log('Wrote', outPath);
