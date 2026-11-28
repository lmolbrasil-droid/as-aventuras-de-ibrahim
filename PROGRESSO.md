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

# Revisão 7

Base: `85a4f1b99e2743b4d8a4cf6723677d51f10eaa7c`, na branch `dev-fase1-musica-companheiro`.

## Implementação

- **Caminhada.** O mapa monta a pose em tempo real. O pé plantado compensa o deslocamento do personagem até a fase de balanço. Joelhos usam dois segmentos com comprimentos definidos, quadril e braços seguem a transferência de peso, e quatro patas funcionam com fases distintas. A orientação acompanha a trilha do personagem e a amplitude é reduzida ao virar ou parar. Cabeça, orelhas e cauda acompanham o movimento do cachorro. As camadas de tronco conservam as texturas e cores oficiais; as articulações são desenhadas pelo Canvas.
- **Ritmo e golpe do Ogro.** O Corte Relâmpago mantém a sequência de 2,5 s. Em um golpe não fatal, o Ogro pausa 1,2 s antes da preparação. Depois executa preparação, arco da clava, impacto e retorno em 2,5 s, com câmera, rosnado, efeitos de movimento e batida no chão. A recomposição dura 0,8 s. A vida do jogador é atualizada no impacto. Os comandos ficam bloqueados até o fim. Sono e derrota suprimem o contra-ataque conforme as regras anteriores. O ataque de Arborian, a animação da Defesa e a sequência de Ataque Duplo foram preservados.
- **Queda e vitória.** O Ogro cai, permanece cerca de três segundos com estrelas animadas e entra na comemoração com transição. O instante da transição é salvo para evitar recomeço inteiro após reabrir. Os dois personagens passam a dividir a composição da comemoração, com a imagem aprovada de Ibrahim preservada. Valores, prêmios e CONTINUAR permanecem.
- **Controles.** Os botões de combate passam a usar ícones, bordas metálicas e quatro acabamentos de esmalte, com grade 2 × 2 uniforme. Os direcionais e a mochila no mapa ficam em uma linha responsiva acima da mensagem real, mantendo lados e área de toque.
- **PWA.** O worker instala um conjunto completo, verifica a identificação do HTML e os hashes SHA-384 dos scripts, CSS e textura versionada, e serve a navegação do mesmo cache. O endereço de instalação e o manifesto permanecem estáveis. Na migração R6→R7, o worker novo pode assumir sem recarregar a aba, e os arquivos exatos da Revisão 6 continuam disponíveis para ela. Revisões posteriores ficam aguardando até o usuário atualizar na página inicial ou fechar as janelas. A versão visível passou a Revisão 7.

## Testes e evidências

- Chromium desktop e Pixel 7 emulado. Roteiro completo de caminhada, painel da mochila, colisões, compras, ataques, defesa, sono, cura, fuga, captura, vitória e derrota, além de recarga offline. O roteiro compara os estágios do golpe do Ogro, mede o intervalo e verifica que o dano e o áudio de impacto ocorrem simultaneamente. Uma execução adicional verificou as estrelas, o intervalo até a vitória, a ausência de revide após derrota e os diamantes uma única vez.
- Os controles passaram com mensagens de uma e várias linhas em quatro perfis de viewport (320, 412, 689 e 910 px), antes e durante o fullscreen nativo. O modo de lançamento da PWA foi exercitado pela URL do manifesto.
- Atualização R6→R7 na mesma origem de testes, com substituição real do worker. Um HTML R6 entregue como resposta para instalar R7 foi rejeitado. Com o HTML correto, o jogo aberto continuou na Revisão 6, arquivos antigos permaneceram íntegros, o aviso apareceu ao retornar à página inicial e a recarga offline abriu a Revisão 7. Os dados em localStorage e IndexedDB permaneceram inclusive após reabertura pela URL do manifesto.
- Os quatro vídeos incluem caminhada nas quatro direções na Revisão 6 e na Revisão 7, turno inteiro contra o Ogro com áudio e queda até a vitória. As capturas registram os botões, os controles, a comemoração e a atualização.

## Arquivos, limites e publicação

- Interface, jogo e áudio: `index.html`, `scripts/phase1-combat.js`, `scripts/phase1-music.js`, `scripts/phase1-sprites.js`, `scripts/phase1-world.js` e `scripts/phase1.css`.
- Arte nova: `assets/forest-rig.webp`, `assets/ogre-fallen.webp` e `assets/combat-commands.svg`. A capa, o terreno, a arte dos dois guardiões e os manifestos da Revisão 6 continuam idênticos.
- Atualização e testes: `sw.js`, `scripts/test-phase1.cjs`, `AGENTS.md` e `PROGRESSO.md`.
- Em Chromium com limitação de CPU 4×, o Pixel 7 emulado registrou p95 de 50,0 ms normal e 33,4 ms em tela cheia, com canvas de 756 × 1528 nos dois modos. O perfil grande registrou 66,6 e 50,1 ms, respectivamente. São amostras curtas e não reproduzem a GPU do Android.
- O proxy retornou HTTP 403 para o endereço habitual e o endereço exclusivo da Revisão 6 no Netlify. A causa do atraso no endereço habitual não foi determinada. O endereço habitual e a URL exclusiva são origens diferentes e têm caches e armazenamento separados. A migração foi validada localmente na mesma origem, sem validação pós-deploy.
- A naturalidade, a mixagem e a estabilidade no Android físico ainda dependem da avaliação do proprietário. O perfil emulado não reproduz a GPU ou o sistema de áudio do telefone.
- O saldo de 484 créditos foi informado pelo proprietário. Nenhum serviço externo pago ou crédito foi utilizado nesta implementação. As mudanças permanecem locais, aguardando autorização expressa para envio e eventual deploy de teste.

