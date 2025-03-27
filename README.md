# Aquário Marinho

Este projeto é uma simulação interativa de um aquário marinho, onde diferentes espécies de peixes nadam em um ambiente de corais. A animação inclui interações entre os peixes, como busca por comida, fuga de predadores e esconderijo em tocas.

## Funcionalidades

- Peixes de diferentes espécies, tamanhos e cores
- Predadores que caçam outros peixes
- Peixes herbívoros que se alimentam de corais e algas
- Balões de pensamento que mostram o que cada peixe está pensando
- Tocas onde os peixes podem se esconder
- Águas-vivas que flutuam pelo aquário
- Corais e algas no fundo do aquário
- Bolhas que sobem pela água
- Raios de luz atravessando a água
- Interface para adicionar novos elementos
- Interatividade com mouse

## Como Usar

1. Abra o arquivo `index.html` em um navegador moderno (Chrome, Firefox, Edge, etc.)
2. Clique nos botões no canto superior direito para adicionar novos elementos ao aquário
3. Clique em qualquer peixe para ver o que ele está pensando
4. Clique em qualquer lugar da água para criar bolhas

## Estrutura do Projeto

- **index.html**: Estrutura principal da aplicação, contendo a configuração do ambiente HTML e a inclusão dos scripts e estilos necessários.
- **style.css**: Estilos CSS para a animação e apresentação visual do aquário marinho.
- **src/main.js**: Ponto de entrada da aplicação, inicializa a animação e gerencia a lógica principal do aquário.
- **src/entities**: Contém as definições das entidades do aquário:
  - **entity.js**: Classe base `Entity` para todos os objetos do aquário.
  - **fish.js**: Classe `Fish`, que herda de `Entity`, com métodos como `swim()`, `eat()`, e `think()`.
  - **coral.js**: Classe `Coral`, representando os corais no ambiente.
  - **jellyfish.js**: Classe `Jellyfish`, representando as águas-vivas.
  - **hideout.js**: Classe `Hideout`, representando as tocas onde os peixes podem se esconder.
  - **alga.js**: Classe `Alga`, representando as algas marinhas.
  - **bubble.js**: Classe `Bubble`, representando as bolhas na água.
- **src/behaviors**: Contém os comportamentos dos peixes:
  - **behavior.js**: Classe base `Behavior`.
  - **seekFood.js**: Implementa o comportamento de busca por comida.
  - **flee.js**: Implementa o comportamento de fuga de predadores.
  - **wander.js**: Implementa o comportamento de natação aleatória.
  - **hide.js**: Implementa o comportamento de se esconder em tocas.
  - **schooling.js**: Implementa o comportamento de cardume (peixes da mesma espécie nadam juntos).
- **src/utils**: Funções utilitárias para o projeto:
  - **vector.js**: Manipulação de vetores.
  - **collision.js**: Detecção de colisões entre entidades.
  - **thoughtBubble.js**: Criação e exibição de balões de pensamento.

## Comportamentos dos Peixes

Os peixes na simulação têm diversos comportamentos que determinam como eles se movem no ambiente:

1. **Vagar**: Quando não têm nenhum objetivo específico, os peixes nadam aleatoriamente pelo aquário.
2. **Buscar comida**: Quando estão com fome, peixes procuram alimento. Predadores buscam peixes menores, enquanto herbívoros buscam corais e algas.
3. **Fugir**: Peixes não-predadores fogem quando detectam um predador nas proximidades.
4. **Esconder-se**: Quando fogem de predadores, os peixes podem decidir buscar uma toca para se esconder.
5. **Cardumar**: Peixes da mesma espécie tendem a nadar juntos, formando cardumes.

## Personalização

Você pode personalizar a simulação editando os seguintes arquivos:

- **main.js**: Altere as constantes `FISH_COUNT`, `CORAL_COUNT`, etc. para mudar a quantidade de elementos.
- **main.js**: Modifique `FISH_SPECIES` para adicionar novas espécies de peixes.
- **behavior*.js**: Modifique os comportamentos para alterar como os peixes se comportam.

## Tecnologias Utilizadas

- HTML5 Canvas para renderização
- JavaScript ES6+ para lógica e comportamentos
- CSS para estilos e animações
- Módulos ES6 para organização do código

## Créditos

Desenvolvido para estudo e diversão. Inspirado em simulações de vida artificial e comportamentos emergentes.