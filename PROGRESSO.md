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

# Revisão 5

Base local: commit `c8c8a24d8ca1ccc21f9a5f7c12c14f0fd7132646`, na branch `dev-fase1-musica-companheiro`.

## Decisões aprovadas e implementação

- **Personagens.** Atlas de Ibrahim e seu fiel escudeiro com oito quadros por direção e pose parada. As camadas usam os renders oficiais de corpo inteiro, com passos articulados e reconstrução das vistas traseiras. O cachorro mantém o rastro da Revisão 4.
- **Dois guardiões.** Arborian é o guardião da capa e o único chefe da Floresta Encantada. As novas poses usam recortes da capa oficial, com reconstrução das patas, da silhueta encoberta e das folhas. O chefe anterior e o SVG legado continuam nos caminhos originais, reservados para definição futura. A capa e ambas as imagens anteriores conservam os bytes da Revisão 4.
- **Áudio.** As três composições da Revisão 4 foram preservadas. O áudio agora tenta retomar em gestos válidos, inclusive na soltura do toque, e volta de uma suspensão. Há fallback para o fade quando a API `cancelAndHoldAtTime` não existe. Foi corrigido o agendamento que usava o começo do compasso como prazo, o que podia adiar repetidamente notas do meio do compasso. A fanfarra de vitória e os novos efeitos usam síntese local.
- **Combate.** Ataque normal tem preparação e impacto. Ataque Duplo executa o golpe de Ibrahim e o do cachorro com impactos separados e conserva o dano total anterior. Defesa mantém redução de 60%. A clava do Ogro e as raízes de Arborian têm animação e efeitos próprios. As ações bloqueiam os comandos até o fim do turno e o contra-ataque pendente pode ser retomado após um recarregamento.
- **Vitória.** Queda do inimigo, comemoração de Ibrahim e do cachorro, fanfarra, confetes e recompensas. CONTINUAR é liberado após cerca de cinco segundos do anúncio. A vitória do Ogro também aguarda o comando. O baú do chefe continua disponível e a concessão de diamantes e do baú é registrada no estado salvo.
- **Mochila, loja e coletas.** A mochila pausa o mapa. Remédio e Cura podem ser usados na exploração. Doce do Sono custa 35 moedas, funciona contra ambos os inimigos e impede duas rodadas ofensivas sem acumular. Os quatro preços existentes continuam iguais. Dez coletas fixas distribuem os cinco consumíveis, moedas, diamante e baús por áreas transitáveis. A concessão e a marca de coleta são gravadas juntas. O terreno da Revisão 4 foi preservado.
- **PWA.** Cache `ibrahim-v153-phase1-r5`, scripts com identificação de revisão e novas artes locais no conjunto offline. A chave do progresso permaneceu a mesma.

## Testes e evidências

- `node scripts/test-phase1.cjs` com Chromium, Pixel 7 emulado, toque, teclado e viewport móvel. O roteiro verifica os quatro sentidos de caminhada e o rastro, abertura da mochila e uso dos dois curativos, cinco itens e compra do Doce, duas rodadas de sono contra Ogro e Arborian, golpes e defesa, vitória sem recompensa duplicada, coletas alcançáveis e persistentes, derrota e tela cheia nativa no desktop.
- O analisador captou as três trilhas e a fanfarra. A exploração repetiu a primeira nota ao completar os 16 compassos, com a política de autoplay ativa. Os testes exercitaram retomada do AudioContext, fade sem `cancelAndHoldAtTime`, silêncio do controle de música e reprodução com a página offline.
- Uma origem local serviu a Revisão 4 e depois a Revisão 5. O novo service worker assumiu o controle, removeu o cache anterior, entregou a nova arte e preservou saldo, mochila e posição na recarga offline.
- As dez coletas também foram exercitadas por movimento no Chromium. Os créditos corresponderam ao tipo de recompensa e as marcas persistiram após recarga.
- As capturas e os vídeos ficam fora do repositório, em `/workspace/shared/downloads/revisao-5`. As gravações de tela não incluem áudio. A saída de áudio foi avaliada por analisador no navegador.

## Limitações e próximas etapas

- O teste no Android foi emulado. A causa exata da falha relatada no aparelho físico, o volume no alto-falante e a retomada após interrupções do sistema ainda precisam de validação em hardware.
- As vistas que a arte oficial não mostra e as regiões ocultas de Arborian são reconstruções. A conformidade artística final cabe à avaliação das capturas pelo proprietário.
- Nenhum serviço externo pago, Picsart ou crédito foi utilizado. As alterações permanecem locais, aguardando autorização para envio e eventual deploy de teste.

## Arquivos da revisão

- Entrada e cache: `index.html`, `sw.js`.
- Jogo: `scripts/phase1-combat.js`, `scripts/phase1-loot.js`, `scripts/phase1-music.js`, `scripts/phase1-sprites.js`, `scripts/phase1-world.js` e `scripts/phase1.css`.
- Arte: `assets/arborian/{idle,attack,defend,hurt,defeated}.webp`, `assets/walk-ibrahim.webp`, `assets/walk-dog.webp`, `assets/item-backpack.svg` e `assets/item-sleep.svg`.
- Validação e continuidade: `scripts/test-phase1.cjs`, `AGENTS.md` e `PROGRESSO.md`.

# Revisão 6

Base: `10a76085f5004373c40b533f78785af86b69f1d7`, na branch `dev-fase1-musica-companheiro`.

## Implementação