# Revisão 8

Base `7966d409a68e4019070a22d777e821172d964473` na branch `dev-fase1-musica-companheiro`.

## Diagnóstico do endereço habitual

O status do PR nº 2 no GitHub associa o commit da Revisão 7 ao Deploy Preview concluído. A URL exclusiva registrada termina no deploy `6b0906c7daf2a48a045db5fa`. O proxy retornou HTTP 403 ao tentar abrir tanto o endereço habitual quanto o exclusivo. A inspeção direta dos objetos do CDN, de cabeçalhos e da configuração do site ficou bloqueada. O status do GitHub comprova a publicação do commit. O comportamento do alias e o HTML servido hoje ao Android ainda precisam de confirmação.

O manifesto declara identidade e escopo `./` e usa `./index.html?app=143` como URL de lançamento. O número 143 é parte do endereço de lançamento histórico. A versão em uso aparece abaixo da capa. A Revisão 7 verifica o HTML e os arquivos versionados na instalação e serve o HTML do worker ativo. Os dois endereços são origens distintas, com registros de service worker, Cache Storage e armazenamento local independentes. Chrome, navegador interno e janela instalada podem expor o mesmo endereço com armazenamento ou navegação diferentes. A comparação ainda falta no aparelho físico.

A página local `diagnostico-atualizacao.html` registra origem, modo de exibição, revisão do worker controlador, estado da atualização, escopo, caches do jogo, revisão do HTML e do worker pela rede, hash SHA-384 do script do mapa e cabeçalhos HTTP disponíveis. O endereço tem diretivas de cache próprias em `_headers`. A Revisão 8 mantém o conjunto versionado e valida os hashes do código e dos atlas. O botão de atualização só fica visível fora do mundo. A volta à rede e a reabertura de uma página visível podem antecipar a próxima verificação.

### Procedimento disponível agora no Android

1. No Chrome normal, abra o endereço habitual e o endereço exclusivo da Revisão 7 em abas separadas. Anote o endereço final da barra e a revisão abaixo da capa em cada aba.
2. Abra `/sw.js?diagnostico=20261127` em cada mesmo domínio e procure a linha `const REVISION`. Repita com outro número na consulta se necessário. Essa navegação consulta o script pela rede no worker R7. Se o download for oferecido, abra o arquivo como texto.
3. Abra o link habitual pelo ChatGPT e anote o endereço final e a revisão novamente. Se houver atalho instalado com a mesma origem, registre também sua revisão. Se o worker servido indicar 7 enquanto o jogo indicar uma revisão anterior, registre a diferença e use **Atualizar jogo** se o botão aparecer na página inicial. Se não aparecer, reabra o mesmo endereço no Chrome e confira novamente. Preserve os dados do navegador.
4. Após eventual publicação autorizada da Revisão 8 de teste, abra `/diagnostico-atualizacao.html` nos dois endereços. Compare `htmlDaRede`, `workerDaRede` e `workerDaAba`. Uma diferença entre a rede e a aba permite investigar a atualização local. Uma diferença já na rede entre os endereços orienta a inspeção do alias ou CDN. Guarde os códigos de resposta e identificadores `x-nf-request-id` quando aparecerem.

A primeira proposta é verificar a vinculação do Deploy Preview existente no painel. Se o alias do PR continuar inconsistente, avaliar um alias permanente de Branch Deploy da branch de testes, condicionado à configuração do Netlify. Outra possibilidade é um site isolado para testes. Uma origem nova exigiria migração explícita para carregar o progresso anterior. Qualquer ação externa depende de autorização.

## Arte e som

- A caminhada descarta as articulações em tempo real. A versão local apresenta provisoriamente os quadros inteiros da Revisão 6 com seleção pela distância, quatro direções, repouso e assentamento. O roteiro de comparação segue a mesma volta nas duas versões. As folhas mostram os atlas existentes. A etapa de criar poses definitivas foi pausada por falta de quadros que atendam à anatomia e à fidelidade exigidas. Uma alternativa é modelar os dois personagens inteiros no Blender local, sem custo de licença ou créditos, e validar poses-chave com a capa antes do ciclo completo. Outra é contratar um artista 2D para entregar poses desenhadas nas quatro direções com revisão de fidelidade. Custo sujeito a orçamento e aprovação antes de contratação.
- As duas arenas foram renderizadas localmente sem personagens. A clareira do Ogro tem chão aberto entre pedras, samambaias, raízes e árvores. A de Arborian usa árvores mais antigas, raízes expostas, pedras rúnicas e iluminação própria. Sombras de contato e alinhamento ao plano do chão foram aplicados aos quatro personagens.
- As cinco poses de Arborian usam um modelo quadrúpede original orientado pela capa, com chifres ramificados, folhagem, armadura de madeira e medalhão. A folha registra espera, ataque, defesa, dano e derrota. A interpretação visual ainda precisa de aprovação.
- As cinco poses do Ogro receberam correção localizada da transparência e do contorno. Os comparativos mostram as versões sobre superfícies claras e escuras. A queda e as estrelas continuam nos mesmos tempos.
- O rótulo e o ícone foram centralizados nos botões. O Ataque Duplo exibe os rostos de Ibrahim e seu cachorro, extraídos da arte oficial. A vitória mantém a imagem aprovada de Ibrahim, aproxima o cachorro e centraliza o quadro visual **CONQUISTA DESBLOQUEADA** e seu diamante.
- O Corte Relâmpago usa síntese própria de preparação, corte, impacto grave e dissipação. Os pontos de disparo continuam no roteiro de combate anterior. As trilhas, os comandos e os demais efeitos usam as implementações anteriores.

