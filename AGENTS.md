# As Aventuras de Ibrahim

- Trabalhe na branch `dev-fase1-musica-companheiro` e use a ponta mais recente dessa branch como base para novas revisões. Preserve o trabalho local já existente.
- Preserve a branch `main` e a publicação oficial no Netlify. Serviços pagos e créditos externos exigem autorização explícita.
- Preserve as atividades, recompensas, moedas, diamantes, XP, inventário e progresso salvo. Mantenha a chave `minhaAventuraKids_v1` e use migrações aditivas para dados antigos.
- Preserve a arte oficial de apresentação da Fase 1, a identidade de Ibrahim e do cachorro e o escopo da Floresta Encantada. Novas fases dependem de aprovação.
- Use recursos locais para o jogo e inclua recursos essenciais no cache da PWA. Incremente a revisão do cache a cada atualização do conjunto publicado.
- Mantenha apenas Ataque, Defesa, Ataque Duplo e Mochila no combate.
- Teste em Chromium com toque e viewport móvel, incluindo os fluxos de batalha, dados anteriores, sons e navegação offline. Registre o que foi validado, as decisões e as pendências em `PROGRESSO.md`.
- Para iniciar o app localmente, execute `python3 -m http.server 8313 --bind 127.0.0.1` na raiz. Com Chromium e Playwright disponíveis, execute `node scripts/test-phase1.cjs`. A variável `SCREENSHOTS` permite escolher onde salvar as capturas.

## Revisão 5

- Preserve `assets/phase1-official.png` como referência original para Ibrahim, seu cachorro e Arborian. Os atlas de caminhada ficam em `assets/walk-ibrahim.webp` e `assets/walk-dog.webp`.
- Somente Arborian, reconstruído a partir da capa oficial, é chefe da Fase 1. Suas cinco poses ficam em `assets/arborian/`. Preserve `assets/enemy_guardian.webp` e `assets/enemy_guardian.svg` como arte anterior reservada. O segundo guardião ainda não tem nome, poderes ou fase atribuída.
- A loja do RPG tem cinco consumíveis. Remédio custa 18 moedas, Cura 7 diamantes, Rede de captura 4 diamantes, Bomba de fumaça 25 moedas e Doce do Sono 35 moedas. Fora de combate, somente Remédio e Cura podem ser usados. O Doce do Sono impede as duas próximas ações ofensivas do inimigo, inclusive as de Arborian, sem acumular efeitos.
- Preserve os identificadores persistentes das coletas. Conceda recompensas de vitória e de baú uma única vez e só volte ao mapa após CONTINUAR.
- Valide o áudio com gestos de toque, suspensão e retomada, controle de música e execução offline. Diferencie análise de sinal em Chromium e audição em aparelho físico.
- A Revisão 5 deve permanecer local até autorização expressa para o envio ao GitHub e a publicação de teste.

## Revisão 6

- A Revisão 6 parte de `10a76085f5004373c40b533f78785af86b69f1d7`. Preserve `main`, os guardiões, a capa da Fase 1 e os sistemas de batalha fora do ataque normal. Nova fase, push, merge e deploy dependem de autorização.
- A caminhada usa 12 quadros de passada, um de repouso e dois de assentamento por pé. Preserve as coordenadas e a trilha do companheiro ao trocar os atlas.
- Mantenha uma única cadeia de `requestAnimationFrame` no mapa. Agrupe gravações de deslocamento e grave coletas imediatamente com posição, inventário, saldo e identificação da recompensa. Preserve a pausa de entrada em mochila e tesouro.
- Ao mudar a revisão, atualize o rótulo visível, a versão anunciada pelo worker, os parâmetros dos recursos e a chave de cache. Preserve `minhaAventuraKids_v1` e a identidade da PWA.
- O servidor usado para o roteiro local é `python3 -m http.server 8313 --bind 127.0.0.1`. Rode `node scripts/test-phase1.cjs` e use `node scripts/benchmark-phase1.cjs URL` para medir a mesma rota em cada revisão.

## Revisão 7

- A Revisão 7 parte de `85a4f1b99e2743b4d8a4cf6723677d51f10eaa7c`. Preserve a capa, o terreno, os dois guardiões e as regras de jogo vigentes. A Fase 2 continua fora do escopo. Push, merge, deploy e serviços pagos exigem autorização expressa.
- A caminhada agora usa articulações desenhadas em tempo real. Preserve a trilha por quadrículas e calcule a fase das pernas e patas pela distância percorrida. As texturas de corpo derivam das referências oficiais.
- Preserve o Corte Relâmpago da Revisão 6. Depois de um golpe não fatal, o Ogro recupera por 1,2 s, dá seu golpe de 2,5 s e recompõe por 0,8 s. Sono, defesa, dano e recompensas mantêm as regras anteriores. A queda do Ogro antecede a vitória e só libera o anúncio após a permanência com estrelas.
- A PWA mantém HTML e arquivos versionados no mesmo cache de release. Atualize os hashes SHA-384 se alterar arquivos de uma revisão. Preserve a identidade do manifesto e os dados do navegador. A promoção automática sem recarga existe apenas na migração da Revisão 6. Nas próximas revisões, sinalize a atualização e aguarde um momento seguro.
- Para validar a Revisão 7, sirva a raiz em `127.0.0.1:8321` e rode `node scripts/test-phase1.cjs`. Use `node scripts/benchmark-phase1.cjs URL` para medir o canvas.
