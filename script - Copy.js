let score = 0;
let gameActive = true;
let player;
let camera;
let collectables = [];
let obstacles = [];

// Configuração da cena
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Câmera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10, 20);
camera.lookAt(0, 0, 0);

// Iluminação
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(0, 10, 10);
scene.add(light);
scene.add(new THREE.AmbientLight(0x404040));

// Jogador (Esfera)
const playerGeometry = new THREE.SphereGeometry(1, 32, 32);
const playerMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
player = new THREE.Mesh(playerGeometry, playerMaterial);
scene.add(player);

// Chão
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x808080, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = Math.PI / 2;
scene.add(floor);

// Criar paredes
function createWalls() {
    const wallHeight = 5;
    const wallThickness = 1;
    const wallMaterial = new THREE.MeshPhongMaterial({ color: 0x606060 });

    const walls = [
        { x: 0, z: 25, w: 50, h: wallThickness }, // Norte
        { x: 0, z: -25, w: 50, h: wallThickness }, // Sul
        { x: 25, z: 0, w: wallThickness, h: 50 }, // Leste
        { x: -25, z: 0, w: wallThickness, h: 50 } // Oeste
    ];

    walls.forEach(({ x, z, w, h }) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(w, wallHeight, h), wallMaterial);
        wall.position.set(x, wallHeight / 2, z);
        scene.add(wall);
    });
}

createWalls();

// Gerar colecionáveis
function generateCollectable() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshPhongMaterial({ color: 0xffd700 });
    const cube = new THREE.Mesh(geometry, material);
    
    cube.position.x = (Math.random() - 0.5) * 40;
    cube.position.z = (Math.random() - 0.5) * 40;
    cube.position.y = 0.5;
    
    scene.add(cube);
    collectables.push(cube);
}

// Gerar obstáculos
function generateObstacle() {
    const geometry = new THREE.ConeGeometry(1, 2, 32);
    const material = new THREE.MeshPhongMaterial({ color: 0xff0000 });
    const cone = new THREE.Mesh(geometry, material);
    
    cone.position.x = (Math.random() - 0.5) * 40;
    cone.position.z = (Math.random() - 0.5) * 40;
    cone.position.y = 1;
    
    scene.add(cone);
    obstacles.push(cone);
}

// Controles
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Detecção de colisão
function checkCollision(obj1, obj2, distance = 2) {
    return obj1.position.distanceTo(obj2.position) < distance;
}

// Atualizar jogo
function update() {
    if (!gameActive) return;

    // Movimentação
    const speed = 0.1;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    // Manter jogador dentro do cenário
    player.position.x = THREE.MathUtils.clamp(player.position.x, -20, 20);
    player.position.z = THREE.MathUtils.clamp(player.position.z, -20, 20);

    // Atualizar posição da câmera
    camera.position.set(player.position.x, 10, player.position.z + 20);
    camera.lookAt(player.position);

    // Verificar colisões com colecionáveis
    collectables.forEach((collectable, index) => {
        collectable.rotation.y += 0.02;
        
        if (checkCollision(player, collectable)) {
            scene.remove(collectable);
            collectables.splice(index, 1);
            score += 10;
            document.getElementById('score').textContent = `Pontuação: ${score}`;
            generateCollectable();
        }
    });

    // Verificar colisões com obstáculos
    obstacles.forEach(obstacle => {
        if (checkCollision(player, obstacle)) {
            gameActive = false;
            document.getElementById('score').style.color = 'red';
            document.getElementById('score').textContent += ' - FIM DE JOGO!';
        }
    });
}

// Loop do jogo
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Iniciar jogo
generateCollectable();
generateCollectable();
generateObstacle();
animate();

// Redimensionar janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