## Arquivos

- Jogo e apresentação em `index.html`, `scripts/phase1.css`, `scripts/phase1-sprites.js` e `scripts/phase1-music.js`.
- Arte em `assets/arena-ogro-r8.webp`, `assets/arena-arborian-r8.webp`, `assets/dupla-rostos.webp`, `assets/ogre-r8/` e `assets/arborian-r8/`.
- Atualização e diagnóstico em `sw.js`, `_headers` e `diagnostico-atualizacao.html`. Cobertura da revisão em `scripts/test-phase1.cjs`. Continuidade em `AGENTS.md` e `PROGRESSO.md`.
- O trabalho permanece local e aguarda autorização expressa. Consumo de serviços pagos nesta revisão igual a zero. O último saldo informado foi 484 créditos antes de publicar a Revisão 7. O saldo atual do Netlify permanece sem verificação.

## Validação e evidências

- `scripts/test-phase1.cjs` passou em Chromium desktop e perfil de toque Pixel 7. O roteiro confirmou caminhada e colisão, rastro, loja e mochila, sincronização do dano e das fases do Corte Relâmpago, contra-ataque do Ogro, vitória e derrota, recompensas únicas, sono, captura, fuga e retorno à trilha. O fluxo móvel principal terminou sem erros no console. Em viewport de 320 px, os quatro botões mediram 143,5 × 62 px, com ícones e texto dentro das bordas.
- Na troca real de workers R7→R8 em uma origem local, o teste rejeitou HTML R7 entregue durante a instalação do worker R8. Com a resposta correta, a R7 continuou em uso durante a exploração. Ao reabrir a página inicial com o worker novo aguardando, **Atualizar jogo** apareceu. O teste ativou e recarregou a R8 offline e preservou moedas, diamantes, inventário, posição e a amostra de IndexedDB. A mesma origem reabriu offline pela URL do manifesto. O relatório de diagnóstico foi exercitado com a rede local ativa.
- A gravação do novo golpe inclui a trilha e o revide. A medição do áudio da gravação encontrou pico de −10,3 dBFS, sem indicação de recorte nessa amostra. A mixagem e a naturalidade visual ainda precisam ser avaliadas no telefone.
- Os vídeos, as folhas provisórias, os fundos isolados, as cinco poses de Arborian, os comparativos do Ogro, as capturas de combate e vitória e os resultados dos testes estão em `/workspace/shared/downloads/revisao-8`.
- Na mesma rota curta em Chromium com CPU limitada a 4×, o p95 do intervalo entre quadros no Pixel 7 emulado passou de 50,0 para 100,0 ms no modo normal e de 50,0 para 116,7 ms em tela cheia. No desktop com DPR 2, os quatro valores foram de 66,7 ms. A superfície do canvas permaneceu nas mesmas dimensões. A amostra móvel ficou mais lenta e precisa ser confirmada em hardware físico.

## Complemento da Revisão 8

### Proposta de endereço permanente de teste

Sugestão condicionada à configuração do Netlify: `https://dev-fase1-musica-companheiro--aventurasdeibrahim.netlify.app/`. Esse é o formato padrão de um **Branch Deploy** para a branch de testes no projeto existente. A disponibilidade desse alias precisa ser confirmada no painel. A vantagem é manter um endereço vinculado à branch, independente do PR nº 2. Os endereços exclusivos continuariam disponíveis para conferir cada build. O endereço do PR atual deve continuar disponível durante qualquer transição aprovada.

1. Com autorização, verificar a branch publicada atualmente em produção, as páginas e regras de deploy, o histórico do PR nº 2 e se o Branch Deploy está habilitado para **essa branch específica**. Conferir publicações duplicadas antes de adicionar um segundo fluxo de teste. Um projeto novo só seria necessário para separar configurações, acesso ou cobrança de um projeto que não pode atender as duas necessidades.
2. Em cada publicação futura autorizada, o Netlify construiria o commit da branch de testes. A validação compararia commit, página inicial, arquivo do worker, hash de recurso e ID do deploy no alias permanente e na URL exclusiva. O alias seria divulgado somente após essa conferência. Um nome fixo sozinho não comprova que o navegador recebeu a revisão nova.
3. Habilitar um fluxo adicional pode aumentar builds, requisições de teste e tráfego. A cobrança depende do plano, das regras vigentes e de quantas publicações o mesmo push dispara. O saldo de 484 créditos é histórico. Antes de habilitar qualquer mudança externa, conferir o painel **Usage & billing** e obter autorização caso exista consumo pago adicional. O custo atual do Netlify permanece sem confirmação.
4. A instalação PWA seria feita uma vez no alias novo. Manifesto e escopo permaneceriam estáveis nesse domínio. Com a primeira carga completa, o worker guarda a versão para uso offline. Em revisões futuras, o navegador verifica o worker ao abrir ou reconectar, baixa um conjunto consistente e oferece **Atualizar jogo** ao retornar à página inicial. A aba de jogo continua com o conjunto já ativo enquanto o novo aguarda.
5. Chrome e a PWA associam progresso e cache à origem. Migrar para o alias novo exige transferência explícita. Proposta para uma etapa autorizada: exportar um backup JSON local no endereço antigo, validar estrutura e versão na importação no novo, preservar o estado já existente com cópia de segurança e confirmar moedas, XP, diamantes, inventário, posição, atividades e recompensas após recarga e uso offline. Evitar mesclar saldos automaticamente. Manter o endereço antigo e o arquivo de backup até validar o destino. A exportação e a importação ainda não foram implementadas.
6. O caminho alternativo é manter a origem habitual e reparar sua vinculação após identificar o ponto de atraso. Isso mantém a instalação e os dados no mesmo domínio. O Branch Deploy elimina a dependência do PR para o endereço, mas tem custos de transição da origem. Um projeto separado pode melhorar o isolamento e exige configuração, migração e conferência de cobrança próprias.

