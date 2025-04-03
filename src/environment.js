import { CommunistFish } from './entities/communistFish.js';

const canvasWidth = window.innerWidth;
const canvasHeight = window.innerHeight;

let fishes = [];
let corals = [];
let jellyfishes = [];
let hideouts = [];

function setup() {
    createCanvas(canvasWidth, canvasHeight);
    initializeEnvironment();
}

function draw() {
    background(0, 150, 255); // Cor do fundo representando a água
    updateEntities();
    displayEntities();
}

function initializeEnvironment() {
    // Criação de corais
    for (let i = 0; i < 10; i++) {
        corals.push(new Coral(random(width), random(height), random(20, 50), color(random(255), random(255), random(255))));
    }

    // Criação de águas-vivas
    for (let i = 0; i < 5; i++) {
        jellyfishes.push(new Jellyfish(random(width), random(height), random(10, 30)));
    }

    // Criação de tocas
    for (let i = 0; i < 3; i++) {
        hideouts.push(new Hideout(random(width), random(height), random(50, 100)));
    }

    // Criação de peixes
    for (let i = 0; i < 20; i++) {
        let isPredator = random() < 0.3; // 30% de chance de ser um predador
        fishes.push(new Fish(random(width), random(height), random(10, 30), isPredator));
    }

    // Adicionar o peixe comunista ao ambiente como qualquer outro peixe
    try {
        const communistFish = new CommunistFish(
            Math.random() * window.innerWidth, 
            Math.random() * window.innerHeight,
            30 // tamanho fixo
        );
        
        fishes.push(communistFish);
        console.log("Peixe comunista adicionado com sucesso!");
    } catch (e) {
        console.error("Erro ao criar o peixe comunista:", e);
    }
}

function updateEntities() {
    for (let fish of fishes) {
        fish.update(fishes, corals, jellyfishes, hideouts);
    }
}

function displayEntities() {
    for (let coral of corals) {
        coral.display();
    }
    for (let jellyfish of jellyfishes) {
        jellyfish.display();
    }
    for (let hideout of hideouts) {
        hideout.display();
    }
    for (let fish of fishes) {
        fish.display();
    }
}

function createCommunistFish() {
    try {
        const communistFish = new CommunistFish(
            Math.random() * window.innerWidth,
            Math.random() * window.innerHeight,
            30 // tamanho fixo
        );
        fishes.push(communistFish);
        console.log("Novo peixe comunista criado!");
        return communistFish;
    } catch (e) {
        console.error("Erro ao criar peixe comunista:", e);
        return null;
    }
}

export { createCommunistFish };
