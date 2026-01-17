# Características das Espécies de Peixes

Este documento descreve as características específicas de cada espécie de peixe no aquário, baseadas em comportamentos reais de peixes marinhos.

## Sistema de Características

Cada espécie possui os seguintes atributos que influenciam seu comportamento:

### 1. **Preferência de Profundidade (depthPreference)**
- **Escala:** 0.0 (fundo) a 1.0 (superfície)
- **Efeito:** Determina em qual profundidade o peixe prefere nadar
- Peixes tendem a voltar gradualmente para sua profundidade preferida quando vagueando

### 2. **Tendência de Cardume (schoolingTendency)**
- **Escala:** 0.0 (solitário) a 1.0 (altamente social)
- **Efeito:** 
  - Influencia a força dos comportamentos de cardume (separação, alinhamento, coesão)
  - Determina o raio de percepção de outros peixes da mesma espécie
  - Peixes com alta tendência formam grupos mais coesos

### 3. **Nível Territorial (territorialLevel)**
- **Escala:** 0.0 (não territorial) a 1.0 (extremamente territorial)
- **Efeito:** Influencia a agressividade e defesa de áreas específicas
- *Nota: Sistema completo de territórios pode ser implementado no futuro*

### 4. **Nível de Atividade (activityLevel)**
- **Escala:** 0.0 (sedentário) a 1.0 (muito ativo)
- **Efeito:**
  - Afeta a frequência de mudanças de direção ao vaguear
  - Influencia a velocidade da animação da cauda
  - Determina quanto o peixe se move mesmo sem objetivo específico

### 5. **Velocidade de Cruzeiro (cruisingSpeed)**
- **Escala:** Multiplicador da velocidade base (0.5 a 1.5)
- **Efeito:** Velocidade normal do peixe durante natação relaxada

### 6. **Velocidade de Explosão (burstSpeed)**
- **Escala:** Multiplicador da velocidade base (1.0 a 3.0)
- **Efeito:** Velocidade máxima quando caçando ou fugindo

### 7. **Timidez (shyness)**
- **Escala:** 0.0 (corajoso) a 1.0 (muito tímido)
- **Efeito:**
  - Aumenta o raio de detecção de predadores
  - Aumenta a força da resposta de fuga
  - Influencia a probabilidade de procurar esconderijos

---

## Espécies Disponíveis

### 🐠 Peixe-palhaço (Amphiprion ocellaris)
**Características Reais:** Vive em simbiose com anêmonas, territorializa sua anêmona, vive em pequenos grupos familiares.

```javascript
{
  depthPreference: 0.7,      // Recifes rasos com anêmonas
  schoolingTendency: 0.3,    // Vive em pares/pequenos grupos
  territorialLevel: 0.7,     // Muito territorial com sua anêmona
  activityLevel: 0.6,        // Moderadamente ativo
  cruisingSpeed: 0.8,        // Nadador moderado
  burstSpeed: 1.5,           // Rápido quando necessário
  shyness: 0.4               // Não muito tímido
}
```

### 🔵 Cirurgião-azul (Paracanthurus hepatus)
**Características Reais:** Forma grandes cardumes, muito ativo, nada constantemente em busca de algas.

```javascript
{
  depthPreference: 0.5,      // Recifes de profundidade média
  schoolingTendency: 0.8,    // Alta tendência a cardumes
  territorialLevel: 0.3,     // Baixa territorialidade
  activityLevel: 0.8,        // Muito ativo
  cruisingSpeed: 1.2,        // Nada constantemente
  burstSpeed: 2.0,           // Muito rápido em explosões
  shyness: 0.5               // Moderadamente cauteloso
}
```

### 🦋 Peixe-borboleta (Chaetodon sp.)
**Características Reais:** Geralmente em pares, tímido, alimenta-se de corais e invertebrados.

```javascript
{
  depthPreference: 0.6,      // Águas rasas e recifes
  schoolingTendency: 0.2,    // Vive em pares ou sozinho
  territorialLevel: 0.5,     // Moderadamente territorial
  activityLevel: 0.7,        // Ativo durante o dia
  cruisingSpeed: 0.9,        // Nadador gracioso
  burstSpeed: 1.4,           // Rápido quando assustado
  shyness: 0.6               // Relativamente tímido
}
```

### 👼 Peixe-anjo (Pomacanthidae)
**Características Reais:** Solitário ou em pares, muito territorial, nada elegantemente.

```javascript
{
  depthPreference: 0.55,     // Recifes de profundidade média
  schoolingTendency: 0.1,    // Solitário ou em pares
  territorialLevel: 0.8,     // Muito territorial
  activityLevel: 0.5,        // Moderado, elegante
  cruisingSpeed: 0.7,        // Nada lentamente com elegância
  burstSpeed: 1.3,           // Moderadamente rápido
  shyness: 0.3               // Menos tímido, curioso
}
```

### 🦈 Barracuda (Sphyraena sp.)
**Características Reais:** Predador ágil, explosões de velocidade para caçar, juvenis em cardumes.

```javascript
{
  depthPreference: 0.4,      // Águas abertas, variável
  schoolingTendency: 0.4,    // Jovens em cardumes, adultos solitários
  territorialLevel: 0.5,     // Moderadamente territorial
  activityLevel: 0.7,        // Caçador ativo
  cruisingSpeed: 1.3,        // Rápido mesmo em cruzeiro
  burstSpeed: 2.5,           // Explosões extremamente rápidas
  shyness: 0.2               // Confiante
}
```