O proxy voltou a responder HTTP 403 para os dois endereços. No Android ainda falta registrar o endereço final, a revisão visível e o `const REVISION` do script servido pela rede para cada endereço, em abas do Chrome e no leitor interno do ChatGPT. Se ainda houver uma instalação, anotar a barra de revisão dela também. Em um ambiente que já sirva a página de diagnóstico, comparar `htmlDaRede`, `workerDaRede`, `workerDaAba`, escopo, caches, `Age`, `ETag` e `X-NF-Request-ID`. Um relatório de rede atualizado com uma aba antiga orienta a inspeção do worker local. Um relatório de rede antigo no alias orienta a inspeção do Netlify. O antes e depois deste complemento preservam o mecanismo de service worker. Somente os hashes dos arquivos de renderização foram atualizados.

### Desempenho do mapa

- O canvas opaco usa um orçamento de 825.000 pixels em telas de toque com até 850 px de largura. A câmera, as dimensões CSS, os controles e as coordenadas continuam os mesmos. A superfície mudou de 756 × 1528 para 639 × 1291 no perfil Pixel 7, uma redução de aproximadamente 29% dos pixels por quadro. O orçamento desktop permanece 2 milhões de pixels.
- A camada opaca do terreno evita composição alfa e as coordenadas fixas dos vaga-lumes são calculadas uma vez. O laço principal continua com um único `requestAnimationFrame`, deslocamento guiado por tempo e redimensionamento condicionado às alterações de viewport ou DPR. As animações e as texturas permanecem disponíveis.
- Os dois atlas provisórios medem 2720 × 768 e ocupam aproximadamente 984 KiB comprimidos ou 15,9 MiB juntos se decodificados em RGBA integral. A textura articulada da R7 ocupava 47,2 KiB comprimidos e cerca de 0,94 MiB em RGBA. Há mais memória potencial para decodificação com os atlas. Esses números estimam superfícies, sem medir cache ou memória da GPU. Os atlas são reutilizados por imagens persistentes, sem decodificação explícita no laço do mapa.
- As arenas de 1200 × 719 pesam 156,5 e 162,2 KiB. A regra CSS da imagem de fundo depende do encontro ativo. O cache offline inclui esses arquivos. A cena aplicada durante o benchmark foi a de exploração. O cenário, os efeitos de combate e a síntese de áudio ficaram iguais antes e depois da intervenção, e as medições não atribuem a eles a diferença observada no mapa.
- O novo benchmark aquece o mapa por um segundo. Em cada amostra, o mesmo percurso de ida e volta alterna teclas a cada 800 ms durante 6,4 s. Em duas rodadas, a ordem das versões é invertida, com contextos novos, mesma máquina e redução de CPU de 4×. O teste registra a média de FPS, p50, p95, superfície, DPR e heap JavaScript. O heap não inclui texturas ou memória do compositor. O teste verifica fullscreen nas mesmas dimensões CSS, como ocorre no emulador.
- No Pixel 7 emulado, a R8 anterior marcou 30,9 FPS médios no modo normal e 30,1 em tela cheia. A otimizada marcou 45,8 e 39,5 FPS, respectivamente. O p95 otimizado ficou em 33,4 ms em ambos os modos e rodadas, frente a 50,0 ms em tela cheia na R8 anterior. O teste pareado não reproduziu o pico histórico de 116,7 ms. O ganho medido demonstra a redução de trabalho da renderização do mapa nessas condições. A causa exata do pico histórico e o desempenho em Android físico continuam em aberto. No desktop em tela cheia, as duas amostras da R8 otimizada variaram de 50,1 a 83,4 ms, ante 66,7 ms na R8 anterior. O orçamento desktop ficou igual e não há ganho consistente nesse modo.
- O heap do perfil móvel ficou em 5 MB no modo normal e 6–7 MB em tela cheia na R8 anterior e na otimizada. As tabelas com FPS, p50, p95 e heap e as amostras JSON ficam em `/workspace/shared/downloads/revisao-8-complemento`.

### Maquetes e aprovação visual

- Blender 4.3.2 em CPU, com limite de quatro núcleos e 32 GiB de memória no contêiner. Foram produzidas doze imagens de corpo inteiro. Cada personagem tem quatro vistas em repouso, uma pose de contato e uma pose de passagem. O chão de estúdio mostra os apoios dos pés ou patas.
- A capa oficial acompanha as folhas. Para Ibrahim, a modelagem inclui mechas castanhas, camisa ocre, lenço, mochila com rolo verde, espada e escudo. No cachorro, inclui pelagem creme e caramelo, orelhas caídas e medalha. A capa oferece principalmente vistas em três quartos. As costas, os componentes ocultos e parte das proporções foram interpretados. Expressões e silhuetas ainda precisam de avaliação lado a lado com a arte oficial.
- O arquivo-fonte das maquetes acompanha as evidências para permitir ajustes após a avaliação. Os ciclos completos e a integração ficam pendentes de aprovação. O mapa continua com os atlas provisórios da R8.
- Fase 2 e configuração do Netlify permanecem fora da implementação local. Consumo de créditos pagos no complemento igual a zero.
- O roteiro funcional da R8 otimizada passou em Chromium com toque e desktop, incluindo o mapa, os dois combates, a persistência dos dados, o funcionamento offline e o retorno após combate em tela cheia. Nenhum recurso de arte do jogo foi alterado neste complemento. A comparação de capturas mostra a área e os controles nas mesmas posições, com leve redução de nitidez no mapa móvel em tamanho ampliado.

