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

// Carregar modelo do jogador
const loader = new THREE.GLTFLoader();
loader.load('modelos/player.glb', function (gltf) {
    player = gltf.scene;
    player.scale.set(2, 2, 2); // Ajustar tamanho
    player.position.set(0, 0, 0);
    scene.add(player);
}, undefined, function (error) {
    console.error('Erro ao carregar o modelo:', error);
});

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

// Controles
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

// Atualizar jogo
function update() {
    if (!gameActive || !player) return; // Garante que o modelo carregou antes de atualizar

    const speed = 0.1;
    if (keys['w']) player.position.z -= speed;
    if (keys['s']) player.position.z += speed;
    if (keys['a']) player.position.x -= speed;
    if (keys['d']) player.position.x += speed;

    camera.position.set(player.position.x, 10, player.position.z + 20);
    camera.lookAt(player.position);
}

// Loop do jogo
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

// Iniciar jogo
animate();

// Redimensionar janela
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
