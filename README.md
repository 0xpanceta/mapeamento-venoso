# Mapeamento Venoso de MMII — Ultramed

Ferramenta web para as médicas de vascular desenharem o mapeamento venoso de
membros inferiores por cima de uma imagem-modelo, salvando automaticamente a
imagem com o nome/código da paciente.

É a evolução do programa antigo (`.bat` + `.ps1` + Paint) para uma página web
única, que roda no navegador **sem instalar nada**.

---

## O que ela faz

1. Abre a imagem-modelo (`Modelo.png`) numa tela de desenho.
2. Pede o nome ou código da paciente.
3. Permite desenhar as veias nas cores da legenda e marcar as perfurantes.
4. Salva automaticamente a imagem em uma estrutura de pastas por data e paciente.
5. Também permite imprimir ou gerar PDF do mapeamento.

---

## Por que a versão web (e não o programa antigo)

O programa antigo funcionava, mas tinha vários incômodos que esta versão resolve:

| Problema antigo | Como a versão web resolve |
|---|---|
| Abria um prompt de comando preto | Abre no navegador, como um site |
| Arquivos `.ps1` e `.bat` disparavam alerta de segurança ao transferir | É só um arquivo `.html`, sem alerta |
| Brigava com a proteção contra ransomware do Windows | O navegador não cria pastas escondidas |
| Editava no Paint (sem cores prontas, sem carimbos) | Editor próprio com as cores da legenda e os símbolos de perfurante |

---

## Requisitos

- **Windows** com **Google Chrome** ou **Microsoft Edge** atualizado.
  > O salvamento automático na pasta usa um recurso que só existe no Chrome e no
  > Edge. Em outros navegadores (ex.: Firefox), o programa ainda funciona, mas
  > salva por **download** na pasta Downloads, em vez de na estrutura de pastas.

---

## Estrutura do projeto

```text
mapeamento-venoso/
  MapeamentoVenoso.html   <- o programa (é só abrir este arquivo)
  Modelo.png              <- imagem-base, limpa, sem marcações
  README.md               <- este arquivo
  .gitignore              <- impede que imagens de pacientes vão para o GitHub
```

O `MapeamentoVenoso.html` e o `Modelo.png` **precisam ficar na mesma pasta**.

---

## Como usar no dia a dia

1. Dê dois cliques em `MapeamentoVenoso.html` (abre no navegador).
2. Na primeira vez, clique em **"Escolher pasta de salvamento"** (no rodapé) e
   aponte para a pasta onde as imagens devem ser guardadas.
3. Digite o nome ou código da paciente.
4. Escolha a ferramenta (cor da veia ou perfurante) e desenhe sobre a imagem.
5. Clique em **"Salvar imagem"**.

A imagem é salva automaticamente em:

```text
<pasta escolhida>/
  2026-07-13/
    Maria Silva/
      Maria Silva - 143512.png
```

O número final (`143512`) é o horário (hora/minuto/segundo), para não sobrescrever
imagens da mesma paciente feitas no mesmo dia.

---

## Ferramentas de desenho

- **Veia competente** — traço azul
- **Veia incompetente** — traço vermelho
- **Veia trombosada** — traço preto
- **Perfurante competente** — símbolo ⊗ azul (um clique = um símbolo)
- **Perfurante incompetente** — símbolo ⊗ vermelho (um clique = um símbolo)
- **Borracha** — apaga o que foi desenhado (o modelo permanece)
- **Desfazer** — botão ou `Ctrl + Z`
- **Espessura** — controle deslizante

---

## Como trocar a imagem-modelo

1. Prepare a nova imagem, limpa, sem marcações.
2. Renomeie-a para exatamente `Modelo.png` (com M maiúsculo).
3. Substitua o `Modelo.png` da pasta pela nova.

Não é preciso mexer no código.

---

## Como mudar comportamentos (para quem edita o código)

O arquivo `MapeamentoVenoso.html` tem, no início do bloco `<script>`, uma seção
de **CONFIGURAÇÃO**. O nome do arquivo-modelo fica lá:

```javascript
const ARQUIVO_MODELO = "Modelo.png";
```

O restante do código está comentado em português, separado por seções
(desenho, ferramentas, salvamento, etc.).

---

## Cuidados importantes

- **Nunca** suba imagens de pacientes para o GitHub. O `.gitignore` já bloqueia
  isso, mas mantenha o hábito de subir apenas o programa e o `Modelo.png` limpo.
- Mantenha uma cópia limpa e segura do `Modelo.png`.
- Faça backup periódico da pasta onde as imagens são salvas.
- Para privacidade, considere usar código da paciente em vez do nome completo.
- Teste qualquer alteração primeiro com uma paciente fictícia.

---

## Situação / próximos passos

- [x] Versão web funcional com editor próprio, cores da legenda, perfurantes,
      salvamento automático e impressão.
- [ ] **Testar `file://`**: confirmar, numa máquina da clínica, que abrir por
      dois cliques permite o salvamento automático na pasta. (Se não funcionar,
      será necessário servir o arquivo por um servidor local simples.)
- [ ] Lembrar a pasta de salvamento entre sessões, para reduzir cliques.
- [ ] Empacotar/distribuir (atalho na área de trabalho apontando para o HTML).