## Integração local do ZIP de sprites da Revisão 8

- O ZIP foi extraído e inventariado. Contém 114 arquivos, dos quais 109 são recortes catalogados no manifesto, três são pranchas de referência e dois são arquivos de documentação do pacote. As pranchas, o manifesto e o texto foram consultados para avaliar origem, ordenação e pontos de apoio.
- Os 60 quadros de caminhada foram ordenados e conferidos nas quatro direções. Foram removidos fragmentos da moldura e resíduos desconectados, com preservação da borda alfa. Usamos escala uniforme por personagem, células de 128 × 120, ponto de apoio na linha 116 e repousos extraídos da prancha de referência. Ibrahim usa oito quadros por direção e o cachorro sete. O terreno, o acompanhamento do cachorro e o cálculo de deslocamento permanecem iguais. Os dois atlas WebP com alfa ocupam cerca de 650 KiB juntos, abaixo dos cerca de 984 KiB dos provisórios. A área decodificada estimada caiu de 15,9 MiB para cerca de 4 MiB em RGBA.
- Na planilha do cachorro, os cortes automáticos misturavam os quadros intermediários do ataque duplo e da defesa com partes das poses vizinhas. A prancha tem cinco poses nessas linhas, enquanto o pacote tentou extrair seis. As poses de preparação, impacto e recuperação do ataque duplo e a defesa foram recortadas de novo na fonte. Quadros cortados, redundantes ou com arcos que duplicariam os efeitos do jogo ficaram fora. O Corte Relâmpago e o ataque duplo usam poses selecionadas nos tempos existentes. As regras de dano, bloqueio e recompensa foram preservadas.
- A arte de combate ativa tem 23 poses. As cinco de Arborian vêm exclusivamente da prancha infantil fornecida pelo usuário. O herói em combate usa a nova arte, enquanto a tela de vitória preserva a ilustração aprovada de Ibrahim e exibe a nova pose do cachorro. Os cenários, o Ogro, o áudio, o ícone do ataque duplo e o quadro de recompensas foram mantidos.
- O pacote preliminar tem resolução de origem limitada. As pranchas também têm pequenas variações de equipamento e silhueta entre repouso e marcha, perceptíveis quando ampliadas. Foram corrigidos resíduos e encaixes de apoio. A anatomia e as características originais foram mantidas. As folhas tratadas e os vídeos permitem avaliar a transição na escala real do jogo.
- Alterações deste complemento em `index.html`, `scripts/phase1-sprites.js`, `scripts/phase1-combat.js`, `scripts/phase1.css`, `scripts/test-phase1.cjs`, `sw.js`, `AGENTS.md` e `PROGRESSO.md`. Arte em `assets/walk-*-r8-aprovado.webp` e `assets/poses-r8-aprovadas/`. O worker mantém sua lógica, sua revisão e sua estratégia de atualização. Somente o conjunto de arquivos e as verificações de integridade foram atualizados.
- A entrega permanece local em `dev-fase1-musica-companheiro`, sem push, merge, publicação, créditos pagos ou início da Fase 2.

O roteiro funcional passou em Chromium desktop e no perfil Pixel 7 emulado. Verificou quadros distintos nas quatro direções, combates, dano sincronizado, bloqueios, recompensas, persistência, cache offline e tela cheia. Um ensaio adicional sem rede verificou as poses de preparo, ataque, recuperação e vitória do cachorro no Ataque Duplo contra Arborian e a imagem preservada de Ibrahim na vitória. Os três vídeos com áudio e as folhas tratadas estão em `/workspace/shared/downloads/revisao-8-sprites`. A avaliação no aparelho físico permanece pendente.

## Revisão 9

Base `076e503d22a1ea60237f33e7392de492fd01058f` na branch `dev-fase1-musica-companheiro`. A identificação abaixo da capa é Revisão 9.

