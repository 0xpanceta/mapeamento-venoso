---
name: registrar-mudancas
description: >
  Use SEMPRE que você editar, alterar, criar ou remover qualquer arquivo de
  produto deste projeto (Mapeamento Venoso de MMII) — index.html, sw.js, CSS,
  JS, manifest.webmanifest, imagens-modelo (Modelo.png / Modelo.svg), icon.svg,
  README etc. — ou adicionar/mudar qualquer funcionalidade ou comportamento do
  app. Depois de concluir a edição, registre a mudança em
  MUDANCAS-PARA-REPLICAR.md (o quê, por quê, onde e como) para que o Claude Code
  do projeto irmão consiga reproduzi-la. Dispara em pedidos como "muda",
  "altera", "adiciona", "corrige", "ajusta o app".
---

# Registrar mudanças em MUDANCAS-PARA-REPLICAR.md

Este projeto mantém o arquivo `MUDANCAS-PARA-REPLICAR.md` na raiz. Ele é um
registro, em português, de cada mudança feita no app, escrito para que o
**Claude Code de um projeto irmão** (mais avançado) consiga **reproduzir a
mudança entendendo a intenção** — sem copiar código cego.

**Regra central:** toda vez que você fizer uma mudança de produto neste projeto,
depois de concluí-la você DEVE acrescentar a entrada correspondente em
`MUDANCAS-PARA-REPLICAR.md`. Isso faz parte da tarefa — não é opcional e não
depende de o usuário pedir.

## Quando aplicar

Aplique quando a edição muda o **comportamento ou o código do produto**:
- `index.html` (HTML, CSS ou JS embutido), `sw.js`, `manifest.webmanifest`,
  `icon.svg`, imagens-modelo (`Modelo.png`, `Modelo.svg`), `README.md`, CNAME,
  ferramentas de desenho, PWA/offline, salvamento, impressão, etc.
- Adicionar, remover ou alterar qualquer funcionalidade.

## Quando NÃO aplicar

- Edições no próprio `MUDANCAS-PARA-REPLICAR.md`.
- Arquivos internos do Claude (`.claude/**`), incluindo esta skill.
- Ações puramente de leitura, investigação ou perguntas (nada foi alterado).

## Fluxo

1. **Faça a edição** que o usuário pediu, normalmente.
2. **Leia** `MUDANCAS-PARA-REPLICAR.md` para ver o número da última mudança e o
   estilo/tom do documento.
3. **Acrescente uma nova entrada** `## Mudança N — <título>` no fim da lista de
   mudanças, seguindo EXATAMENTE o padrão das entradas existentes, com estas
   seções em negrito:
   - **O quê:** descrição funcional, em linguagem clara (a usuária final é
     médica, não programadora). Diga o que muda do ponto de vista de quem usa.
   - **Por quê:** a lógica e o motivo por trás — o problema que resolve, o que
     o usuário pediu, a decisão de design. É a parte mais importante para o
     projeto irmão entender a intenção.
   - **Onde:** arquivo(s) e a região afetada (ex.: "CSS dos botões", "seção
     CONFIGURAÇÃO do JS", "`sw.js` — lista de cache").
   - **Como:** como foi feito, com os trechos de código relevantes. Sempre
     inclua o aviso de que o projeto de destino pode ter estrutura diferente
     (arquivos separados, framework) e que se deve **adaptar à intenção, não
     copiar cego**.
   - **Como validar:** passo a passo para testar o comportamento no app.
4. **Atualize o "Índice de mudanças"** no topo do arquivo: adicione a linha
   numerada e a âncora correspondente ao novo item.
5. Se várias mudanças foram feitas na mesma tarefa, registre **uma entrada por
   mudança lógica** (não junte tudo numa só).

## Convenções

- Escreva **em português**, no mesmo tom das entradas existentes.
- **Continue a numeração** existente (não reinicie, não pule).
- Use a **data atual** quando a entrada precisar de data.
- Mantenha os trechos de código curtos e focados na intenção — o suficiente para
  o outro Claude entender o que fazer, não um dump do arquivo inteiro.

## Depois de registrar

Ao terminar, mencione ao usuário, em uma linha, que a mudança foi registrada em
`MUDANCAS-PARA-REPLICAR.md` (ex.: "Registrei como Mudança 6 no log").
