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

## Revisão 8

- Use `7966d409a68e4019070a22d777e821172d964473` como referência para comparar as mudanças da Revisão 8. Mantenha o trabalho local até autorização expressa para envio e publicação.
- No mapa, use quadros completos com referência à capa oficial. A Revisão 8 usa provisoriamente os atlas da Revisão 6. Antes de integrar a arte definitiva, apresente folha completa e vídeos e valide anatomia, proporções, contato com o chão e identidade nas quatro direções.
- As poses de combate em uso ficam em `assets/ogre-r8/` e `assets/arborian-r8/`. Preserve também as poses anteriores, a capa e o guardião reservado. Preserve os tempos e regras de combate.
- Ao investigar a PWA, compare o endereço habitual com a URL exclusiva. Registre HTML e worker pela rede, worker ativo, contexto e escopo antes de atribuir a causa. Use `diagnostico-atualizacao.html` quando disponível e preserve a instalação e o progresso. Qualquer alteração de endereço ou configuração do Netlify exige aprovação.

### Complemento da Revisão 8

- Use o Blender local para produzir folhas de poses completas de Ibrahim e do cachorro. Compare a frente, as costas e os dois perfis com a capa. Aguarde aprovação visual antes de produzir ciclos completos ou integrar novos sprites.
- Para avaliar desempenho, compare as origens locais da R7, da R8 anterior e da R8 otimizada com `scripts/benchmark-phase1.cjs URL_R7 URL_R8_ANTES URL_R8_DEPOIS`. Faça as medições sem renderização do Blender em paralelo. Registre duração, percurso, perfil, CPU, DPR, superfície do canvas e intervalos entre quadros.
- A identificação continua Revisão 8. Por se tratar da mesma entrega ainda local, ajuste somente os hashes dos arquivos versionados que forem alterados. Mudanças no mecanismo de atualização ou na configuração do Netlify dependem de evidência ou autorização, conforme o caso.

### Sprites aprovados da Revisão 8

- A caminhada usa `assets/walk-ibrahim-r8-aprovado.webp` e `assets/walk-dog-r8-aprovado.webp`. As linhas são costas, frente, esquerda e direita. Cada linha tem oito quadros de Ibrahim ou sete do cachorro, mais a última célula de repouso. Mantenha o plano de apoio comum e o avanço por distância.
- Em combate, use as poses tratadas em `assets/poses-r8-aprovadas/`. Somente as cinco poses da prancha infantil do usuário são usadas para Arborian. Preserve a arte de vitória aprovada de Ibrahim, os recursos históricos e as regras e os efeitos do combate.
- Ao receber novas pranchas, confira os recortes contra a fonte. Preserve a anatomia e a escala dentro de cada conjunto. Registre os quadros retidos por corte, halo ou sobreposição com outra pose. Mantenha o orçamento do canvas móvel e atualize o cache offline junto com a arte ativa.

## Revisão 9

- Use `076e503d22a1ea60237f33e7392de492fd01058f` como base da R9. Preserve o mapa, o layout de controles e os personagens da R8. Os atlas continuam usando quadros completos com apoio fixo, sem articulação em tempo real.
- Mantenha as poses infantis de Arborian. Na vitória do chefe, grave o prazo da revelação e mantenha as recompensas nos campos de idempotência existentes. Preserve a derrota e a música dos inimigos comuns. O botão da vitória do chefe volta à trilha da Fase 1.
- Preserve a identidade e o escopo da PWA. O backup entre origens deve ser local, explícito, validado e preservar uma cópia do progresso existente no destino. Confira a entrega pela rede e a revisão do worker no endereço habitual antes de alterar a política de atualização.
- Push, merge, publicação, configuração de endereços externos e créditos pagos exigem autorização. A Fase 2 permanece fora do escopo.

## Revisão 10

- Base local em `810ddb354b3fb836f3575f4ff7892d992e5a51f5`. Preserve os atributos, os cinco sprites de Arborian e os tempos de combate. Confira a área visível dos galhos, a base e a sombra do chefe em telas estreitas, grandes e de pouca altura.
- Preserve os contornos antialias dos sprites de Ibrahim. Corrija alfa somente dentro da silhueta e confira o resultado sobre fundos claros e escuros. O mapa continua usando quadros inteiros.
- As trilhas de mapa, Ogro e Arborian têm arranjos distintos. Preserve o gesto de ativação, os controles e as duas músicas de vitória. Use somente gravação original e autorizada caso uma voz infantil seja acrescentada.

- A Rede de Captura fica retirada da loja, mochila, combate, recompensas e coletas. Preserve `inventory.rope` e registros legados em saves e backups. O inventário jogável continua com Remédio, Cura, Bomba de fumaça e Doce do Sono.
- A reação ao impacto do Ogro deve terminar em postura estável antes de erguer a clava. Golpes fatais seguem a derrota existente sem iniciar contra-ataque.

## Metodologia a partir da Revisão 11

- Cada revisão contém apenas as pequenas correções explicitamente aprovadas para ela. Use como base o commit indicado e preserve as melhorias anteriores. Pendências e refinamentos fora desse escopo ficam para revisões autorizadas separadamente.
- Registre o efeito de cada correção, rode os testes direcionados e a regressão pertinente e aguarde autorização expressa para publicar no ambiente de testes. Preserve a branch `main` e mantenha a Fase 2 fora do escopo.