- Os atlas derivados da arte aprovada usam correção de escala uniforme por quadro, com variação limitada a 6%, centrada na linha de apoio. A seleção continua ligada à distância percorrida. A passagem ao repouso ocorre mais perto do fim do passo. As silhuetas e os acessórios fornecidos têm pequenas diferenças intrínsecas entre quadros e repousos. Permanecem visíveis em ampliação, sem reconstrução de partes ou alteração do personagem.
- As arenas da R8 ganharam mais espaço vertical em telas altas. Ibrahim e cachorro foram ampliados com escala proporcional em torno da base. Os comandos tiveram texto ampliado. Cores, ícones, sombras, layout do mapa e orçamento de renderização foram preservados. A vitória comum aproxima os dois personagens e conserva arte, música e prêmios.
- Corte Relâmpago usa uma gravação sintética original de três segundos em quatro trechos que o jogo dispara nos estágios existentes. A composição combina notas de concentração, deslocamento de ar, ressonância de lâmina, impacto de malhete e sinos de dissipação. A queda de vida e as animações permanecem nos mesmos tempos.
- Arborian permanece na pose aprovada por quatro segundos depois que a sequência do golpe encerra. Uma iluminação dourada de dois segundos precede a tela FASE CONCLUÍDA. O prazo é persistido para retomada após recarga. O novo arranjo orquestral de aproximadamente 12 segundos usa cordas, trompa, harpa, flauta e percussão. A opção de música segue a configuração existente. Os dois diamantes e o baú continuam usando os mesmos valores e mecanismos de concessão única. CONTINUAR A AVENTURA devolve o jogador à trilha existente.
- Arquivos alterados em `index.html`, `scripts/phase1-{music,sprites,world}.js`, `scripts/phase1.css`, `scripts/test-phase1.cjs`, `sw.js`, `AGENTS.md` e `PROGRESSO.md`. Novos recursos em `assets/walk-ibrahim-r9.webp`, `assets/walk-dog-r9.webp`, `assets/corte-relampago-r9.wav` e `progresso-local.html`. A estratégia de atualização do worker e os manifestos permanecem R8 em comportamento, com identificação e conteúdo do cache atualizados.
- Nenhum push, merge, alteração externa, publicação, início da Fase 2 ou consumo de créditos pagos.

### PWA no Android e endereço permanente

O PR nº 2 confirmou que o deploy exclusivo `6b0935885fc5cd37fa7e00d0` da R8 estava pronto. No Android, o link exclusivo exibiu a R8, enquanto o habitual exibiu uma interface sem o indicador de revisão e sem a mochila do mapa. A barra **Collaborate / Log in** identifica a presença do Netlify Drawer. Sua presença não determina qual HTML ou worker o navegador recebeu. Uma versão suficientemente antiga do shell, seja servida pelo endereço ou persistida no navegador, explica a ausência conjunta desses elementos. A causa exata depende de observar a rede e o worker no aparelho afetado.

O proxy respondeu HTTP 403 no túnel tanto para o alias do PR e a URL exclusiva quanto para o alias proposto `https://dev-fase1-musica-companheiro--aventurasdeibrahim.netlify.app/`. A resposta do servidor de origem, a disponibilidade do alias, o plano da conta e a configuração do Drawer ficaram sem verificação. Os manifestos mantêm `id` e escopo em `./` e `start_url` em `./index.html?app=143`. As origens diferentes têm Cache Storage, registros do worker e localStorage próprios. Os recursos versionados e seus hashes impedem a instalação de um pacote com HTML de revisão incompatível.

1. No Android, abrir os dois links em Chrome normal. Anotar a URL final, a revisão abaixo da capa, a presença da barra do Netlify e a versão mostrada por `/sw.js?diagnostico=20261127` em cada domínio. Repetir no navegador interno do ChatGPT e na PWA instalada, se houver. Manter os dados e caches existentes durante o diagnóstico.
2. Se `/diagnostico-atualizacao.html` já estiver disponível no endereço, recolher os campos de revisão do HTML pela rede, worker ativo e servido pela rede, escopo, caches, `Age`, `ETag` e `X-NF-Request-ID`. Se estiver ausente, anotar o código de resposta. Rede nova e aba antiga orientam a investigação do navegador/worker. Rede antiga somente no alias orienta a investigação da vinculação do deploy e do CDN. Comparar com o Drawer desativado somente após conferir a configuração e obter autorização externa.
3. Se o alias do PR continuar instável, o Branch Deploy pode usar esse nome permanente da branch de testes no mesmo projeto, sujeito à configuração. Conferir se o Netlify permite habilitar somente essa branch e desativar a opção de colaboração no contexto desejado. Deixar simultaneamente o PR Preview e o Branch Deploy habilitados pode gerar dois builds por push. Identificar os gatilhos efetivos e aprovar um único fluxo antes da próxima publicação. O custo depende do plano, do tipo de deploy e da utilização de tráfego e build. O painel de cobrança não pôde ser consultado, então nenhum valor por deploy foi confirmado.
4. Caso a mudança de domínio seja autorizada, disponibilizar primeiro a ferramenta Backup de progresso na origem com os dados. Se esse endereço continuar preso numa revisão antiga e não entregar a ferramenta, recuperar acesso a essa origem antes de migrar. Exportar JSON localmente, verificar no destino, guardar o backup anterior do destino e aprovar a substituição. Conferir saldo, missões, inventário e posição. O backup copia a chave do jogo e preserva todos os campos do progresso. Cache de recursos e ajustes independentes de volume permanecem por origem. No destino, instalar uma vez e testar reabertura offline e atualização pelo mesmo domínio.

O ensaio local R8→R9 rejeitou HTML incompatível, manteve o jogo aberto na R8, ofereceu ativação na capa, recarregou na R9 offline e preservou o progresso e a amostra IndexedDB. A migração entre duas origens rejeitou arquivo inválido, baixou cópia anterior do destino e restaurou exatamente o progresso exportado. Esses ensaios não determinam a configuração do Netlify nem a causa da divergência observada no Android.

Os testes em Chromium com Pixel 7 emulado e desktop passaram. Os quatro botões ficaram inteiros em 320 × 620, 393 × 830 e 1100 × 760. O roteiro mediu os estágios do chefe, verificou o novo áudio do golpe no momento previsto e completou a vitória comum, o baú, a volta ao mapa e o uso offline sem erros de console no fluxo móvel principal. Uma recarga durante a queda preservou o prazo da transição e, após abrir o baú, as recompensas permaneceram únicas em outra recarga. Nos vídeos gravados, o áudio teve pico abaixo de −6 dBFS.

