// Função de navegação: recebe o caminho do arquivo HTML
// e redireciona o navegador para a nova página.
function navegarPara(destino) {
    window.location.href = destino; // troca de tela
}

// ===============================================
//  CARREGAMENTO DAS IMAGENS
// ===============================================

// Carrega a imagem do personagem (dinossauro)
let dinoImg = new Image();
    dinoImg.src = "dino.png";

// Carrega a imagem do obstáculo (cacto)
let cactusImg = new Image();
    cactusImg.src = "cactus.png";

// Carrega a imagem do chão, que será repetida para dar a ilusão de movimento
let groundImg = new Image();
    groundImg.src = "ground.png";

// Variável usada para mover a imagem do chão horizontalmente
let groundX = 0;

// ===============================================
//  CONFIGURAÇÕES INICIAIS DO JOGO
// ===============================================

// Acessa o canvas do HTML e prepara o contexto 2D para desenhar
let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

// Define variáveis principais da física e lógica do jogo
let gravidade = 1;               // força que puxa o dino para baixo
let velocidadePulo = -15;        // força inicial do salto (negativa, pois sobe)
let velocidade = 7;             // velocidade com que os elementos se movem
let pontuacao = 0;               // pontuação do jogador
let perdeu = false;              // estado de derrota

// ===============================================
//  OBJETO DO JOGADOR (DINOSSAURO)
// ===============================================

let dino = {
    x: 250,             // posição horizontal
    y: 0,               // posição vertical (ajustada abaixo)
    largura: 60,        // largura do dino
    altura: 80,         // altura do dino
    hitX: 12,           // margem interna esquerda
    hitY: 10,           // margem interna topo
    hitW: 20,           // largura da hitbox 
    hitH: 70,           // altura  da hitbox        
    velocidadeY: 0,     // velocidade vertical (usada no salto)
    pulando: false      // indica se o dino está no ar
};

// Define a altura do chão (parte inferior do canvas)
let chaoY = canvas.height - 40;

// Posiciona o dino sobre o chão no início
dino.y = chaoY - dino.altura;

// ===============================================
//  CRIAÇÃO DOS OBSTÁCULOS (CACTOS)
// ===============================================
// Cada obstáculo tem posição e tamanho fixos
// No início, colocamos dois obstáculos com espaço entre eles

let obstaculos = [
    { x: canvas.width + 300, y: chaoY - 65, largura: 30, altura: 65 },
    { x: canvas.width + 700, y: chaoY - 55, largura: 25, altura: 55 }
];

// ===============================================
//  CONTROLE DO TECLADO
// ===============================================
// Quando o jogador aperta espaço:
// - Se estiver vivo e no chão → pula
// - Se estiver morto → reinicia o jogo

document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
        if (!dino.pulando && !perdeu) {
        dino.velocidadeY = velocidadePulo;
        dino.pulando = true;
    } else if (perdeu) {
        reiniciar();
    }
  }
});

// ===============================================
//  FUNÇÃO DE ATUALIZAÇÃO (FÍSICA E LÓGICA DO JOGO)
// ===============================================

