# As Aventuras de Ibrahim — Revisão 4

Base de desenvolvimento: `dev-fase1-musica-companheiro` em `46fe618` (Revisão 3).

## Alterações aprovadas

Reconstruir a Floresta Encantada, animar Ibrahim e o cachorro, integrar exploração e combate em tela cheia, revisar a arte da loja e compor três trilhas locais. Corrigir a inicialização da PWA e preservar o histórico, os saldos, o progresso e a arte oficial da capa.

## Alterações implementadas

- Mapa com trilhas curvas conectadas, dois cruzamentos do rio, árvores variadas, pedras, flores, vegetação de encontros e clareira circular de Arborian. A câmera segue o jogador com amortecimento e fica dentro do mapa.
- Ibrahim de corpo inteiro e cachorro com oito quadros de caminhada por direção, além da pose em repouso. O cachorro avança pela posição anterior de Ibrahim e contorna os mesmos obstáculos.
- Encontro anunciado por efeito sonoro e apresentação de 2,45 s. O mapa, o combate e os diálogos usam o mesmo elemento em tela cheia. As barras de vida animam a perda de energia e os comandos ficam bloqueados durante as transições e os turnos.
- Ogro da Floresta na grama alta, com arte de repouso, ataque, dano e derrota. A derrota do Ogro permanece visível por dois segundos. Arborian usa a arte oficial na arena, com vitória, baú e retorno à clareira. Encontros aleatórios têm um intervalo de sete passos após a volta ao mapa.
- Quatro itens de loja com arte original em vetor, volume e iluminação pintados. Os preços e efeitos são mantidos. A rede captura no encontro selvagem e o cachorro continua acompanhando Ibrahim.
- Três composições de 16 compassos via Web Audio, com melodias, harmonias, acompanhamento e timbres próprios. As trilhas repetem, fazem transições com fades e respeitam o controle de música salvo.
- Capa oficial armazenada localmente com os mesmos bytes do arquivo original. A PWA instala o conjunto completo de arquivos da revisão e limpa os caches antigos do jogo na ativação.

## Testes executados

- `node scripts/test-phase1.cjs` com Chromium, viewport e toque emulados de iPhone 13 e sessão desktop para tela cheia nativa. O roteiro cobre inicialização, dados antigos, mapa, toque, colisão, quadros, companhia, Ogro, Arborian, quatro comandos, derrota, retorno, baú, compra e efeitos dos itens, três saídas de áudio e recarga offline.
- Atualização em uma segunda origem local, servindo o service worker e a arte da Revisão 3 antes de trocar para a Revisão 4. Após `controllerchange`, a Revisão 4 removeu o cache da 3 e serviu a nova arte da Cura e a capa oficial offline.
- Sintaxe dos scripts e scripts inline, integridade da cópia da capa por SHA-256 e `git diff --check`.

## Resultados

- O roteiro Chromium passou em modo móvel emulado e desktop. No fluxo móvel não houve exceções de JavaScript, respostas HTTP de erro ou pedidos da arte antiga do guardião.
- A PWA registrou o service worker automaticamente, instalou o cache da Revisão 4 e restaurou o mapa, a loja, a capa e a posição salva sem rede.
- O analisador de áudio detectou saída em cada uma das três trilhas. As capturas incluem a capa, a exploração, a ponte, a loja, a clareira, os encontros, os combates, a vitória e a derrota.

## Decisões técnicas

- O mapa usa Canvas 2D com terreno pré-renderizado. Colisões, pontes, áreas de encontro e arena compartilham coordenadas. Posições antigas que caem em obstáculos são ajustadas para uma casa transitável próxima.
- A apresentação de batalha usa arquivos WebP locais. O elemento inicial apontava para o Troll, `renderGame` atribuía o SVG antigo e um segundo controlador substituía a imagem com base no número da fase. A seleção agora parte do tipo de encontro, por uma única função, e o service worker deixa de pré-carregar os inimigos antigos.
- O erro que interrompia o registro da PWA vinha da escrita em elementos de carteira removidos do HTML. As escritas obsoletas foram retiradas e o registro roda antes do primeiro render. Os manifestos mantêm a identidade e os ícones existentes.
- A chave de armazenamento foi preservada. Foram removidas as migrações que zeravam batalhas e histórico ou alteravam preços já salvos. Encontros interrompidos em outra data são retomados preservando o registro anterior.

## Pendências e próximas etapas

- Revisar as capturas e avaliar visualmente os sprites e a mixagem em um aparelho físico. Os testes usaram Chromium automatizado, emulação móvel e amostras do áudio gerado.
- As alterações estão na cópia local da branch de desenvolvimento. `main` e a publicação no Netlify permanecem intactas.