No percurso pareado de 6,4 s em Chromium com CPU limitada a 4×, o Pixel 7 emulado passou de 35,6 a 46,3 FPS no modo normal, com p95 de 50,0 a 33,4 ms. Em tela cheia, registrou 42,2 FPS na R8 e 41,2 na R9, com p95 de 33,4 e 50,0 ms. No desktop, o p95 foi de aproximadamente 66,7 para 50,1 ms nos dois modos. São amostras curtas, com desempenho móvel em tela cheia ainda por confirmar no Android físico. O canvas manteve 639 × 1291 no móvel. As medições brutas, vídeos e capturas estão em `/workspace/shared/downloads/revisao-9`.

## Revisão 10

Base `810ddb354b3fb836f3575f4ff7892d992e5a51f5` em `dev-fase1-musica-companheiro`.

- **Arborian.** Usa o mesmo conjunto de cinco poses da Revisão 9. Na largura limitada, a área reservada ao sprite passa de 55% com escala 1,13 para até 110%, limitada pelas dimensões da arena e pela área visível do recorte. A altura disponível limita a escala em arenas baixas e telas maiores. O chefe usa a linha de apoio anterior, com sombra proporcional e efeitos de ataque mais próximos do centro do corpo. A animação de investida mantém os estágios e tem elevação reduzida para manter os galhos dentro do quadro. Atributos, dano, recompensas, pose de derrota e transição de conclusão permanecem.
- **Música.** A exploração conserva sua partitura e seu arranjo. O Ogro usa composição nova em Mi menor a 156 BPM, com cordas curtas, percussão sincopada e sopros. Arborian usa composição nova em Ré menor a 78 BPM, subdivisão ternária, metais, tambores graves e camada coral sintetizada. O combate assume a trilha já na apresentação do inimigo. A troca tem uma atenuação de 45 ms antes de subir a próxima trilha. As músicas de vitória e os controles de áudio foram preservados.
- **Canal alfa.** Foram verificados os 32 quadros de caminhada, os quatro repousos e as dez poses de combate de Ibrahim. A comparação usou os quadros aprovados e fundos claro, escuro e verde. Na cabeça, foram preenchidos pixels semitransparentes confinados ao interior da silhueta. Pixels internos cuja cor se perdeu foram recuperados pela vizinhança opaca. Os contornos externos, acessórios e desenho foram mantidos. As artes anteriores continuam disponíveis e a ilustração aprovada da vitória mantém seu arquivo.
- **Voz.** O ambiente não ofereceu gravação infantil autorizada ou recurso gratuito validado para uma voz natural em português. Os efeitos de lâmina, energia e impacto da Revisão 9 continuam ativos. Uma alternativa sem contratação é integrar gravações originais autorizadas com direções curtas de esforço, ataque e “Corte Relâmpago!”, gravadas com supervisão e consentimento do responsável. Outra opção é licenciar uma interpretação profissional depois de orçamento e aprovação. Nenhuma síntese robótica, imitação de voz real ou despesa foi incluída.
- **Ogro.** A reação ao golpe normal dura cerca de 0,5 s dentro do tempo existente do impacto. Ele volta à pose neutra antes da clava. A recuperação do contra-ataque usa 0,5 s e a preparação usa 0,5 s, preservando os estágios de balanço, impacto e retorno. O giro curto da recuperação preserva o ponto de apoio. A sequência fatal entra diretamente na derrota, sem contra-ataque.
- A identificação do jogo e o cache offline passaram a Revisão 10. Sem push, merge, publicação, alteração de `main`, contratação de serviços ou início da Fase 2.

O ensaio local R9→R10 rejeitou HTML incompatível, conservou os arquivos da R9 enquanto a aba estava aberta, atualizou o aplicativo offline e preservou localStorage e a amostra IndexedDB. A medição das cinco poses em 320 × 620, 393 × 830, 740 × 395 e 1100 × 760 manteve os contornos internos à arena. Em 393 × 830, o sprite de espera apresentou cerca de 184 px de largura visível. As evidências ficam em `/workspace/shared/downloads/revisao-10`. Falta avaliar aparência e mixagem no Android físico.

O roteiro final passou em Chromium desktop e no Pixel 7 emulado, incluindo os dois combates, recompensa única, os sinais distintos de áudio, a retomada de encontros, o funcionamento offline e o retorno da derrota em tela cheia.

### Continuação da Revisão 10

- **Rede de Captura.** Removida do catálogo de itens, da mochila, da geração de recompensas, dos pontos de coleta e da ação de combate. O ponto `river-net` ficou vazio. Quantidades antigas continuam em `inventory.rope`; históricos de coleta, companheiros já capturados e backups permanecem carregáveis. Os únicos itens jogáveis são Remédio (18 moedas), Cura (7 diamantes), Bomba de fumaça (25 moedas) e Doce do Sono (35 moedas).
- **PWA.** O proxy retornou HTTP 403 para o alias habitual, o link exclusivo da Revisão 9, o alias de Branch Deploy proposto e o painel do Netlify. As respostas do servidor e o estado do cache do aparelho continuam sem verificação. O diagnóstico e a migração descritos na R9 continuam disponíveis. A estratégia do worker permanece a mesma, com atualização da versão e do inventário de recursos. Nenhum gatilho, domínio ou publicação foi configurado. A disponibilidade e a cobrança do alias não puderam ser confirmadas. Um Branch Deploy no mesmo projeto continua condicionado à configuração de branch e à escolha de um único gatilho para evitar builds duplicados.
- **Arquivos.** `index.html`, `scripts/phase1-{combat,loot,music,sprites,world}.js`, `scripts/phase1.css`, `scripts/test-phase1.cjs`, `sw.js`, `assets/walk-ibrahim-r10.webp`, `assets/poses-r10-ibrahim/`, `AGENTS.md` e `PROGRESSO.md`.

