# As Aventuras de Ibrahim

- Trabalhe na branch `dev-fase1-musica-companheiro` e use a ponta mais recente dessa branch como base para novas revisões. Preserve o trabalho local já existente.
- Preserve a branch `main` e a publicação oficial no Netlify. Serviços pagos e créditos externos exigem autorização explícita.
- Preserve as atividades, recompensas, moedas, diamantes, XP, inventário e progresso salvo. Mantenha a chave `minhaAventuraKids_v1` e use migrações aditivas para dados antigos.
- Preserve a arte oficial de apresentação da Fase 1, a identidade de Ibrahim e do cachorro e o escopo da Floresta Encantada. Novas fases dependem de aprovação.
- Use recursos locais para o jogo e inclua recursos essenciais no cache da PWA. Incremente a revisão do cache a cada atualização do conjunto publicado.
- Mantenha apenas Ataque, Defesa, Ataque Duplo e Mochila no combate. A loja do RPG oferece somente Remédio, Cura, Rede de captura e Bomba de fumaça.
- Teste em Chromium com toque e viewport móvel, incluindo os fluxos de batalha, dados anteriores, sons e navegação offline. Registre o que foi validado, as decisões e as pendências em `PROGRESSO.md`.
- Para iniciar o app localmente, execute `python3 -m http.server 8000 --bind 127.0.0.1` na raiz. Com Chromium e Playwright disponíveis, execute `node scripts/test-phase1.cjs`. A variável `SCREENSHOTS` permite escolher onde salvar as capturas.
