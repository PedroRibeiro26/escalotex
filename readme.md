# ESCALOTEX

Página única (`index.html`) para montar, controlar e imprimir a **escala de serviço** de uma unidade: **cabo de dia**, **plantões**, contagem de **folga**, **dispensas**, **trocas de serviço** e **histórico** de tudo o que foi lançado.

Este documento descreve a versão que usa os termos militares (militares, cabo de dia, plantões, escala preta e vermelha, dispensados, P/G, nome de guerra).

---

## ⚠️ LEIA PRIMEIRO: não existe banco de dados
## O ESCALOTEX FOI FEITO PURAMENTE COM IA PARA FINS DE ESTUDO

**O ESCALOTEX não tem servidor, não tem banco de dados e não tem conta de usuário.**
Tudo o que o sistema "sabe" (militares, grupos, escalas montadas, folgas, dispensas, histórico, assinatura, estilo de impressão) fica reunido em **um único arquivo**:

```
escala-servico-banco.json
```

Esse arquivo é o **banco de dados de verdade**. A página `index.html` é só o programa; ela não guarda nada para sempre por conta própria.

### Regra de ouro

| Quando | O que fazer |
|---|---|
| **ANTES de cada uso** | Abrir o `index.html` e clicar em **Importar arquivo**, escolhendo o `reset_config.json` **mais recente**. |
| **DEPOIS de cada uso** | Clicar em **Exportar arquivo** e **guardar o novo `escala-servico-banco.json`**, substituindo o anterior (ou guardando com a data no nome). |

Se essa rotina for seguida, a escala estará sempre atualizada, em qualquer computador ou celular, por qualquer pessoa que abrir a página.

### Por que isso é necessário

- A página não envia nada para a internet. Não existe um lugar central onde os dados ficam.
- O texto **"Salvo automaticamente neste navegador"**, no canto superior, significa apenas que uma cópia de trabalho foi gravada **naquele navegador, naquele aparelho**. Ela:
  - **não** aparece em outro computador, outro navegador ou outro celular;
  - **pode ser apagada** ao limpar os dados de navegação, usar aba anônima ou trocar de perfil;
  - **não** é compartilhada com ninguém.
- Portanto, **a cópia do navegador é só uma comodidade. O arquivo exportado é o que vale.**
- Se aparecer **"Não foi possível salvar neste navegador. Use Exportar arquivo."**, exporte imediatamente.

### Cuidados com o arquivo

- **Uma pessoa por vez.** Não existe sincronização nem mistura de versões. Se duas pessoas importam o mesmo arquivo, alteram e exportam, **vale o último arquivo, e as alterações da outra pessoa se perdem**. Combine quem está com a "vez" e passe o arquivo adiante.
- **Sempre importe o arquivo mais recente.** Importar um arquivo velho faz o sistema voltar no tempo (folgas, histórico e escalas ficam como estavam naquela data).
- **Importar substitui tudo** o que está na tela pelos dados do arquivo. Logo após importar aparece o aviso **"Arquivo importado"** com o botão **Desfazer**, que traz de volta o que estava antes.
- **Faça cópias de segurança.** Sugestão: guardar com a data no nome (ex.: `escala-servico-banco 2026-10-16.json`) e manter algumas versões antigas.
- O arquivo contém **os nomes dos militares**. Trate-o como informação interna (não envie para quem não deve ter acesso).
- Só são aceitos arquivos `.json` gerados pelo próprio ESCALOTEX. Outro arquivo mostra **"Arquivo inválido: use um .json exportado por esta página"**.

### Rotina recomendada (passo a passo)

1. Abra o `index.html` no navegador.
2. Clique em **Importar arquivo** e escolha o `escala-servico-banco.json` mais recente.
3. Confira o último dia lançado (caixa **Último dia lançado**) para ter certeza de que é a versão certa.
4. Faça o trabalho do dia (montar escala, lançar, imprimir, dispensar, etc.).
5. Clique em **Exportar arquivo**.
6. Guarde o arquivo baixado no lugar de sempre (pasta compartilhada, pendrive, e-mail para si mesmo...), **substituindo o antigo**.

---

## O que o sistema faz

- Monta a escala de serviço dia a dia, com **cabo de dia** (um por dia) e **plantões** (vários por dia).
- Separa a escala em dois tipos de dia:
  - **Escala preta:** dias de semana.
  - **Escala vermelha:** sábados, domingos e **feriados**.