- A caminhada usa atlas recompostos a partir da arte oficial. Braços, pernas e patas têm fases alternadas, o tronco e a cabeça acompanham a passada, e a pose de parada usa quadros de assentamento. O cachorro percorre a mesma trilha com uma fase de movimento própria.
- A mochila no mapa usa couro escuro, moldura com detalhes dourados, compartimentos, indicadores de quantidade e descrições integradas. A barra vermelha mostra vida atual/máxima e anima a recuperação. A abertura e o fechamento têm transições e sons de couro e metal, que respeitam a opção Música.
- O **Corte Relâmpago** dura cerca de 2,5 s. Preparação até 0,7 s, execução até 1,2 s, impacto até 1,8 s e retorno até 2,5 s. A barra do inimigo muda no impacto. O áudio tem quatro etapas e a trilha continua em segundo plano com redução temporária de volume. O dano e o contra-ataque seguem as regras da Revisão 5.
- Cada coleta apresenta arte, quantidade, destino da recompensa e som. A janela pausa a entrada e os encontros. Ela fecha em três segundos ou ao tocar CONTINUAR. A recompensa e a posição são gravadas juntas. Os IDs e valores da Revisão 5 foram preservados.
- O rótulo Revisão 6 aparece abaixo da capa. O cache passou para `ibrahim-v154-phase1-r6` e scripts, CSS e atlas têm versão nas URLs. A página verifica o worker ao reabrir ou voltar à rede. `_headers` orienta a revalidação das entradas e do worker no Netlify. O armazenamento e o manifesto mantêm a identidade da PWA.

## Desempenho

A Revisão 5 redimensionava consultando o layout a cada quadro, redesenhava o terreno e as copas visíveis, e gravava o estado completo a cada passo. Também podia agendar um segundo quadro ao entrar na apresentação de encontro durante o próprio loop. A Revisão 6 usa observação de tamanho, compõe o cenário estático antecipadamente, repinta apenas copas que encobrem atores móveis, agrupa gravações de caminhada e mantém um só loop. A resolução interna tem teto de cerca de dois megapixels para vistas maiores.

Medição em Chromium com limitação de CPU 4×, quatro trechos de 670 ms por configuração. Os números abaixo são o intervalo p95 entre quadros, em ms. Menor é melhor.

| Configuração | Modo | Revisão 5 | Revisão 6 |
|---|---|---:|---:|
| Pixel 7 emulado | Normal | 83,4 | 50,0 |
| Pixel 7 emulado | Tela cheia | 66,7 | 50,0 |
| Perfil de tela grande, DPR 2 | Normal | 150,0 | 66,7 |
| Perfil de tela grande, DPR 2 | Tela cheia | 183,3 | 66,6 |

No Pixel 7 emulado, o canvas permaneceu em 756 × 1528 em ambos os modos. No perfil grande, passou de 1104 × 2010 para 1048 × 1908. O heap JS observado foi de aproximadamente 5–6 MB nas amostras, sem medir memória de GPU. O ambiente emulado manteve as dimensões CSS ao entrar no fullscreen nativo. Os resultados mostram a redução de trabalho na máquina de testes; o travamento relatado em Android físico ainda precisa ser reavaliado.

## Testes e evidências

- Chromium com toque e Pixel 7 emulado e teste desktop com fullscreen nativo. Caminhada nas quatro direções, rastro, colisão, quatro tempos do ataque, dano no impacto, trava contra comando duplicado, sono, defesa, compra, vitória e derrota.
- Viewport de 320 px, abertura e fechamento com som e opção mudo, cura e atualização da barra. As dez coletas foram percorridas em Chromium. O teste verificou a pausa, o fechamento manual, o timeout e a persistência das marcas após recarga.
- O teste comparou a síntese de áudio do ataque normal com a fase visual em execução. As trilhas existentes foram verificadas nos testes principais.
- A atualização real do worker da Revisão 5 para a 6 foi ensaiada na mesma origem. Após o novo worker assumir, a versão apareceu corretamente offline, o cache anterior saiu e saldo, posição e inventário permaneceram.
- O relatório de instalação do Chromium com perfil persistente retornou zero erros. O app foi instalado e lançado pelo protocolo do Chromium. A caminhada funcionou offline antes e depois do fullscreen nesse alvo. Em headless, o Chromium reportou modo browser para a janela lançada. Os dois vídeos incluem o áudio capturado da saída do sintetizador. As evidências ficam em `/workspace/shared/downloads/revisao-6`.

## Arquivos e limites

- Jogo: `index.html`, `scripts/phase1-world.js`, `scripts/phase1-terrain.js`, `scripts/phase1-sprites.js`, `scripts/phase1-combat.js`, `scripts/phase1-loot.js`, `scripts/phase1-music.js` e `scripts/phase1.css`.
- Arte: `assets/walk-ibrahim.webp`, `assets/walk-dog.webp` e `assets/forest-treasure.svg`.
- PWA e publicação futura: `sw.js` e `_headers`. Testes e continuidade: `scripts/test-phase1.cjs`, `scripts/benchmark-phase1.cjs`, `AGENTS.md` e `PROGRESSO.md`.
- A capa, Arborian, o guardião reservado, as três composições e o terreno da Fase 1 foram preservados. O terreno continua com os mesmos elementos e posições, com mudanças na renderização.
- A causa exata da versão antiga no endereço habitual do Netlify ainda é indeterminada. A troca de versão foi validada localmente. A aparência, a fluidez e a mixagem ainda dependem da avaliação em Android físico.
- Nenhum serviço pago ou crédito externo foi utilizado. A revisão está local até autorização expressa para envio e publicação de teste.