A comparação repetiu a mesma rota de 6,4 s nas revisões publicadas R8 e R9 e na R10 local, com CPU limitada a 4× e ordem invertida na segunda rodada. No Pixel 7 emulado em tela cheia, o p95 foi 33,4 ms nas duas amostras da R8, 50,1–100,0 ms na R9 e 33,4 ms nas duas da R10. A dimensão CSS e o canvas de 639 × 1291 permaneceram iguais. O limite de pixels e o cálculo do DPR não mudaram em relação à R9. O atlas corrigido mantém a mesma área decodificada e é cerca de 11 KiB menor. As amostras confirmam a diferença em tela cheia nesse emulador, mas não isolam a causa da instabilidade da R9 nem reproduzem a GPU do aparelho físico.

Em desktop, a R10 em tela cheia teve p95 de 483,3 ms em uma rodada e 50,0 ms na outra. Esse pico não se repetiu. Sem perfil do aparelho físico ou amostras longas da GPU, sua causa segue aberta. O ensaio de áudio confirmou que o ganho da trilha anterior chega a zero antes de subir o da próxima nos contextos testados. A importação de um backup legado preservou sete redes e o registro da coleta anterior, e a loja apresentou apenas os quatro itens disponíveis.

## Revisão 11

Base `faab31975b12db07011dbb4031d0fc26bd288612` na branch `dev-fase1-musica-companheiro`. A metodologia passa a usar revisões pequenas, limitadas aos pontos explicitamente aprovados, com evidências específicas e regressão das funcionalidades existentes.

1. **Castelo.** O histórico identifica o emoji como elemento de cenário desde o primeiro commit de importação. A classe só controlava posição, tamanho e filtro. Sem eventos, estado ou regra de combate vinculados, o elemento e seus seletores foram removidos.
2. **Comandos.** Os quatro textos principais passaram de 14 a 18,2 px, aumento de 30%. O texto secundário do Ataque Duplo manteve o tamanho. Em 320 e 393 px, a medição comparativa confirmou as mesmas dimensões e posições dos botões e dos ícones. O rótulo maior do Ataque Duplo pode ocupar duas linhas.
3. **Vitória comum.** A animação das imagens foi removida apenas do cartão comum. Foram mantidos os arquivos e as posições de repouso já definidas na R10, além do título, dos demais elementos e da música. A tela de Arborian conserva a animação.
4. **Dentes.** O histórico foi conferido nos commits da arte anterior, da R8 e da R10. O recorte da R8 contém perda de alfa em partes da boca. A recuperação de alfa da R10 preencheu parte da região com cores de vizinhança. Foram alinhados os pixels da prancha original aprovada da mesma pose e restaurados apenas 21 pixels RGB dentro da boca no sprite usado após derrotar o Ogro. A comparação com a R10 confirma que todo o canal alfa e os demais pixels são idênticos. A arte da tela de vitória comum e a pose de Arborian continuam apontando para seus arquivos anteriores.

Arquivos modificados em `index.html`, `scripts/phase1.css`, `scripts/phase1-sprites.js`, `scripts/test-phase1.cjs`, `sw.js`, `AGENTS.md` e `PROGRESSO.md`. O novo arquivo é `assets/ibrahim-vitoria-dentes-r11.webp`. A identificação visível passou a Revisão 11. Para o funcionamento offline, foram atualizados somente a identificação, os caminhos versionados, os hashes e a lista de recursos da entrega. A lógica do worker, os manifestos e os dados salvos foram preservados.

Implementação local, sem push, merge, alteração de `main`, publicação, serviço pago ou trabalho na Fase 2. Evidências em `/workspace/shared/downloads/revisao-11`.

A regressão em Chromium desktop e Pixel 7 emulado passou, incluindo os dois combates, recompensas únicas, persistência, funcionamento offline e tela cheia. O ensaio visual registrou 24 amostras sem deslocamento dos personagens após a entrada original do cartão, confirmou o retorno pelo botão CONTINUAR e verificou que a animação original segue ativa na vitória de Arborian. As capturas foram comparadas com a R10 local. Os prints citados não foram anexados ao pedido, e a posição de repouso da R10 foi usada como referência da composição estática.

## Revisão 14 · cachorro no mapa

Base `7b53dd6ee843a211413f85e135129c27c6d86de2`. A caminhada usa os quadros do atlas aprovado numa ordem de apoio, avanço e retorno ao apoio por direção. A fase acompanha o deslocamento do cachorro dentro de cada passo. Ao parar, o cachorro volta ao quadro de repouso. A escala de desenho no mapa passou de 0,73 para 0,5475, com o mesmo ponto de apoio e sombra proporcional. As posições na grade e o rastro do companheiro permanecem os mesmos.

A comparação local em 393 × 830 CSS px exercitou as quatro direções, curvas, paradas e retomadas. A captura do canvas confirmou 25% de redução nos dois eixos, ponto de apoio estável e distância de uma casa depois de cada parada. A regressão cobre as quatro direções e os fluxos de jogo. Os dois hashes dos scripts de mapa foram atualizados para o cache offline. A entrega aguarda aprovação visual.
