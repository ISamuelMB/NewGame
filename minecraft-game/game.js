class MinecraftGame {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.world = [];
        this.worldSize = 16;
        this.blockSize = 1;
        
        this.keys = {};
        this.mousePos = { x: 0, y: 0 };
        this.isPointerLocked = false;
        this.commandPanelOpen = false;
        
        this.gamepad = null;
        this.wheelConnected = false;
        this.wheelDeadzone = 0.15; // Increased deadzone
        this.steeringSmoothing = 0.9;
        this.pedalDeadzone = 0.2; // Separate deadzone for pedals
        this.lastAxesValues = []; // Store previous axis values to detect changes
        this.lastSteering = 0; // For steering smoothing
        
        this.init();
        this.generateWorld();
        this.setupControls();
        this.setupGamepad();
        this.setupCommandSystem();
        this.animate();
    }
    
    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
        
        this.camera.position.set(8, 10, 8);
        
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        window.addEventListener('resize', () => this.onWindowResize(), false);
    }
    
    generateWorld() {
        this.world = [];
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        
        const materials = [
            new THREE.MeshLambertMaterial({ color: 0x8B4513 }), // dirt
            new THREE.MeshLambertMaterial({ color: 0x228B22 }), // grass
            new THREE.MeshLambertMaterial({ color: 0x808080 }), // stone
        ];
        
        for (let x = 0; x < this.worldSize; x++) {
            this.world[x] = [];
            for (let z = 0; z < this.worldSize; z++) {
                this.world[x][z] = [];
                
                const height = Math.floor(Math.random() * 3) + 3;
                
                for (let y = 0; y < height; y++) {
                    let material;
                    if (y === height - 1) {
                        material = materials[1]; // grass on top
                    } else if (y < height - 3) {
                        material = materials[2]; // stone at bottom
                    } else {
                        material = materials[0]; // dirt in middle
                    }
                    
                    const cube = new THREE.Mesh(geometry, material);
                    cube.position.set(x, y, z);
                    cube.castShadow = true;
                    cube.receiveShadow = true;
                    cube.userData = { x, y, z, type: 'block' };
                    
                    this.scene.add(cube);
                    this.world[x][z][y] = cube;
                }
            }
        }
    }
    
    setupControls() {
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
            
            if (event.code === 'KeyT' && !this.commandPanelOpen) {
                this.toggleCommandPanel();
                event.preventDefault();
            }
            
            if (event.code === 'Escape' && this.commandPanelOpen) {
                this.toggleCommandPanel();
                event.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        document.addEventListener('click', (event) => {
            if (this.commandPanelOpen) return;
            
            if (!this.isPointerLocked) {
                this.renderer.domElement.requestPointerLock();
            } else {
                this.handleBlockInteraction();
            }
        });
        
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = document.pointerLockElement === this.renderer.domElement;
        });
        
        document.addEventListener('mousemove', (event) => {
            if (this.isPointerLocked) {
                const sensitivity = 0.002;
                this.mousePos.x -= event.movementX * sensitivity;
                this.mousePos.y -= event.movementY * sensitivity;
                
                this.mousePos.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.mousePos.y));
                
                this.camera.rotation.order = 'YXZ';
                this.camera.rotation.y = this.mousePos.x;
                this.camera.rotation.x = this.mousePos.y;
            }
        });
    }
    
    handleBlockInteraction() {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
        
        const intersects = raycaster.intersectObjects(this.scene.children.filter(obj => obj.userData.type === 'block'));
        
        if (intersects.length > 0) {
            const intersect = intersects[0];
            const block = intersect.object;
            const { x, y, z } = block.userData;
            
            this.scene.remove(block);
            this.world[x][z][y] = null;
        }
    }
    
    setupGamepad() {
        window.addEventListener('gamepadconnected', (event) => {
            console.log('Gamepad connected:', event.gamepad.id);
            if (event.gamepad.id.toLowerCase().includes('g29') || 
                event.gamepad.id.toLowerCase().includes('logitech') ||
                event.gamepad.id.toLowerCase().includes('driving')) {
                this.gamepad = event.gamepad;
                this.wheelConnected = true;
                this.updateUI('G29 Wheel Connected!');
            }
        });
        
        window.addEventListener('gamepaddisconnected', (event) => {
            if (this.gamepad && this.gamepad.index === event.gamepad.index) {
                this.wheelConnected = false;
                this.gamepad = null;
                this.updateUI('G29 Wheel Disconnected');
            }
        });
        
        setInterval(() => this.detectGamepad(), 1000);
    }
    
    detectGamepad() {
        if (this.wheelConnected) return; // Skip if already connected
        
        const gamepads = navigator.getGamepads();
        for (let i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                const id = gamepads[i].id.toLowerCase();
                if (id.includes('g29') || id.includes('logitech') || id.includes('driving')) {
                    this.gamepad = gamepads[i];
                    this.wheelConnected = true;
                    this.updateUI(`G29 Wheel Connected: ${gamepads[i].id}`);
                    break;
                }
            }
        }
    }
    
    updateUI(message) {
        const ui = document.getElementById('ui');
        if (ui) {
            ui.innerHTML = `
                <div>Simple Minecraft Clone with AI Builder</div>
                <div>WASD: Move | Mouse: Look | Click: Remove blocks | T: Toggle AI Commands</div>
                <div style="color: #4CAF50;">${message}</div>
            `;
        }
    }
    
    updateMovement() {
        const speed = 0.1;
        const direction = new THREE.Vector3();
        
        // Si el volante está conectado, solo usar controles del volante
        if (this.wheelConnected) {
            this.handleWheelInput(direction, speed);
        } else {
            // Handle keyboard input solo si no hay volante conectado
            if (this.keys['KeyW']) direction.z -= 1;
            if (this.keys['KeyS']) direction.z += 1;
            if (this.keys['KeyA']) direction.x -= 1;
            if (this.keys['KeyD']) direction.x += 1;
            if (this.keys['Space']) direction.y += 1;
            if (this.keys['ShiftLeft']) direction.y -= 1;
        }
        
        if (direction.length() > 0) {
            direction.normalize();
            direction.multiplyScalar(speed);
            
            const euler = new THREE.Euler(0, this.camera.rotation.y, 0, 'YXZ');
            direction.applyEuler(euler);
            
            this.camera.position.add(direction);
        }
    }
    
    handleWheelInput(direction, speed) {
        if (!this.wheelConnected) return;
        
        const gamepads = navigator.getGamepads();
        const gamepad = gamepads[this.gamepad?.index];
        if (!gamepad) return;
        
        // Store current axes values
        const currentAxes = [];
        for (let i = 0; i < gamepad.axes.length; i++) {
            currentAxes[i] = gamepad.axes[i];
        }
        
        // Store axis values for smoothing (remove excessive logging)
        this.lastAxesValues = currentAxes;
        
        const steering = gamepad.axes[0] !== undefined ? gamepad.axes[0] : 0;
        
        // Initialize gas and brake
        let gas = 0;
        let brake = 0;
        
        // Gas and brake pedal handling with proper axis mapping
        const gasRaw = gamepad.axes[2] !== undefined ? gamepad.axes[2] : 1;
        const brakeRaw = gamepad.axes[1] !== undefined ? gamepad.axes[1] : 1;
        
        // Convert axis values (1 = not pressed, -1 = fully pressed) to 0-1 range
        if (gasRaw < 0.9) {
            gas = Math.max(0, (1 - gasRaw) / 2);
        }
        
        if (brakeRaw < 0.9) {
            brake = Math.max(0, (1 - brakeRaw) / 2);
        }
        
        // Fallback button controls for gas/brake if pedals not detected
        if (gas === 0 && brake === 0) {
            if (gamepad.buttons[7]?.pressed) gas = 1; // Right trigger as gas
            if (gamepad.buttons[6]?.pressed) brake = 1; // Left trigger as brake
        }
        
        // Steering controls camera rotation - extremely hard/direct
        if (Math.abs(steering) > this.wheelDeadzone) {
            const turnSpeed = 900.0; // Ángulo de giro máximo
            this.mousePos.x += steering * turnSpeed;
            this.camera.rotation.order = 'YXZ';
            this.camera.rotation.y = this.mousePos.x;
            this.camera.rotation.x = this.mousePos.y;
        }
        
        // SOLO mover hacia adelante cuando se presiona el gas lo suficiente
        if (gas > this.pedalDeadzone) {
            direction.z -= gas; // Forward con la intensidad del pedal
        }
        
        // SOLO mover hacia atrás cuando se presiona el freno lo suficiente
        if (brake > this.pedalDeadzone) {
            direction.z += brake * 0.5; // Backward (más lento)
        }
        
        // Botones del volante para movimiento vertical y lateral
        if (gamepad.buttons[0]?.pressed) { // X button
            direction.y += 1; // Subir
        }
        if (gamepad.buttons[1]?.pressed) { // Circle button  
            direction.y -= 1; // Bajar
        }
        if (gamepad.buttons[2]?.pressed) { // Square button
            direction.x -= 1; // Izquierda
        }
        if (gamepad.buttons[3]?.pressed) { // Triangle button
            direction.x += 1; // Derecha
        }
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    setupCommandSystem() {
        const commandPanel = document.getElementById('command-panel');
        const commandInput = document.getElementById('command-input');
        const commandOutput = document.getElementById('command-output');
        const toggleButton = document.getElementById('toggle-commands');
        
        toggleButton.addEventListener('click', () => this.toggleCommandPanel());
        
        commandInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                const command = commandInput.value.trim();
                if (command) {
                    this.processCommand(command);
                    commandInput.value = '';
                }
            }
        });
        
        window.gameAPI = {
            placeBlock: (x, y, z, material = 'stone') => this.placeBlock(x, y, z, material),
            removeBlock: (x, y, z) => this.removeBlock(x, y, z),
            getPlayerPosition: () => ({
                x: Math.round(this.camera.position.x),
                y: Math.round(this.camera.position.y),
                z: Math.round(this.camera.position.z)
            }),
            clearArea: (x1, y1, z1, x2, y2, z2) => this.clearArea(x1, y1, z1, x2, y2, z2),
            buildStructure: (structure, startX, startY, startZ) => this.buildStructure(structure, startX, startY, startZ)
        };
    }
    
    toggleCommandPanel() {
        const panel = document.getElementById('command-panel');
        this.commandPanelOpen = !this.commandPanelOpen;
        panel.style.display = this.commandPanelOpen ? 'block' : 'none';
        
        if (this.commandPanelOpen) {
            document.getElementById('command-input').focus();
            document.exitPointerLock();
        }
    }
    
    processCommand(command) {
        const output = document.getElementById('command-output');
        output.innerHTML += `<br><strong>You:</strong> ${command}`;
        output.innerHTML += `<br><strong>AI:</strong> I'll build that for you! Processing "${command}"...`;
        
        const playerPos = window.gameAPI.getPlayerPosition();
        output.innerHTML += `<br>Your position: ${playerPos.x}, ${playerPos.y}, ${playerPos.z}`;
        
        this.executeAICommand(command, playerPos);
        
        output.scrollTop = output.scrollHeight;
    }
    
    executeAICommand(command, playerPos) {
        const output = document.getElementById('command-output');
        
        try {
            output.innerHTML += `<br>Debug: Player at (${playerPos.x}, ${playerPos.y}, ${playerPos.z})`;
            output.innerHTML += `<br>Debug: World size is ${this.worldSize}x${this.worldSize}`;
            
            // Simple test - place a single block first
            const testResult = this.placeBlock(playerPos.x + 1, playerPos.y + 5, playerPos.z + 1, 'brick');
            output.innerHTML += `<br>Debug: Test block placed = ${testResult}`;
            
            if (command.toLowerCase().includes('house')) {
                output.innerHTML += `<br>Building house at (${playerPos.x + 3}, ${playerPos.y}, ${playerPos.z + 3})`;
                this.buildHouse(playerPos.x + 3, playerPos.y, playerPos.z + 3);
                output.innerHTML += `<br>✓ Built a house`;
            } else if (command.toLowerCase().includes('tower')) {
                const height = this.extractNumber(command) || 5;
                output.innerHTML += `<br>Building ${height}-block tower at (${playerPos.x + 2}, ${playerPos.y}, ${playerPos.z + 2})`;
                this.buildTower(playerPos.x + 2, playerPos.y, playerPos.z + 2, height);
                output.innerHTML += `<br>✓ Built a ${height}-block tower`;
            } else if (command.toLowerCase().includes('test')) {
                // Simple test command
                for (let i = 0; i < 3; i++) {
                    this.placeBlock(playerPos.x + i, playerPos.y + 5, playerPos.z, 'brick');
                }
                output.innerHTML += `<br>✓ Built test blocks`;
            } else {
                output.innerHTML += `<br>Building test tower for: "${command}"`;
                this.buildTower(playerPos.x + 2, playerPos.y, playerPos.z + 2, 3);
                output.innerHTML += `<br>✓ Built a test tower`;
            }
        } catch (error) {
            output.innerHTML += `<br>❌ Error: ${error.message}`;
            console.error('AI Command Error:', error);
        }
    }
    
    extractNumber(text) {
        const match = text.match(/\d+/);
        return match ? parseInt(match[0]) : null;
    }
    
    placeBlock(x, y, z, materialType = 'stone') {
        // Validate coordinates
        if (y < 0 || y > 50) return false;
        if (x < -100 || x > 100 || z < -100 || z > 100) return false;
        
        const materials = {
            stone: new THREE.MeshLambertMaterial({ color: 0x808080 }),
            dirt: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            grass: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
            wood: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
            brick: new THREE.MeshLambertMaterial({ color: 0xB22222 })
        };
        
        const geometry = new THREE.BoxGeometry(this.blockSize, this.blockSize, this.blockSize);
        const material = materials[materialType] || materials.stone;
        
        const cube = new THREE.Mesh(geometry, material);
        cube.position.set(x, y, z);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.userData = { x, y, z, type: 'block' };
        
        this.scene.add(cube);
        
        // Properly handle world coordinates including negatives
        const worldX = x + 100; // Offset to handle negatives
        const worldZ = z + 100;
        
        if (!this.world[worldX]) this.world[worldX] = [];
        if (!this.world[worldX][worldZ]) this.world[worldX][worldZ] = [];
        if (!this.world[worldX][worldZ][y]) this.world[worldX][worldZ][y] = cube;
        
        return true;
    }
    
    removeBlock(x, y, z) {
        // Validate coordinates
        if (y < 0 || y > 50) return false;
        if (x < -100 || x > 100 || z < -100 || z > 100) return false;
        
        const worldX = x + 100; // Offset to handle negatives
        const worldZ = z + 100;
        
        if (this.world[worldX] && this.world[worldX][worldZ] && this.world[worldX][worldZ][y]) {
            this.scene.remove(this.world[worldX][worldZ][y]);
            this.world[worldX][worldZ][y] = null;
            return true;
        }
        return false;
    }
    
    clearArea(x1, y1, z1, x2, y2, z2) {
        for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
            for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                for (let z = Math.min(z1, z2); z <= Math.max(z1, z2); z++) {
                    this.removeBlock(x, y, z);
                }
            }
        }
    }
    
    buildHouse(startX, startY, startZ) {
        for (let x = 0; x < 5; x++) {
            for (let z = 0; z < 5; z++) {
                for (let y = 0; y < 4; y++) {
                    if (y === 0 || x === 0 || x === 4 || z === 0 || z === 4) {
                        if (!(x === 2 && z === 0 && y < 3)) {
                            this.placeBlock(startX + x, startY + y, startZ + z, 'wood');
                        }
                    }
                }
            }
        }
        
        for (let x = 1; x < 4; x++) {
            for (let z = 1; z < 4; z++) {
                this.placeBlock(startX + x, startY + 4, startZ + z, 'wood');
            }
        }
    }
    
    buildTower(startX, startY, startZ, height) {
        for (let y = 0; y < height; y++) {
            this.placeBlock(startX, startY + y, startZ, 'stone');
        }
    }
    
    buildPyramid(startX, startY, startZ) {
        const size = 7;
        for (let level = 0; level < size; level++) {
            const currentSize = size - level;
            for (let x = 0; x < currentSize; x++) {
                for (let z = 0; z < currentSize; z++) {
                    this.placeBlock(
                        startX + x + Math.floor(level / 2),
                        startY + level,
                        startZ + z + Math.floor(level / 2),
                        'stone'
                    );
                }
            }
        }
    }
    
    buildBridge(startX, startY, startZ, length) {
        for (let x = 0; x < length; x++) {
            this.placeBlock(startX + x, startY, startZ, 'wood');
            this.placeBlock(startX + x, startY + 1, startZ - 1, 'wood');
            this.placeBlock(startX + x, startY + 1, startZ + 1, 'wood');
        }
    }
    
    buildStructure(structure, startX, startY, startZ) {
        structure.forEach(block => {
            this.placeBlock(
                startX + block.x,
                startY + block.y,
                startZ + block.z,
                block.material
            );
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.updateMovement();
        this.renderer.render(this.scene, this.camera);
    }
}

const game = new MinecraftGame();