### 🦈 Tubarão-recife (Carcharhinus melanopterus)
**Características Reais:** Apex predator, patrulha territorial, nada constantemente.

```javascript
{
  depthPreference: 0.3,      // Patrulha fundo e meio do recife
  schoolingTendency: 0.0,    // Solitário
  territorialLevel: 0.9,     // Extremamente territorial
  activityLevel: 0.6,        // Patrulha constante
  cruisingSpeed: 1.0,        // Velocidade constante
  burstSpeed: 2.2,           // Rápido quando necessário
  shyness: 0.1               // Apex predator, não é tímido
}
```

### 🦁 Peixe-leão (Pterois volitans)
**Características Reais:** Caçador de emboscada, venenoso, se move lentamente até atacar.

```javascript
{
  depthPreference: 0.65,     // Áreas rochosas e recifes rasos
  schoolingTendency: 0.1,    // Solitário
  territorialLevel: 0.8,     // Territorial
  activityLevel: 0.4,        // Caçador de emboscada, pouco ativo
  cruisingSpeed: 0.6,        // Lento e deliberado
  burstSpeed: 1.8,           // Ataque rápido quando necessário
  shyness: 0.2               // Confiante (espinhas venenosas)
}
```

### 🚩 Peixe Comunista
**Características Especiais:** Peixe ideológico que promove a revolução proletária.

```javascript
{
  depthPreference: 0.5,      // Nada em todas as profundidades (igualitário)
  schoolingTendency: 0.9,    // Alta tendência coletivista
  territorialLevel: 0.1,     // Baixa territorialidade (propriedade é roubo!)
  activityLevel: 0.7,        // Ativo na revolução
  cruisingSpeed: 1.0,        // Velocidade do povo
  burstSpeed: 1.5,           // Rápido quando necessário
  shyness: 0.2               // Corajoso na luta de classes
}
```

**Pensamentos Únicos:**
- "Trabalhadores do mundo, uni-vos!"
- "A propriedade é um roubo!"
- "De cada um conforme sua capacidade, a cada um conforme sua necessidade!"
- "Peixes de todos os mares, uni-vos!"
- "O espectro do comunismo ronda este aquário!"
- E mais...

**Habilidade Especial:** Quando devorado por um predador, um novo peixe comunista surge em outro local do aquário - "A revolução jamais morre!"

---

## Como as Características Afetam o Comportamento

### Durante Vagueio (Wander)
- **activityLevel**: Peixes mais ativos mudam de direção com mais frequência
- **depthPreference**: Força suave puxa o peixe para sua profundidade preferida
- **cruisingSpeed**: Determina a velocidade base de natação

### Durante Cardume (Schooling)
- **schoolingTendency**: Multiplica a força de separação, alinhamento e coesão
- Espécies com tendência < 0.3 raramente formam cardumes
- Espécies com tendência > 0.7 formam cardumes coesos e responsivos

### Durante Fuga (Flee)
- **shyness**: Aumenta o raio de detecção (0.7x a 1.3x do raio base)
- **shyness**: Aumenta a força de fuga (0.8x a 1.2x da força base)
- **burstSpeed**: Velocidade máxima durante fuga
- Peixes tímidos detectam predadores mais cedo e fogem com mais força

### Durante Caça (Seek Food)
- **burstSpeed**: Velocidade máxima ao perseguir presas ou buscar comida
- Predadores usam burst speed para caçar
- Herbívoros usam burst speed quando muito famintos

### Sistema de Energia
- Velocidade atual = velocidade base × (0.5 + energia/200)
- Peixes cansados nadam mais devagar
- Peixes descansam em esconderijos para recuperar energia

---

## Dicas de Observação

1. **Cirurgiões-azuis** formam os cardumes mais visíveis e coesos
2. **Tubarões-recife** patrulham constantemente o fundo do aquário
3. **Peixes-leão** se movem lentamente até dar ataques súbitos
4. **Barracudas** fazem patrulhas rápidas em busca de presas
5. **Peixe comunista** tende a nadar em grupos (comportamento coletivista)
6. **Peixes-palhaço** tendem a ficar em áreas específicas (comportamento territorial)
7. **Peixes-borboleta** são os mais tímidos e fogem facilmente

---

## Notas Técnicas

### Implementação de Velocidade
```javascript
// Velocidade base (definida por tipo)
const baseSpeed = isPredator ? 2.0 : 1.3;

// Velocidades calculadas
this.maxSpeed = baseSpeed * cruisingSpeed;
this.burstSpeed = baseSpeed * burstSpeed;

// Velocidade atual (afetada por energia)
this.currentSpeed = this.maxSpeed * (0.5 + this.energy / 200);
```

### Implementação de Profundidade
```javascript
calculateDepthPreferenceForce() {
    const currentDepth = this.position.y;
    const depthDifference = this.preferredDepth - currentDepth;
    const strength = 0.02; // Força suave
    return { x: 0, y: depthDifference * strength };
}
```

### Futuras Melhorias Possíveis
- [ ] Sistema completo de territórios com defesa ativa
- [ ] Ciclos dia/noite afetando atividade de cada espécie
- [ ] Reprodução com herança de características
- [ ] Envelhecimento e mudança de comportamento com a idade
- [ ] Variações individuais dentro da mesma espécie