- **Conta a folga** de cada militar (quantos dias de cada tipo ele está sem serviço) e **sugere quem está mais folgado**.
- Gera **automaticamente** a próxima escala depois que uma é lançada.
- Controla **dispensas** (total ou só de um tipo de escala) com aviso de retorno.
- Permite **trocas de serviço** sem bagunçar a contagem de folga.
- Guarda o **histórico** de cada dia lançado, com possibilidade de **desfazer** passos.
- **Imprime / salva em PDF** a escala (e a previsão) em A4, com 7 estilos e título editável.

### Como é usado

- É um único arquivo HTML. **Não precisa instalar nada, não precisa de internet e não usa nenhum serviço externo.**
- Abre com dois cliques no `index.html` (Chrome, Edge, Firefox, Safari; computador ou celular).
- Nada sai do aparelho: os dados só existem no navegador e no arquivo que você exporta.
- O visual acompanha o tema claro/escuro do aparelho.
- O layout usa a tela inteira e se adapta ao celular (a tabela vira uma lista de cartões).

---

## Visão geral da tela

**Barra superior (fixa):**
- Nome do sistema e as 5 abas: **Escala · Sugestões · Militares · Dispensados · Histórico**.
- Indicador de salvamento no navegador.
- Botões **Exportar arquivo** e **Importar arquivo**.

A aba **Dispensados** mostra o número de dispensados entre parênteses e um ⚠ quando alguém está perto de voltar (ou já pode voltar).

---

## Aba ESCALA

É a aba principal. Tem duas visões, escolhidas no seletor do topo: **Escala manual** e **Escala automática**.

À direita (ou abaixo, em telas menores) ficam três caixas de apoio:

1. **Último dia lançado:** mostra a data, o dia da semana, o tipo (preta/vermelha) e quem estava de cabo de dia e de plantão. Aparece depois do primeiro lançamento.
2. **Sugestões:** os 3 mais folgados de cada grupo (ver [Sugestões rápidas](#sugestões-rápidas-painel-lateral)).
3. **Tipo de escala:** define os grupos que formam as colunas da escala (ver [Tipo de escala](#tipo-de-escala-grupos-da-escala)).

### A tabela da escala

- Cada linha é um **dia**: data, dia da semana e as colunas dos grupos (por padrão **Cabo de dia** e **Plantões**).
- **Linhas de dia de semana** têm marca escura na lateral; **sábados, domingos e feriados** ficam avermelhados.
- O botão **+** no cabeçalho de uma coluna abre a janela para adicionar militares **em vários dias de uma vez**.
- O botão **+** pequeno dentro de cada célula adiciona militares **naquele dia**.
- Cada militar aparece como uma etiqueta com:
  - **⇄** troca de serviço (ver [Troca de serviço](#troca-de-serviço));
  - **×** retirar da escala (aparece um aviso com **Desfazer**).
- Célula vazia mostra **VAGO** (cabo de dia) ou **SEM PLANTÕES**.
- Etiqueta amarela com **⚠** indica que há um **aviso** associado (ver [Avisos](#avisos)).

**Editar um dia:**
- **✎** altera a **data**, o **dia da semana** e a marcação **Feriado** (formato `dd/mm/aa`; data inválida é recusada).
- **✕** remove o dia da escala (com **Desfazer**). A escala precisa ter pelo menos um dia.
- **+ Adicionar dia** cria o dia seguinte ao último da tabela.

> A marcação **Feriado** é o que faz um dia de semana contar como **escala vermelha**.

### Adicionar militares (janela)

Abre pelo **+** do cabeçalho ou da célula. Nela você:

1. **Busca** e seleciona o(s) militar(es).
   - No **cabo de dia** só é possível um por dia (escolher outro substitui).
   - Nos **plantões** dá para escolher vários.
2. Marca os **dias**, com atalhos: **Todos**, **Dias úteis**, **Fim de semana**, **Limpar**.
3. (Opcional) marca **Incluir aviso** e escreve o texto. Com vários militares selecionados, escolhe **quais deles recebem** o aviso.

Detalhes úteis:
- A lista **"Disponíveis"** vem **ordenada do mais folgado para o menos folgado** e mostra a folga (**P** = preta, **V** = vermelha) de cada um.
- A lista **"Já de serviço nesta escala"** mostra quem já está escalado em outros dias e **quantos dias de folga teria** em relação aos dias escolhidos (ou avisa que já está em um dos dias selecionados).
- Militares **dispensados** para aquele tipo de dia **não aparecem** e são ignorados se forem incluídos (o sistema informa quantas inclusões foram ignoradas).
- O rodapé da janela mostra quantos militares e quantos dias estão selecionados.

### Avisos

Um aviso é uma observação (ex.: *"aguardando troca"*, *"dispensa"*) que fica presa a um militar em um dia.
- Aparece como **⚠** na etiqueta amarela. Passe o mouse ou clique no ícone para ler o motivo.
- Na **impressão**, o nome desse militar sai com um **asterisco (\*)**.
- Trocas de serviço geram um aviso automático.
- Retornos de dispensa também geram avisos (ver [Dispensados](#aba-dispensados)).

### Troca de serviço

Quando um militar **assume o serviço de outro**:

1. Clique no **⇄** da etiqueta de quem estava escalado.
2. Escolha quem assume (a lista mostra grupo e folga e já exclui quem está ocupado naquele dia ou dispensado).
3. Confirme.

Regras:
- O militar que assumiu **aparece no lugar**, na escala e na impressão (com **\***).
- Ao **LANÇAR**, quem **zera a folga do dia é o militar substituído**.
- A folga de **quem assumiu continua contando normalmente**, como se ele não tivesse tirado serviço.
- Se o dia já tinha sido lançado, é preciso **lançar de novo** para atualizar as folgas.
- A troca fica registrada no **Histórico**.

### Período, previsão e lançamento

No cartão **Período e lançamento**:

- **Escala:** intervalo de datas (de/até) que será **impresso e contado**.
- **Previsão:** intervalo opcional (ou **Sem previsão**) impresso como **segunda tabela**, **sem contar folga**.
- **Títulos da impressão:** campos para trocar a frase do título (ver [Título editável](#título-editável)).

Botões:

- **LANÇAR** — confirma o período **Escala** como realmente cumprido:
  - os militares de serviço nesses dias **passam a contar folga a partir do dia seguinte**;
  - o dia entra no **Histórico**;
  - a **impressão é liberada**;
  - se o dia já estava lançado, o novo lançamento **substitui** o anterior;
  - antes de lançar, o sistema avisa se há **dias sem ninguém escalado**, se **tudo já estava lançado** (nada muda) ou se há **dias fora do intervalo** com militares ainda não lançados.
- **Visualizar** — mostra a prévia da folha no estilo escolhido (e informa se a impressão já está liberada).
- **Imprimir** — abre a impressão do navegador (ver [Impressão e PDF](#impressão-e-pdf)). **Só funciona depois de LANÇAR.**

**Importante sobre a liberação da impressão:**
- Se você **alterar qualquer coisa** depois de lançar (mudar militares, datas, período), a impressão **volta a ser bloqueada** e aparece **"Há alterações não lançadas. Lance de novo para liberar a impressão."**
- A **PREVISÃO nunca conta folga**, só a **ESCALA**.

### Assinatura

Campos **Nome completo**, **P/G** (posto/graduação) e **Função**. O que for preenchido aparece **ao final da impressão** (nome em maiúsculas, " – ", P/G, e a função abaixo). Há uma prévia da linha de assinatura no próprio cartão.

**Gerenciar cargos** permite criar, renomear e excluir as opções da lista de P/G.
Lista inicial: SD EV, SD EP, AL, CB EP, 3º SGT, 2º SGT, 1º SGT, ST, ASP OF, 2º TEN, 1º TEN, CAP, MAJ, TC, CEL.

### Tipo de escala (grupos da escala)

Define **quais grupos viram colunas** da escala:

- **Dupla (dois grupos):** duas colunas, escolhendo o grupo da 1ª e da 2ª coluna (padrão: Cabo de dia e Plantões).
- **Única (um grupo):** uma só coluna, **sem segunda coluna, inclusive na impressão**. Pode ser **um por dia** ou **vários por dia**.

Mudar os grupos **limpa os militares já colocados nas colunas que mudaram** (o sistema pede confirmação). Dias já lançados no histórico **não são alterados**. Novos grupos são criados na aba **Militares**.

### Sugestões rápidas (painel lateral)

Mostra os **3 mais folgados** de cada grupo da escala.
- Botões **P** (escala preta) e **V** (escala vermelha) escolhem a contagem exibida.
- **✓** indica quem **já está escalado** na escala em exibição.
- Mostra os mesmos militares tanto na escala manual quanto na automática.
- Pode ser recolhido pela seta ▾ (em telas pequenas já começa recolhido).

### Escala automática

Depois do **primeiro lançamento**, a aba **Escala automática** passa a funcionar (antes disso aparece uma explicação).

- A escala sugerida **começa no dia seguinte ao último dia lançado** e segue por **N dias** (padrão 5, de 1 a 31).
- Em cada dia entram os **militares mais folgados** (preta e vermelha contadas separadamente), respeitando **dispensas**.
- Evita repetir quem esteve de serviço **no último dia lançado**, sempre que houver gente suficiente.
- A quantidade de plantões por dia é a mais comum do que foi lançado na primeira vez.
- Você **pode editar** como na escala manual (adicionar, retirar, trocar, mudar datas).

Botões:
- **Dias:** quantos dias gerar.
- **Gerar de novo:** descarta a atual (inclusive suas edições) e gera outra.
- **Recalcular mantendo as datas:** mantém datas, dias da semana e feriados e refaz só os militares.
- **Restaurar minha versão anterior:** aparece quando você tinha editado a escala e ela foi regenerada; devolve a sua versão.

Comportamento automático:
- A escala automática **se atualiza sozinha** sempre que outra escala é lançada.
- Ao **lançar** uma escala automática, os dias são **enviados para a escala manual** (para ficar registrada) e a impressão é liberada. Imprima nessa hora: **ao sair da aba, o sistema gera a próxima automática**.

---

## Como a folga é contada

Esta é a regra central do sistema:

1. A folga é contada **separadamente** para a **escala preta** (dias de semana) e para a **escala vermelha** (fins de semana e feriados).
2. Folga preta = quantos dias **pretas lançados** passaram desde o último serviço preto do militar (começando **no dia seguinte** ao serviço). A vermelha funciona igual, só com dias vermelhos.
3. **Só dias LANÇADOS contam.** Escala montada e não lançada não altera nada. A **previsão não conta**.
4. Quem **nunca serviu** começa a contar a partir do momento em que foi **cadastrado** (um militar novo não "nasce" com folga acumulada de lançamentos antigos).
5. Ao ser lançado de serviço, a folga **daquele tipo** volta a zero.
6. **Ordem de sugestão** (de quem deve ser escalado primeiro): mais dias de folga → quem serviu há mais tempo → ordem alfabética.
7. Em **troca de serviço**, zera quem foi **substituído** (ver acima).

### Ajuste manual de folga

Em **Sugestões** e **Militares** há o botão **Folga**. Ele abre uma janela para digitar a folga **atual** (preta e vermelha) do militar.
- O valor digitado passa a ser a folga atual e **continua contando normalmente**.
- Valores ajustados manualmente aparecem com **\*** nas listas.
- O ajuste de uma escala **é desfeito** quando o militar for lançado de serviço nela.
- **Remover ajustes** apaga os ajustes daquele militar.
- Útil para **começar a usar o sistema** com a folga real de cada um.

---

## Aba SUGESTÕES

Lista, **por grupo**, todos os militares **do mais folgado ao menos folgado**.

- Alterne entre **Escala preta** e **Escala vermelha** no seletor do topo (a lista reordena).
- Cada linha mostra: posição, nome, **dias de folga**, uma barra proporcional, a **data do último serviço** e a folga do outro tipo de escala.
- Os **3 primeiros** (depois que houver lançamentos) recebem a etiqueta **Sugestão** e destaque.
- Botão **Folga** em cada linha para ajustar manualmente.
- **Resetar todas as folgas:** zera a contagem de **todos** (preta e vermelha). O **histórico é mantido** e a contagem recomeça do próximo lançamento. A escala automática é recalculada. Pede confirmação e dá para desfazer.
- **Desfazer último lançamento / último passo:** volta o último passo registrado (ver [Histórico](#aba-histórico)).
- Quem está **dispensado** para aquele tipo de escala **não aparece** na lista.

---

## Aba MILITARES

Cadastro de todo o efetivo, organizado em **colunas por grupo**.

**Criar militar:**
1. Escolha o **posto/graduação** (SD EV, SD EP, CB, AL por padrão; **Cargos** gerencia essa lista).
2. Digite o **nome de guerra** (ex.: `SOUZA`).
3. Clique em **Criar militar**. O nome fica como **posto + nome** (ex.: `SD EV SOUZA`) e **não pode repetir**.
4. O militar novo entra em **"Sem grupo"** e **não aparece nas listas de escala** até ser colocado em um grupo.

**Colunas:**
- **Cabo de dia** e **Plantões** (grupos padrão), **Sem grupo** e **Dispensados**.
- Clique no título da coluna para abrir/fechar. Cada militar mostra suas folgas (**P** e **V**) e, se for o caso, a etiqueta de dispensa parcial.
- Em cada militar:
  - menu para **mudar de grupo** (o sistema avisa para onde foi);
  - **Folga** (ajuste manual);
  - **Dispensar**;
  - **Excluir** (com **Desfazer**).

**Gerenciar grupos:**
- **Criar, renomear e excluir** grupos (ex.: "Técnico de dia").
- Não aceita nomes repetidos.
- Ao **excluir** um grupo, os militares dele vão para **"Sem grupo"**; se o grupo era usado na escala atual, ele sai da escala e os militares dessa coluna são retirados.
- Quais grupos entram na escala é definido na aba **Escala → Tipo de escala**.

---

## Aba DISPENSADOS

Controla quem está **fora da escala** por um período.

**Adicionar à dispensa** (campos obrigatórios \*):
- **Militar.**
- **Abrangência:**
  - **Total:** fora das escalas preta e vermelha;
  - **Somente dias de semana (escala preta):** continua disponível na vermelha;
  - **Somente fim de semana e feriados (escala vermelha):** continua disponível na preta.
- **Destino (motivo)**, por exemplo: curso, baixa médica, licença.
- **Início** e **fim** da dispensa (o fim não pode ser antes do início).

**Efeitos:**
- O militar **sai das listas** da escala dispensada: não aparece para ser adicionado, nem em **Sugestões**, nem na **escala automática**.
- Se ele já estava em dias de uma escala montada, **continua lá** (o sistema avisa); retire manualmente se necessário.
- A dispensa total move o militar para a coluna **Dispensados**; a parcial mantém o grupo e mostra a etiqueta **DISP. SEMANA** ou **DISP. FDS**.

**Avisos de retorno (⚠):**
- Faltando **2 dias ou menos** para o fim: *"Volta em N dias"*.
- No **último dia**: *"Último dia de dispensa"*.
- **Depois do fim:** *"Dispensa encerrada... já pode voltar para a escala"*.
- O ⚠ também aparece na aba e nas listas.

**Retornar:** devolve o militar à escala (ao grupo em que estava) e apaga os dados da dispensa. **Folga** permite ajustar a folga dele.

> O sistema **não** devolve o militar sozinho quando a dispensa acaba; ele apenas avisa. É preciso clicar em **Retornar**.

---

## Aba HISTÓRICO

Registro de **cada dia lançado**.

- Cada item mostra data, dia da semana, tipo (**PRETA** ou **VERMELHA**), o **cabo de dia**, os **plantões** e as **trocas de serviço** (`FULANO* (tirou o serviço de BELTRANO)`).
- **Busca** por militar ou data e **filtro** por tipo de escala.
- **Excluir** um dia do histórico recalcula as folgas **como se ele nunca tivesse sido lançado** (pede confirmação).
- Para **corrigir** um dia: exclua-o daqui, ou monte-o de novo na aba Escala e **lance outra vez** (o novo lançamento **substitui** o anterior).

**Passos que podem ser desfeitos:**
- Todo **lançamento** e toda **exclusão** entra em uma lista (até **30 passos**), do mais recente para o mais antigo.
- **Desfazer último passo** desfaz o primeiro da lista (o item marcado **PRÓXIMO A DESFAZER**). Também há esse botão em **Sugestões** e no aviso que aparece logo após lançar.
- Ao desfazer, a impressão fica bloqueada até lançar de novo.

> O histórico e a lista de passos fazem parte do arquivo exportado. Sem o arquivo, eles são perdidos.

---

## Impressão e PDF

- Formato **A4**, com margens de 18 mm (altura) e 16 mm (laterais).
- A folha contém: **título com as datas**, a **tabela da Escala**, a tabela da **Previsão** (se houver) e a **assinatura** (se preenchida).
- Colunas: **DATA** (data e dia da semana) e uma por grupo da escala. Fins de semana e feriados saem **destacados**. Vagas saem como **VAGO**; sem plantões, um traço.
- Nomes com **aviso** ou **troca de serviço** saem com **\***.
- Para **salvar em PDF**, escolha **"Salvar como PDF"** como impressora na janela de impressão do navegador.
- A impressão só é liberada **depois de LANÇAR** (ver acima).

### Estilos de impressão

Ao clicar em **Visualizar** ou **Imprimir**, abre a janela **Escolha o estilo do PDF**, com uma prévia de cada um. O estilo muda **só a aparência**; os dados são os mesmos. O estilo escolhido fica salvo no arquivo.

| Estilo | Característica |
|---|---|
| **Clássico** (padrão) | Cabeçalho cinza e fim de semana em cinza escuro. |
| **Moderno** | Cabeçalho escuro, fim de semana avermelhado, linhas alternadas. |
| **Minimalista** | Sem molduras, só linhas finas. Economiza tinta. |
| **Formal** | Letra serifada e filete duplo no título. Aspecto de documento oficial. |
| **Compacto** | Linhas mais baixas e fonte menor: cabem mais dias por folha. |
| **Alto contraste** | Bordas grossas, negrito e fim de semana hachurado. Bom para impressão em preto e branco e cópias. |
| **Azul institucional** | Cabeçalho azul, linhas alternadas, fim de semana em azul claro. |

### Título editável

Em **Período e lançamento** há dois campos:

- **Título da impressão:** padrão **"Escala de Serviço de"**.
- **Título da previsão:** padrão **"Previsão da Escala de Serviço de"**.

A **data do período entra sempre na linha abaixo** do título. **Deixando o campo em branco, vale o padrão.** O botão **Restaurar padrão** limpa os dois. Os títulos aparecem na visualização, na impressão e na prévia dos estilos, e **ficam salvos no arquivo**.

---

## O que vai dentro do arquivo `escala-servico-banco.json`

Tudo o que é necessário para reproduzir o sistema exatamente como estava:

- Grupos e **tipo de escala** (dupla/única e quais grupos).
- A **escala manual** e a **escala automática** (dias, militares, avisos, trocas), mais as configurações da automática.
- **Militares**, grupos, **dispensas** (abrangência, motivo, datas) e **ajustes manuais de folga**.
- **Histórico** de dias lançados e a **lista de passos para desfazer**.
- Intervalos de **Escala** e **Previsão** selecionados e o estado de "lançado".
- **Assinatura** (nome, P/G, função) e as listas de **cargos**.
- **Estilo de impressão** e **títulos** personalizados.

É um arquivo de texto (JSON), legível, mas **não deve ser editado à mão**: um erro pode torná-lo inválido.

---

## Perguntas frequentes

**Abri a página e está tudo vazio. Perdi os dados?**
Provavelmente você abriu em outro navegador/aparelho, em aba anônima, ou os dados do navegador foram limpos. Use **Importar arquivo** com o último `escala-servico-banco.json`.

**Posso usar em dois computadores?**
Sim, desde que leve o arquivo junto: exporte em um, importe no outro. Não há sincronização automática.

**Duas pessoas podem mexer ao mesmo tempo?**
Não. Cada uma teria a sua cópia, e uma sobrescreveria a outra ao exportar. Passe o arquivo de mão em mão.

**O botão Imprimir está cinza.**
A escala ainda não foi lançada, ou foi alterada depois do lançamento. Clique em **LANÇAR**.

**Lancei errado. E agora?**
Use **Desfazer último passo** (Histórico, Sugestões ou o aviso logo após lançar). Ou corrija a escala e lance de novo, que o lançamento do mesmo dia **substitui** o anterior.

**Importei o arquivo errado.**
Logo após importar, use **Desfazer** no aviso. Se já saiu da tela, importe o arquivo correto.

**A folga de alguém está errada.**
Use o botão **Folga** para ajustar. Para recomeçar do zero, use **Resetar todas as folgas** em Sugestões.

**Preciso apagar tudo e começar do zero.**
Remova os dados do site nas configurações do navegador e abra o `index.html` novamente (sem importar nenhum arquivo). Guarde antes uma cópia do `.json`.

---

## Resumo em uma linha

> **Não há banco de dados. O banco é o arquivo `escala-servico-banco.json`: importe antes de usar, exporte depois de usar, e guarde sempre a versão mais recente.**

---

Desenvolvido por Pedro Ribeiro da Rosa - Todos os direitos reservados