function atualizar() {
    if (perdeu) return; // trava o jogo se perdeu

    // Atualiza a física do pulo
    dino.velocidadeY += gravidade;
    dino.y += dino.velocidadeY;

    // Se o dino tocar o chão, zera a queda e permite novo pulo
    if (dino.y >= chaoY - dino.altura) {
        dino.y = chaoY - dino.altura;
        dino.velocidadeY = 0;
        dino.pulando = false;
    }
    
    // Move a imagem do chão em loop (duas cópias)
    groundX -= velocidade;
    if (groundX <= -groundImg.width) {
        groundX = 0; // reinicia quando sair da tela
    }

    // Atualiza os obstáculos (cactos)
    for (let i = 0; i < obstaculos.length; i++) {
        obstaculos[i].x -= velocidade; // move os cactos para a esquerda

        // Verifica colisão entre o dino e o obstáculo atual

        let dinoHitLeft   = dino.x + dino.hitX;
        let dinoHitRight  = dinoHitLeft + dino.hitW;
        let dinoHitTop    = dino.y + dino.hitY;
        let dinoHitBottom = dinoHitTop  + dino.hitH;

        if (
            dinoHitLeft  < obstaculos[i].x + obstaculos[i].largura &&
            dinoHitRight > obstaculos[i].x &&
            dinoHitTop   < obstaculos[i].y + obstaculos[i].altura &&
            dinoHitBottom> obstaculos[i].y
        ) {
        perdeu = true;
        }

        // Se o obstáculo saiu da tela, reposiciona à direita com espaço aleatório
        if (obstaculos[i].x + obstaculos[i].largura < 0) {
            obstaculos[i].x = canvas.width + Math.random() * 200;
            pontuacao++; // soma 1 ponto
            if (velocidade < 10) velocidade += 0.7; // aumenta a velocidade do jogo
        }
    }
}

// ===============================================
//  FUNÇÃO DE DESENHO (RENDERIZAÇÃO)
// ===============================================

function desenhar() {
    // Limpa a tela antes de redesenhar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha o dino: imagem se já carregada, senão um retângulo preto
    if (dinoImg.complete) {
        ctx.drawImage(dinoImg, dino.x, dino.y, dino.largura, dino.altura);
    } else {
        ctx.fillStyle = "black";
        ctx.fillRect(dino.x, dino.y, dino.largura, dino.altura);
    }

    // Desenha cada cacto (imagem ou retângulo verde)
    for (let i = 0; i < obstaculos.length; i++) {
        let c = obstaculos[i];
        if (cactusImg.complete) {
            ctx.drawImage(cactusImg, c.x, c.y + 3, c.largura, c.altura);
        } else {
            ctx.fillStyle = "green";
            ctx.fillRect(c.x, c.y, c.largura, c.altura);
        }
    }

    // Desenha o chão usando duas imagens lado a lado para efeito contínuo
    let groundY = chaoY;
    ctx.drawImage(groundImg, groundX, groundY);
    ctx.drawImage(groundImg, groundX + groundImg.width, groundY);

    // Exibe a pontuação no canto superior esquerdo
    ctx.textAlign = "start";
    ctx.fillStyle = "black";
    ctx.font = '20px "Press Start 2P"';
    ctx.fillText("Pontuação: " + pontuacao, 10, 70);

    // Se o jogador perdeu, mostra a mensagem centralizada
    if (perdeu) {
        ctx.textAlign = "center";
        ctx.font = '30px "Press Start 2P"';
        ctx.fillText("VOCÊ PERDEU!", canvas.width / 2, canvas.height / 2 - 15);

        ctx.font = '12px "Press Start 2P"';
        ctx.fillText("Tecle ESPAÇO para reiniciar", canvas.width / 2, canvas.height / 2 + 15);
    }
}

// ===============================================
//  FUNÇÃO PARA REINICIAR O JOGO
// ===============================================

function reiniciar() {
    // Volta o dino para o chão e reinicia sua física
    dino.y = chaoY - dino.altura;
    dino.velocidadeY = 0;
    dino.pulando = false;

    // Reposiciona todos os cactos fora da tela, espaçados
    for (let i = 0; i < obstaculos.length; i++) {
        obstaculos[i].x = canvas.width + i * 300;
    }

    // Reinicia variáveis
    pontuacao = 0;
    velocidade = 7;
    perdeu = false;
}

// ===============================================
//  FUNÇÃO DE LOOP 
// ===============================================
function loop() {
  atualizar();
  desenhar();
  requestAnimationFrame(loop);
}

// ===============================================
//  INÍCIO DO LOOP DO JOGO
// ===============================================
loop(); // mantém o jogo em execução
