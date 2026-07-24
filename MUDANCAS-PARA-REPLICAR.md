# Mudanças para replicar em outro projeto

Este documento registra as mudanças feitas no projeto **Mapeamento Venoso de MMII**
em **24/07/2026**, para que possam ser replicadas em um projeto irmão (mais
avançado) que ainda não as tem.

## Como usar este documento (para o Claude Code do outro projeto)

- Cada mudança abaixo tem: **O quê**, **Por quê**, **Onde** e **Como** (com
  trechos de código).
- O projeto de origem é uma página única (`index.html`) com todo o HTML, CSS e
  JavaScript juntos. O projeto de destino pode ter uma estrutura diferente
  (arquivos separados, framework, etc.). **Não copie os trechos cegamente** —
  entenda a intenção de cada mudança e adapte à estrutura de lá.
- Antes de aplicar, localize no projeto de destino o elemento equivalente
  (mesma função/comportamento), mesmo que o nome da variável ou do seletor seja
  diferente.
- Depois de aplicar cada mudança, teste o comportamento descrito em **Como
  validar**.

## Contexto do projeto de origem

- App web de página única para desenhar mapeamento venoso sobre uma imagem-modelo.
- `index.html` contém HTML + CSS + JS. O JS começa com uma seção de
  **CONFIGURAÇÃO** (ex.: `const ARQUIVO_MODELO = "Modelo.png";`).
- Ferramentas de desenho, salvamento em pasta (File System Access API),
  impressão/PDF e PWA (offline via `sw.js`).

---

## Índice de mudanças

