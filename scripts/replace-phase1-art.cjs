const fs = require("fs");
const indexPath = "index.html";
let html = fs.readFileSync(indexPath, "utf8");

const artworkUrl = "https://gcdn.picsart.com/picsart-mcp/d89fddcd-db88-499d-91da-31f1f6002af8.png";
const phaseBlock = /<div class="phase-cover"[^>]*>[\s\S]*?<\/div>/g;
const blocks = html.match(phaseBlock) || [];
if (blocks.length !== 1) {
  if (html.includes('data-phase-art="official-faceoff"') && html.includes(artworkUrl)) {
    console.log("A arte oficial já está aplicada.");
  } else {
    throw new Error("Não foi possível localizar unicamente o quadro da Fase 1. Encontrados: " + blocks.length);
  }
} else {
  const replacement = '<div class="phase-cover phase-cover-faceoff" data-phase-art="official-faceoff" aria-label="Arte oficial da Fase 1: Floresta Encantada"><img src="' + artworkUrl + '" alt="Fase 1: Ibrahim e seu companheiro enfrentam o Guardião da Floresta"></div>';
  html = html.replace(phaseBlock, replacement);
}

const css = '<style id="official-phase1-art-style">.phase-cover.phase-cover-faceoff{position:relative!important;display:block!important;width:100%!important;height:auto!important;aspect-ratio:16/9!important;overflow:hidden!important;padding:0!important;background:#173c30!important}.phase-cover.phase-cover-faceoff:before{display:none!important}.phase-cover.phase-cover-faceoff img{position:relative!important;inset:auto!important;display:block!important;width:100%!important;height:100%!important;max-height:none!important;object-fit:cover!important;object-position:center!important}</style>';
if (!html.includes('id="official-phase1-art-style"')) {
  if (!html.includes("</head>")) throw new Error("Fechamento do head não encontrado.");
  html = html.replace("</head>", css + "</head>");
}
fs.writeFileSync(indexPath, html);

const swPath = "sw.js";
let sw = fs.readFileSync(swPath, "utf8");
sw = sw.replace(/const CACHE_NAME='[^']+';/, "const CACHE_NAME='ibrahim-v148-phase1-direct';");
fs.writeFileSync(swPath, sw);
console.log("Arte oficial aplicada diretamente no quadro da Fase 1; cache atualizado.");
