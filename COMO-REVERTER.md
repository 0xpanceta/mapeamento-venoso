# Como reverter mudanças

Este arquivo explica, em português e passo a passo, como **desfazer** mudanças
feitas no app caso você não goste do resultado. Cada seção cobre uma mudança
específica.

---

## Mudança 10 — Impressão sempre em 1 página só

**O que essa mudança faz:** força a impressão (botão "🖨 Imprimir / PDF" e o
"🖨 Imprimir" da galeria) a caber sempre em **uma folha só**, **sem margens**,
em **A4 retrato**. Antes o desenho podia "vazar" para uma 2ª página.

> Observação: o **tipo de papel "Espesso 1"** não faz parte desta mudança porque
> não pode ser definido por código — é configuração da impressora no diálogo do
> Chrome (o Chrome memoriza a última escolha por impressora). Reverter esta
> mudança **não** afeta isso.

### Jeito rápido (Git) — recomendado

Se a mudança **ainda não foi commitada**, dentro da pasta do projeto rode:

```
git checkout -- index.html
```

Isso volta o `index.html` ao último commit. Antes, confira o que será desfeito:

```
git diff index.html
```

Se a mudança **já foi commitada e enviada (push)**, reverta o commit dela. Ache
o commit da impressão de 1 página:

```
git log --oneline
```

e depois reverta pelo identificador (hash) que aparecer:

```
git revert <hash-do-commit>
```

### Jeito manual (editando o arquivo)

Abra o `index.html`, procure por `@media print {` e **substitua o bloco inteiro**
pelo original abaixo:

```css
@media print {
  @page { margin: 0; }
  header, .ferramentas, .status, .cartao-salvo, .galeria, #btn-concluir-curva { display: none !important; }
  body { height: auto; display: block; }
  .corpo { display: block; }
  .canvas-area { display: block; text-align: center; padding: 6mm; background: white; overflow: visible; }
  canvas { box-shadow: none; max-width: 100%; max-height: none; }
  body.imprimindo-galeria .corpo { display: none !important; }
  body.imprimindo-galeria #area-impressao { display: block !important; text-align: center; }
  body.imprimindo-galeria #area-impressao img { max-width: 100%; max-height: 100vh; }
}
```

### Ajuste intermediário (sem reverter tudo)

Se a impressão em 1 página estiver **cortando** parte do desenho, ou você quiser
uma folguinha da borda, **não precisa reverter**: no bloco `@media print`, na
linha da `.canvas-area`, troque `padding: 0` por `padding: 3mm`. Continua em 1
página e afasta o traço da borda.

### Depois de reverter

Se quiser, remova também a **Mudança 10** do arquivo
`MUDANCAS-PARA-REPLICAR.md` (a entrada da mudança e a linha 10 do índice no topo).