1. [Mudança 1 — Ferramenta "Reta / Curva" (estilo Paint)](#mudança-1--ferramenta-reta--curva-estilo-paint)
2. [Mudança 2 — Imagem-modelo em SVG](#mudança-2--imagem-modelo-em-svg)
3. [Mudança 3 — Perfurante trombosado (preto) na legenda](#mudança-3--perfurante-trombosado-preto-na-legenda)
4. [Mudança 4 — Borracha não apaga o desenho base (camadas)](#mudança-4--borracha-não-apaga-o-desenho-base-camadas)
5. [Mudança 5 — Nome da paciente no modelo + capitalização](#mudança-5--nome-da-paciente-no-modelo--capitalização)

> **Ordem recomendada de implementação:** 2 → 3 (junto) → 4 → 5. O SVG é o
> substrato; a legenda é montada nele; a borracha precisa da separação em camadas
> antes de o nome poder morar na camada protegida.

---

## Mudança 1 — Ferramenta "Reta / Curva" (estilo Paint)

**O quê:** Uma nova forma de desenhar as veias em que a médica clica no **início**
e no **fim** da veia para traçar uma **reta perfeita** e, em seguida, pode
**arrastar qualquer parte da linha para curvá-la** (curva de Bézier), como a
ferramenta "Curva" do Paint. As cores das veias (Competente / Incompetente /
Trombosada) continuam iguais; muda apenas *como* o traço é feito.

**Por quê:** A médica que usa o programa não consegue fazer traços retos com o
mouse — sai tudo tremido no modo à mão livre. Ela pediu explicitamente a função
do Paint de traçar uma reta por dois pontos e depois curvá-la.

**Onde:** Arquivo único `index.html` (HTML + CSS + JS juntos). Mexe em:
- CSS: estilos compartilhados dos botões + botão flutuante "Concluir".
- HTML: um grupo novo de botões "Traço das veias" (toggle À mão livre / Reta·curva)
  e o botão flutuante `#btn-concluir-curva`.
- JS: estado (`modoTraco`, `curva`), desenho da Bézier, roteamento dos eventos de
  ponteiro e integração com desfazer / limpar / salvar / imprimir.

**Como (decisões de projeto):**

- **É um *modo*, não uma cor/ferramenta a mais.** A médica escolhe a cor da veia
  como sempre; um toggle separado ("À mão livre" vs "Reta / curva") decide se o
  traço é freehand ou reta ajustável. Perfurante e borracha **não** são afetados.
  No código isso vira uma variável `modoTraco` e uma função
  `tipoEfetivoAgora()` que converte o tipo `"linha"` em `"curva"` quando o modo
  está ligado. Assim a lógica de cor existente não muda.

- **Modelo geométrico: Bézier cúbica** com `p0` (início), `p3` (fim) e dois
  controles `p1`, `p2`. A reta inicial coloca `p1`/`p2` a 1/3 e 2/3 do caminho —
  o que desenha uma linha perfeitamente reta. Ao arrastar um ponto da curva no
  parâmetro `t`, resolvemos **um** dos controles (`p1` se `t<0.5`, senão `p2`)
  para que a curva passe exatamente pelo cursor. Isso dá a sensação de "pegar a
  linha e puxar", e permite até um "S" (puxar perto de uma ponta dobra um lado,
  perto da outra dobra o outro).

- **Fluxo de uso:** clica início → clica fim → reta aparece com alças brancas nas
  pontas → arrasta para curvar (pode repetir/refinar) → conclui com **Enter**,
  com o **botão flutuante "✓ Concluir"**, trocando de ferramenta/modo, ou
  **clicando numa área vazia** (o que já começa a próxima reta, encadeando).
  **Esc** cancela; **Ctrl+Z** cancela a curva em construção ou remove a última já
  concluída. Também aceita press-drag-release para definir a reta num gesto só.

- **Integração:** a curva em construção é desenhada por cima do resto (fica sobre
  os pixels do canvas), então `salvar()` e `imprimir()` chamam `finalizarCurva()`
  antes, garantindo que uma curva pendente entre na imagem. Curva concluída vira
  um elemento `{tipo:"curva", cor, espessura, p0..p3}` no mesmo array de traços
  (`tracos`) usado pelo desfazer/limpar, e `desenharElemento()` passa a
  reconhecer esse tipo.

**Trechos de código (todos em `index.html`):**

CSS — compartilhar o estilo dos botões e criar o botão flutuante:

```css
/* antes: só .ferramenta-btn. Agora inclui .modo-btn nos mesmos estilos */
.ferramenta-btn, .modo-btn { /* ...mesmo estilo... */ }
.ferramenta-btn:hover, .modo-btn:hover { border-color: var(--verde); }
.ferramenta-btn.ativo, .modo-btn.ativo { border-color: var(--verde); background: #eef6f1; box-shadow: inset 0 0 0 1px var(--verde); }
.amostra-modo { width: 24px; text-align: center; flex-shrink: 0; font-size: 16px; }
#btn-concluir-curva {
  position: fixed; left: 50%; bottom: 44px; transform: translateX(-50%); z-index: 45;
  background: var(--verde); color: #fff; border: none; border-radius: 22px;
  padding: 10px 22px; font-size: 14px; font-weight: 600; cursor: pointer;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
}
#btn-concluir-curva:hover { background: var(--verde-escuro); }
/* e no @media print, adicionar #btn-concluir-curva à lista de "display:none" */
```

> ⚠️ **Importante:** os botões de modo usam a classe `modo-btn`, **não**
> `ferramenta-btn`. Isso é de propósito: o handler das ferramentas faz
> `querySelectorAll(".ferramenta-btn").forEach(b => b.classList.remove("ativo"))`
> e sobrescreve `tipoAtual = btn.dataset.tipo`. Se os botões de modo tivessem a
> classe `ferramenta-btn`, perderiam o "ativo" e zerariam o `tipoAtual`. Mantê-los
> numa classe própria evita esse conflito.

HTML — o toggle (após o grupo "Veias") e o botão flutuante:

```html
<div>
  <div class="grupo-titulo">Traço das veias</div>
  <button class="modo-btn ativo" data-modo="livre">
    <span class="amostra-modo">&#9998;</span> À mão livre
  </button>
  <button class="modo-btn" data-modo="curva">
    <span class="amostra-modo">&#8978;</span> Reta / curva
  </button>
</div>

<!-- perto do fim do body -->
<button id="btn-concluir-curva" style="display:none">&#10003; Concluir traço (Enter)</button>
```

JS — estado novo (junto de `corAtual`, `tipoAtual`, etc.):

```javascript
let modoTraco = "livre";   // "livre" (à mão) ou "curva" (reta ajustável)
let curva = null;          // curva em construção; null quando não há nenhuma
```

JS — `desenharElemento()` reconhece o tipo `curva`, e a função de desenho:

```javascript
function desenharElemento(t) {
  if (t.tipo === "perfurante") { desenharPerfurante(t); return; }
  if (t.tipo === "curva") { desenharCurva(t); return; }   // <-- novo
  desenharLinha(t);
}
function desenharCurva(t) {
  ctx.save();
  ctx.lineJoin = "round"; ctx.lineCap = "round";
  ctx.lineWidth = t.espessura;
  ctx.globalCompositeOperation = "source-over";
  ctx.strokeStyle = t.cor;
  ctx.beginPath();
  ctx.moveTo(t.p0.x, t.p0.y);
  ctx.bezierCurveTo(t.p1.x, t.p1.y, t.p2.x, t.p2.y, t.p3.x, t.p3.y);
  ctx.stroke();
  ctx.restore();
}
```

JS — `redesenhar()` desenha a curva em edição por cima:

```javascript
for (const t of tracos) desenharElemento(t);
if (tracoAtual) desenharElemento(tracoAtual);
if (curva) desenharCurvaEdicao(curva);   // <-- novo
```

JS — roteamento dos eventos de ponteiro (chave da integração). Uma veia
(`tipo "linha"`) vira `"curva"` quando o modo está ligado:

```javascript
function tipoEfetivoAgora() {
  return (tipoAtual === "linha" && modoTraco === "curva") ? "curva" : tipoAtual;
}
// nos 3 handlers do canvas, no topo:
canvas.addEventListener("pointerdown", (e) => {
  if (!imagemModelo) return;
  if (tipoEfetivoAgora() === "curva") { curvaPointerDown(e); return; }
  /* ...resto do fluxo original (perfurante, linha à mão)... */
});
canvas.addEventListener("pointermove", (e) => {
  if (tipoEfetivoAgora() === "curva") { curvaPointerMove(e); return; }
  /* ...resto... */
});
canvas.addEventListener("pointerup", (e) => {
  if (tipoEfetivoAgora() === "curva") { curvaPointerUp(e); return; }
  terminarTraco();
});
canvas.addEventListener("pointercancel", (e) => {
  if (tipoEfetivoAgora() === "curva") { curvaPointerUp(e); return; }
  terminarTraco();
});
```

JS — o miolo da ferramenta (matemática da Bézier + estados). Reproduza a lógica;
os nomes podem ser adaptados:

```javascript
let bendAtivo = false, bendQual = null, bendT = 0.5, grabFar = false, grabPos = null;
const btnConcluir = document.getElementById("btn-concluir-curva");
function mostrarConcluir(b) { btnConcluir.style.display = b ? "block" : "none"; }

// px de tela -> px do canvas (o canvas é exibido redimensionado pelo zoom)
function escalaCanvas() {
  const r = canvas.getBoundingClientRect();
  return r.width ? canvas.width / r.width : 1;
}
function pontoCurva(c, t) {
  const u = 1 - t;
  return {
    x: u*u*u*c.p0.x + 3*u*u*t*c.p1.x + 3*u*t*t*c.p2.x + t*t*t*c.p3.x,
    y: u*u*u*c.p0.y + 3*u*u*t*c.p1.y + 3*u*t*t*c.p2.y + t*t*t*c.p3.y,
  };
}
function maisProximoNaCurva(c, p) {         // t e distância do ponto mais próximo
  let melhor = { t: 0, d: Infinity };
  for (let i = 0; i <= 60; i++) {
    const t = i / 60, q = pontoCurva(c, t), d = Math.hypot(q.x - p.x, q.y - p.y);
    if (d < melhor.d) melhor = { t, d };
  }
  return melhor;
}
// move p1 OU p2 para a curva passar por "alvo" no parâmetro t (t preso a [0.15,0.85])
function ajustarControle(c, t, alvo, qual) {
  t = Math.min(0.85, Math.max(0.15, t));
  const u = 1 - t, c0 = u*u*u, c1 = 3*u*u*t, c2 = 3*u*t*t, c3 = t*t*t;
  if (qual === "p1") {
    c.p1 = { x: (alvo.x - c0*c.p0.x - c2*c.p2.x - c3*c.p3.x) / c1,
             y: (alvo.y - c0*c.p0.y - c2*c.p2.y - c3*c.p3.y) / c1 };
  } else {
    c.p2 = { x: (alvo.x - c0*c.p0.x - c1*c.p1.x - c3*c.p3.x) / c2,
             y: (alvo.y - c0*c.p0.y - c1*c.p1.y - c3*c.p3.y) / c2 };
  }
}
function desenharCurvaEdicao(c) {           // desenha a linha + alças nas pontas
  if (c.estado === "tracando") {
    ctx.save(); ctx.setLineDash([6, 6]); ctx.lineWidth = c.espessura;
    ctx.lineCap = "round"; ctx.globalAlpha = 0.85; ctx.strokeStyle = c.cor;
    ctx.beginPath(); ctx.moveTo(c.p0.x, c.p0.y); ctx.lineTo(c.p3.x, c.p3.y);
    ctx.stroke(); ctx.restore();
  } else { desenharCurva(c); }
  ctx.save(); ctx.globalCompositeOperation = "source-over";
  const raio = Math.max(5, c.espessura * 1.2);
  for (const p of [c.p0, c.p3]) {
    ctx.beginPath(); ctx.arc(p.x, p.y, raio, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = c.cor; ctx.stroke();
  }
  ctx.restore();
}
function iniciarReta(pos) {
  curva = { estado: "tracando", cor: corAtual, espessura: espessuraAtual,
            p0: {...pos}, p1: {...pos}, p2: {...pos}, p3: {...pos} };
  mostrarConcluir(true); atualizarDicaTraco(); redesenhar();
}
function retaColocarFim(pos) {
  curva.p3 = {...pos};
  const dx = curva.p3.x - curva.p0.x, dy = curva.p3.y - curva.p0.y;
  curva.p1 = { x: curva.p0.x + dx/3, y: curva.p0.y + dy/3 };
  curva.p2 = { x: curva.p0.x + 2*dx/3, y: curva.p0.y + 2*dy/3 };
  curva.estado = "editando"; atualizarDicaTraco(); redesenhar();
}
function finalizarCurva() {
  if (!curva) return;
  if (curva.estado === "editando") {
    tracos.push({ tipo: "curva", cor: curva.cor, espessura: curva.espessura,
      p0: {...curva.p0}, p1: {...curva.p1}, p2: {...curva.p2}, p3: {...curva.p3} });
  }
  curva = null; bendAtivo = false; grabFar = false;
  mostrarConcluir(false); atualizarDicaTraco(); redesenhar();
}
function cancelarCurva() {
  curva = null; bendAtivo = false; grabFar = false;
  mostrarConcluir(false); atualizarDicaTraco(); redesenhar();
}
function curvaPointerDown(e) {
  const pos = posicao(e);                          // posicao() já existe no projeto
  if (!curva) { iniciarReta(pos); return; }
  if (curva.estado === "tracando") { retaColocarFim(pos); return; }
  const prox = maisProximoNaCurva(curva, pos), tol = 20 * escalaCanvas();
  grabPos = pos;
  if (prox.d <= tol) {                             // perto da linha: curvar
    bendAtivo = true; bendT = Math.min(0.85, Math.max(0.15, prox.t));
    bendQual = bendT < 0.5 ? "p1" : "p2"; grabFar = false;
    canvas.setPointerCapture(e.pointerId);
  } else { grabFar = true; bendAtivo = false; }    // longe: concluir e começar outra
}
function curvaPointerMove(e) {
  if (!curva) return;
  const pos = posicao(e);
  if (curva.estado === "tracando") { curva.p3 = {...pos}; redesenhar(); return; }
  if (bendAtivo) { ajustarControle(curva, bendT, pos, bendQual); redesenhar(); }
}
function curvaPointerUp(e) {
  if (!curva) return;
  if (bendAtivo) { bendAtivo = false; try { canvas.releasePointerCapture(e.pointerId); } catch (_) {} return; }
  if (curva.estado === "tracando") {               // press-drag-release também fixa o fim
    const d = Math.hypot(curva.p3.x - curva.p0.x, curva.p3.y - curva.p0.y);
    if (d > 6 * escalaCanvas()) retaColocarFim(curva.p3);
    return;
  }
  if (grabFar) { const pos = grabPos; finalizarCurva(); iniciarReta(pos); grabFar = false; }
}
btnConcluir.addEventListener("click", finalizarCurva);
```

JS — o handler das ferramentas e o handler novo do modo. **Ambos** concluem a
curva pendente ao trocar de contexto:

```javascript
document.querySelectorAll(".ferramenta-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    finalizarCurva();                              // <-- conclui pendente
    document.querySelectorAll(".ferramenta-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    tipoAtual = btn.dataset.tipo;
    if (btn.dataset.cor) corAtual = btn.dataset.cor;
    atualizarDicaTraco();                          // <-- novo
  });
});
document.querySelectorAll(".modo-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    finalizarCurva();
    document.querySelectorAll(".modo-btn").forEach(b => b.classList.remove("ativo"));
    btn.classList.add("ativo");
    modoTraco = btn.dataset.modo;
    atualizarDicaTraco();
  });
});
function atualizarDicaTraco() {                     // dica na barra de status
  if (tipoEfetivoAgora() !== "curva") return;
  if (curva && curva.estado === "tracando") definirStatus("Clique no ponto final da veia.", "aviso");
  else if (curva && curva.estado === "editando") definirStatus("Arraste a linha para curvá-la. Enter conclui; Esc cancela.", "aviso");
  else definirStatus("Modo reta/curva: clique no início e depois no fim da veia.", "aviso");
}
```

JS — integração com desfazer, teclado, limpar, salvar, imprimir:

```javascript
function desfazer() {
  if (curva) { cancelarCurva(); return; }          // curva em construção: cancela primeiro
  if (tracos.length === 0) return;
  tracos.pop(); redesenhar();
}
// Enter conclui / Esc cancela (listener novo, só age se houver curva)
document.addEventListener("keydown", (e) => {
  if (!curva) return;
  if (e.key === "Enter") { e.preventDefault(); finalizarCurva(); }
  else if (e.key === "Escape") { cancelarCurva(); }
});
// btn-limpar: trocar "if (tracos.length === 0) return;" por:
//   if (tracos.length === 0 && !curva) return;
// e dentro do confirm, chamar também cancelarCurva();
// salvar():   primeira linha -> finalizarCurva();
// imprimir():  o listener passa a ser -> { finalizarCurva(); window.print(); }
```

**Como validar:**
1. Ligue "Reta / curva". Clique em dois pontos → aparece uma reta com alças
   brancas nas pontas e o botão "✓ Concluir traço".
2. Arraste o meio da linha → ela curva seguindo o cursor.
3. Arraste perto de uma ponta para um lado e da outra ponta para o outro → forma
   um "S".
4. Enter (ou o botão) conclui: as alças somem e a curva fica fixa.
5. Ctrl+Z remove a curva concluída. Esc, durante a edição, cancela.
6. Trocar de cor/ferramenta/modo conclui a curva pendente. Salvar/Imprimir
   incluem a curva pendente na imagem.
7. Sem erros no console. (Validado no Chrome via automação.)

**Observações para o projeto de destino:**
- O projeto de origem usa **um `<canvas>` só, sem zoom por transformação de
  contexto** — as coordenadas vêm de `posicao(e)` (que já converte tela→canvas
  considerando o redimensionamento CSS). Se o outro projeto usar `ctx.scale()`,
  `ctx.translate()`, camadas separadas, ou uma biblioteca de canvas
  (Fabric/Konva/etc.), **adapte a obtenção de coordenadas e o desenho** — a
  matemática da Bézier é a mesma, mas o "onde desenhar" muda.
- Se lá o desenho for **vetorial/estruturado** (objetos, não pixels), guarde a
  curva como um objeto Bézier nativo em vez de empurrar num array de traços.
- Se o app de destino **não acopla cor+ferramenta** em cada botão como aqui, o
  toggle de modo pode ser desnecessário — pode ser uma ferramenta "Curva"
  independente. Preserve o **comportamento** (2 cliques + arrastar para curvar,
  Bézier cúbica com resolução de 1 controle por arrasto), não o layout exato.
- Confirme que o app de destino tem equivalentes de `redesenhar()`,
  `desenharElemento()`, `posicao()`, `definirStatus()` e do array de traços; os
  nomes quase certamente diferem.

---

## Mudança 2 — Imagem-modelo em SVG

**O quê:** A imagem-base do modelo passou de `Modelo.png` para `Modelo.svg`.

**Por quê:** O usuário quer a imagem como SVG gerado por nós — um contêiner vetorial
que facilita adicionar/editar elementos (nome da paciente, itens de legenda) e
deixa a estrutura pronta para futuras vetorizações.

**Decisão de abordagem (importante):** as pernas são um desenho anatômico detalhado,
difícil de vetorizar com fidelidade. Avaliamos 3 estilos (vetorizar via autotrace,
híbrido, esquemático) e o usuário escolheu o **híbrido "embutir tudo"**: o SVG
embute a imagem atual inteira como `<image>` (data URI base64), mantendo o visual
**100% idêntico**. A legenda (que já contém o perfurante preto) e o cabeçalho vêm
junto na imagem. O nome da paciente NÃO fica no SVG — é desenhado em runtime (ver
Mudança 5).

**Onde:** `Modelo.svg` (novo), `index.html` (`ARQUIVO_MODELO`, `carregarModelo`),
`sw.js` (cache), `Modelo.png` (mantido como backup/fonte).

**Como:**

1. Gerar `Modelo.svg` embutindo o PNG como data URI (script Python usado):

```python
import base64
png = open("Modelo.png","rb").read()
b64 = base64.b64encode(png).decode()
svg = ('<svg xmlns="http://www.w3.org/2000/svg" width="1054" height="1492" '
       'viewBox="0 0 1054 1492">'
       f'<image x="0" y="0" width="1054" height="1492" '
       f'href="data:image/png;base64,{b64}"/></svg>')
open("Modelo.svg","w").write(svg)
```

2. `index.html`: só trocar a constante — o resto do carregamento não muda, porque
   uma Image criada a partir de um SVG com `width`/`height` explícitos tem
   `naturalWidth`/`naturalHeight`, e `drawImage` rasteriza igual ao PNG:

```javascript
const ARQUIVO_MODELO = "Modelo.svg";   // antes: "Modelo.png"
```

3. `sw.js`: subir a versão do cache e trocar o asset:

```javascript
const VERSAO = "v2";                    // era "v1"
const ESSENCIAIS = [ "./", "./index.html", "./Modelo.svg", /* … */ ];
```

**Armadilha verificada — contaminação (taint) do canvas:** um SVG desenhado no
canvas pode "contaminar" o canvas e quebrar o `toBlob`/`toDataURL` do salvamento.
Testamos isoladamente antes: com a imagem embutida como **data URI** (mesma origem),
o canvas **não** é contaminado e o salvar funciona. (Se o `<image>` apontasse para
um arquivo externo, contaminaria — por isso data URI.)

**Como validar:** o modelo carrega e aparece idêntico ao anterior; salvar gera PNG
normalmente (sem erro de SecurityError no console).

**Observações para o projeto de destino:**
- Se o projeto irmão quiser de fato **vetorizar** as pernas (nítido em qualquer
  zoom), a rota é autotrace (potrace/vtracer) das pernas + cabeçalho/legenda em
  vetor — bem mais trabalho; aqui optou-se por embutir por simplicidade e fidelidade.
- Confirme que lá o carregamento do modelo também usa uma `Image` + `drawImage`;
  se usar `<img>`/`background` em DOM, a troca é ainda mais simples (só o `src`).
- Ajuste `width/height/viewBox` do SVG para as dimensões reais da imagem de lá.

## Mudança 3 — Perfurante trombosado (preto) na legenda

**O quê:** A legenda do modelo inclui o item **perfurante trombosado**, um
círculo **preto**, junto dos perfurantes competente (azul) e incompetente (vermelho).

**Por quê:** Paridade da legenda com as ferramentas de marcação disponíveis
(existe a ferramenta de perfurante trombosado preto, então a legenda deve explicá-la).

> **Atenção — específico por projeto:** neste projeto (`mapeamento-venoso`) a legenda
> **já continha** o perfurante preto (está dentro do `Modelo.png`/`Modelo.svg`).
> Aqui a "mudança" foi apenas **garantir que o SVG novo mantivesse** o item — o que
> é automático, já que embutimos a imagem inteira (Mudança 2). **No projeto irmão,
> se a legenda ainda não tiver o item, esta é uma mudança real** e precisa ser feita
> na fonte do modelo de lá.

**Onde:** dentro da própria arte do modelo (no `Modelo.svg`/imagem-fonte).

**Como (no projeto de destino, se faltar):**
- Se o modelo de lá for uma imagem (PNG): editar a arte-fonte para acrescentar a
  linha na legenda — um círculo preto (contorno `#111`, sem preenchimento) + o texto
  "perfurante trombosado", no mesmo padrão dos outros dois perfurantes.
- Se o modelo de lá for SVG vetor (não embutido): acrescentar na legenda um
  `<circle>` de `stroke:#111` e um `<text>` "perfurante trombosado".
- Conferir que a **ferramenta** de perfurante preto existe no app (botão
  `data-tipo="perfurante" data-cor="#111111"`); a legenda deve refletir a ferramenta.

**Como validar:** abrir o modelo e conferir os 6 itens na legenda, incluindo o
círculo preto "perfurante trombosado".

## Mudança 4 — Borracha não apaga o desenho base (camadas)

**O quê:** A borracha agora apaga **apenas o que foi desenhado** (veias, perfurantes,
curvas). O desenho-base (o modelo) e o nome da paciente **não são mais apagados**.

**Por quê:** Antes tudo era achatado num único canvas; a borracha usa
`globalCompositeOperation = "destination-out"`, que remove **todos** os pixels sob
ela — inclusive o modelo. A médica apagava sem querer partes do desenho anatômico.

**Onde:** `index.html` — `redesenhar()`, as funções de desenho e o ESTADO.

**Como (conceito replicável, independente de SVG):** separar a renderização em
**duas camadas**:
1. **Camada base (protegida):** modelo + nome, desenhados direto no canvas visível.
2. **Camada de desenho (offscreen):** todos os traços — incluindo a borracha —
   desenhados num `<canvas>` fora da tela. A borracha (`destination-out`) só afeta
   ESSA camada.
3. Ao final, compõe-se a camada de desenho sobre a base com `drawImage`.

Assim a borracha nunca alcança a base. Como o canvas visível continua contendo o
composto final, **salvar e imprimir não mudam**.

Estado novo:

```javascript
const canvasDesenho = document.createElement("canvas");
const dctx = canvasDesenho.getContext("2d");
function ajustarCanvasDesenho() {           // manter do tamanho do canvas principal
  canvasDesenho.width = canvas.width;
  canvasDesenho.height = canvas.height;
}
// chamar ajustarCanvasDesenho() ao definir canvas.width/height (em carregarModelo)
```

`redesenhar()` reescrito em 3 passos:

```javascript
function redesenhar() {
  // 1) base protegida
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (imagemModelo) ctx.drawImage(imagemModelo, 0, 0, canvas.width, canvas.height);
  desenharNomePaciente();                       // ver Mudança 5
  // 2) desenho isolado (borracha só atua aqui)
  dctx.clearRect(0, 0, canvasDesenho.width, canvasDesenho.height);
  for (const t of tracos) desenharElemento(dctx, t);
  if (tracoAtual) desenharElemento(dctx, tracoAtual);
  if (curva) desenharCurvaEdicao(dctx, curva);
  // 3) compõe desenho sobre a base
  ctx.drawImage(canvasDesenho, 0, 0);
}
```

**Refactor necessário:** as funções de desenho usavam o `ctx` global. Passaram a
receber o contexto como 1º parâmetro (`cx`) para poderem desenhar no offscreen:
`desenharElemento(cx, t)`, `desenharLinha(cx, t)`, `desenharPerfurante(cx, t)`,
`desenharCurva(cx, t)`, `desenharCurvaEdicao(cx, c)` — trocar `ctx.` por `cx.`
dentro delas. A borracha continua igual, só que agora sobre `cx` (offscreen):

```javascript
if (t.tipo === "borracha") {
  cx.globalCompositeOperation = "destination-out";
  cx.strokeStyle = "rgba(0,0,0,1)";
}
```

**Como validar:** desenhar uma veia; com a borracha, passar por cima do desenho E
por cima do modelo/nome. Só o desenho some; modelo e nome permanecem. (Validado.)

**Observações para o projeto de destino:**
- O conceito é "camada de desenho isolada"; pode ser um segundo `<canvas>`
  empilhado no DOM em vez de um offscreen, se lá já houver essa estrutura.
- Se lá as funções de desenho já recebem um contexto, o refactor é menor.

## Mudança 5 — Nome da paciente no modelo + capitalização

**O quê:** O nome digitado no campo "Paciente" aparece **no cabeçalho do modelo**
(sob o título), atualizando **ao vivo**. Só a **1ª letra de cada nome** fica
maiúscula (ex.: `maria JOSÉ da silva` → `Maria José Da Silva`). A mesma
capitalização é aplicada ao **nome do arquivo e das pastas** salvos.

**Por quê:** Identificar a paciente na própria imagem impressa/salva e padronizar
a capitalização (evita nomes todo-maiúsculo ou todo-minúsculo).

**Onde:** `index.html` — helper `titulizarNome`, `desenharNomePaciente` (na base do
`redesenhar`), listener `input` do `#paciente`, e `salvar()`.

**Como:**

Helper de capitalização (acento-seguro, pt-BR):

```javascript
function titulizarNome(s) {
  return String(s).split(/\s+/).filter(Boolean).map(function (w) {
    return w.charAt(0).toLocaleUpperCase("pt-BR") + w.slice(1).toLocaleLowerCase("pt-BR");
  }).join(" ");
}
```

Desenhar o nome na **camada base** (por isso a borracha não apaga — Mudança 4).
Coordenadas no espaço do modelo (aqui 1054×1492), numa faixa livre entre o título
e as caixas DIREITO/ESQUERDO:

```javascript
function desenharNomePaciente() {
  const bruto = (document.getElementById("paciente").value || "").trim();
  if (!bruto) return;
  const texto = "Paciente: " + titulizarNome(bruto);
  ctx.save();
  ctx.globalCompositeOperation = "source-over";
  ctx.font = "600 27px 'Segoe UI', system-ui, Arial, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1f5637";
  ctx.fillText(texto, 288, 212);   // ajustar às coordenadas do modelo de destino
  ctx.restore();
}
```

Atualização ao vivo:

```javascript
document.getElementById("paciente").addEventListener("input", redesenhar);
```

Capitalização também no salvamento (o usuário pediu modelo **e** arquivo/pasta).
Em `salvar()`, calcular uma vez e usar em nome de arquivo, pastas, status e no
atalho da galeria:

```javascript
const nomeBase = nomeSeguro(titulizarNome(nome));   // titulariza e depois sanitiza
redesenhar();                                       // garante o nome atual na base
const blob = await gerarPNG();
const nomeArq = nomeBase + " - " + horaAgora() + ".png";
// … usar nomeBase em subpasta(pDia, nomeBase), no status e em ultimoSalvo.nome …
```

**Nuance (documentada para ajuste fácil):** a regra capitaliza **todas** as
palavras, incluindo conectores — `da` vira `Da` (ex.: "Maria José **Da** Silva").
Isso segue a leitura literal do pedido ("a 1ª letra de cada nome"). Se preferir
manter `de/da/dos/das/e` minúsculos, dá para tratar esses conectores como exceção
dentro de `titulizarNome`.

**Como validar:** digitar "maria JOSÉ da silva" → aparece "Paciente: Maria José Da
Silva" sob o título, ao vivo; salvar cria arquivo/pastas com o nome capitalizado;
a borracha não apaga o nome. (Validado.)

**Observações para o projeto de destino:**
- Ajustar as coordenadas de `fillText` para o cabeçalho do modelo de lá (a faixa
  livre pode estar noutra posição).
- Se lá o nome vier de outro campo/estado, trocar a fonte do texto.
- Se lá o salvamento montar nome de arquivo/pasta em outro ponto, aplicar
  `titulizarNome` no mesmo lugar em que hoje se sanitiza o nome.

---

## Modelo de entrada (para cada mudança)

> ### Mudança N — <título curto>
>
> **O quê:** <descrição em uma frase do que mudou para o usuário final>
>
> **Por quê:** <motivação / problema que resolve>
>
> **Onde:** <arquivo(s) e região do código — ex.: bloco `<script>`, seção X>
>
> **Como:** <passo a passo da implementação, com trechos de código antes/depois>
>
> **Como validar:** <o que testar para confirmar que funcionou>
>
> **Observações para o projeto de destino:** <o que pode ser diferente lá e
> como adaptar>
