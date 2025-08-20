class RacingGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.track = [];
        
        // Car physics
        this.carPosition = { x: 0, y: 0.10, z: 0 }; // Lower to ground level
        this.carRotation = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.maxSpeed = 200;
        this.acceleration = 0;
        this.steering = 0;
        this.maxSteering = 0.25; // Increased from 0.15 for stronger steering
        
        // Realistic car physics
        this.wheelbase = 2.6; // Distance between front and rear axles
        this.frontWheelAngle = 0; // Current front wheel angle
        this.carMass = 1500; // kg
        this.tireGrip = 0.8; // Tire grip coefficient
        this.suspensionHeight = 0.5; // Suspension travel
        this.suspensionStiffness = 0.3; // Suspension stiffness
        
        // Simple car physics - no complex systems
        this.groundFriction = 0.98; // Simple ground friction
        this.airResistance = 0.995; // Simple air resistance
        
        // Controls
        this.keys = {};
        this.gamepad = null;
        this.wheelConnected = false;
        this.lastAxes = null;
        
        // Camera (attached to car)
        this.cameraOffset = { x: 0, y: 8, z: 15 }; // Positive Z to be behind the car in local space
        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseSensitivity = 0.002;
        
        this.init();
    }
    
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLighting();
        this.createTrack();
        this.createCar();
        this.setupControls();
        this.setupGamepadDetection();
        this.animate();
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 8, 15);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x87CEEB);
        document.getElementById('gameContainer').appendChild(this.renderer.domElement);
    }
    
    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        this.scene.add(directionalLight);
    }
    
    createTrack() {
        // Ground
        const groundGeometry = new THREE.PlaneGeometry(200, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // Track (oval)
        this.createOvalTrack();
        
        // Barriers
        this.createBarriers();
    }
    
    createOvalTrack() {
        const trackWidth = 12;
        const trackLength = 80;
        const trackRadius = 25;
        
        // Straight sections
        for (let i = 0; i < 2; i++) {
            const trackGeometry = new THREE.BoxGeometry(trackLength, 0.1, trackWidth);
            const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
            const trackSection = new THREE.Mesh(trackGeometry, trackMaterial);
            trackSection.position.set(0, 0.05, i === 0 ? trackRadius : -trackRadius);
            this.scene.add(trackSection);
        }
        
        // Curved sections
        for (let i = 0; i < 2; i++) {
            const curve = new THREE.TorusGeometry(trackRadius, trackWidth / 2, 8, 16, Math.PI);
            const curveMaterial = new THREE.MeshLambertMaterial({ color: 0x404040 });
            const curveSection = new THREE.Mesh(curve, curveMaterial);
            curveSection.rotation.x = -Math.PI / 2;
            curveSection.rotation.z = i * Math.PI;
            curveSection.position.set(i === 0 ? trackLength / 2 : -trackLength / 2, 0.05, 0);
            this.scene.add(curveSection);
        }
        
        // Starting line
        const startLineGeometry = new THREE.BoxGeometry(trackWidth, 0.2, 2);
        const startLineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
        startLine.position.set(0, 0.1, trackRadius);
        this.scene.add(startLine);
    }
    
    createBarriers() {
        // Create safety barriers around the track
        const barrierHeight = 2;
        const barrierWidth = 0.5;
        
        // Straight barriers
        for (let side = 0; side < 2; side++) {
            for (let section = 0; section < 2; section++) {
                const barrierGeometry = new THREE.BoxGeometry(80, barrierHeight, barrierWidth);
                const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
                const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
                barrier.position.set(
                    0,
                    barrierHeight / 2,
                    (section === 0 ? 31 : -31) * (side === 0 ? 1 : -1)
                );
                this.scene.add(barrier);
            }
        }
    }
    
    createCar() {
        const carGroup = new THREE.Group();
        
        // Car body
        const bodyGeometry = new THREE.BoxGeometry(4, 1.5, 2);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 0.75;
        body.castShadow = true;
        carGroup.add(body);
        
        // Car roof (positioned at back to show front direction)
        const roofGeometry = new THREE.BoxGeometry(2.5, 1, 1.8);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x800000 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.set(0.3, 1.5, 0); // Back of car (positive X is back now)
        roof.castShadow = true;
        carGroup.add(roof);
        
        // Front bumper to clearly show direction
        const bumperGeometry = new THREE.BoxGeometry(0.2, 0.5, 2.2);
        const bumperMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const bumper = new THREE.Mesh(bumperGeometry, bumperMaterial);
        bumper.position.set(-2.1, 0.5, 0); // Front of car (negative X is front now)
        bumper.castShadow = true;
        carGroup.add(bumper);
        
        // Headlights
        const headlightGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const headlightMaterial = new THREE.MeshLambertMaterial({ color: 0xffff00 });
        
        const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        leftHeadlight.position.set(-2.2, 0.8, 0.6);
        carGroup.add(leftHeadlight);
        
        const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
        rightHeadlight.position.set(-2.2, 0.8, -0.6);
        carGroup.add(rightHeadlight);
        
        // Wheels
        const wheelGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8);
        const wheelMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        
        // Create wheel groups for steering
        this.wheels = {
            frontLeft: new THREE.Group(),
            frontRight: new THREE.Group(),
            rearLeft: new THREE.Group(),
            rearRight: new THREE.Group()
        };
        
        const wheelData = [
            { group: this.wheels.frontLeft, pos: { x: -1.3, y: 0.5, z: 1.2 }, isFront: true },
            { group: this.wheels.frontRight, pos: { x: -1.3, y: 0.5, z: -1.2 }, isFront: true },
            { group: this.wheels.rearLeft, pos: { x: 1.3, y: 0.5, z: 1.2 }, isFront: false },
            { group: this.wheels.rearRight, pos: { x: 1.3, y: 0.5, z: -1.2 }, isFront: false }
        ];
        
        wheelData.forEach(data => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.rotation.x = Math.PI / 2;
            wheel.castShadow = true;
            
            data.group.add(wheel);
            data.group.position.set(data.pos.x, data.pos.y, data.pos.z);
            carGroup.add(data.group);
        });
        
        // Car is now properly oriented - no rotation needed
        // carGroup.rotation.y = 0; // Car faces forward naturally
        
        this.car = carGroup;
        this.car.position.set(this.carPosition.x, this.carPosition.y, this.carPosition.z);
        this.scene.add(this.car);
        
        // No direction indicator needed for simple car
    }
    

    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            this.keys[event.code] = true;
        });
        
        document.addEventListener('keyup', (event) => {
            this.keys[event.code] = false;
        });
        
        // Mouse controls
        document.addEventListener('mousemove', (event) => {
            this.mouseX += event.movementX * this.mouseSensitivity;
            this.mouseY += event.movementY * this.mouseSensitivity;
            this.mouseY = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, this.mouseY));
        });
        
        // Click to enable pointer lock
        this.renderer.domElement.addEventListener('click', () => {
            this.renderer.domElement.requestPointerLock();
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupGamepadDetection() {
        // Check for gamepad connection
        window.addEventListener('gamepadconnected', (event) => {
            console.log('Gamepad connected:', event.gamepad);
            this.checkForG29(event.gamepad);
        });
        
        window.addEventListener('gamepaddisconnected', (event) => {
            console.log('Gamepad disconnected:', event.gamepad);
            this.wheelConnected = false;
            this.updateWheelStatus();
        });
        
        // Periodically check for gamepads
        setInterval(() => {
            const gamepads = navigator.getGamepads();
            for (let i = 0; i < gamepads.length; i++) {
                if (gamepads[i]) {
                    this.checkForG29(gamepads[i]);
                    break;
                }
            }
        }, 1000);
    }
    
    checkForG29(gamepad) {
        if (gamepad && gamepad.id.toLowerCase().includes('g29')) {
            this.gamepad = gamepad;
            this.wheelConnected = true;
            console.log('G29 wheel detected!');
        } else if (gamepad) {
            this.gamepad = gamepad;
            this.wheelConnected = true;
            console.log('Generic gamepad detected:', gamepad.id);
        }
        this.updateWheelStatus();
    }
    
    updateWheelStatus() {
        const statusElement = document.getElementById('wheelStatus');
        if (this.wheelConnected) {
            statusElement.textContent = 'Volante G29: Conectado';
            statusElement.className = 'connected';
        } else {
            statusElement.textContent = 'Volante G29: Desconectado';
            statusElement.className = 'disconnected';
        }
    }
    
    handleInput() {
        let gasInput = 0;
        let brakeInput = 0;
        let steeringInput = 0;
        
        // Gamepad/Wheel input (priority)
        if (this.wheelConnected && this.gamepad) {
            const gamepads = navigator.getGamepads();
            const currentGamepad = gamepads[this.gamepad.index];
            
            if (currentGamepad) {
                // Steering (axis 0)
                steeringInput = currentGamepad.axes[0] || 0;
                
                // Debug: Log axis values only when they change significantly
                const axisChanges = currentGamepad.axes.some((val, i) => 
                    this.lastAxes && Math.abs((this.lastAxes[i] || 0) - (val || 0)) > 0.1
                );
                if (axisChanges || !this.lastAxes) {
                    console.log('Axes values:', currentGamepad.axes.map((val, i) => `Axis ${i}: ${val?.toFixed(2) || 'N/A'}`).join(', '));
                    this.lastAxes = [...currentGamepad.axes];
                }
                
                // Try multiple axis configurations for G29 pedals
                // Some G29 configurations use different axis numbers
                
                // Gas pedal - try axis 1 and 2
                let gasRaw = currentGamepad.axes[1];
                if (gasRaw === undefined || gasRaw >= 0.99) {
                    gasRaw = currentGamepad.axes[2]; // Alternative axis
                }
                if (gasRaw !== undefined && gasRaw < 0.95) {
                    gasInput = (1 - gasRaw) / 2;
                    console.log(`Gas pedal: ${gasRaw.toFixed(2)} -> ${gasInput.toFixed(2)}`);
                }
                
                // Brake pedal - try axis 2 and 1  
                let brakeRaw = currentGamepad.axes[2];
                if (brakeRaw === undefined || brakeRaw >= 0.95) {
                    brakeRaw = currentGamepad.axes[1]; // Alternative axis
                }
                if (brakeRaw !== undefined && brakeRaw < 0.95 && brakeRaw !== gasRaw) {
                    brakeInput = (1 - brakeRaw) / 2;
                    console.log(`Brake pedal: ${brakeRaw.toFixed(2)} -> ${brakeInput.toFixed(2)}`);
                }
                
                // Monitor clutch but don't use it for game controls
                const clutchRaw = currentGamepad.axes[3];
                if (clutchRaw !== undefined && clutchRaw < 0.8) {
                    console.log(`Clutch pedal detected (Axis 3): ${clutchRaw.toFixed(2)} - IGNORED`);
                }
            }
        }
        
        // Keyboard input (always available as backup)
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            gasInput = Math.max(gasInput, 1);
            console.log('KEYBOARD: W pressed - setting gasInput to 1');
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            brakeInput = Math.max(brakeInput, 1);
            console.log('KEYBOARD: S pressed - setting brakeInput to 1');
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            steeringInput = -1;
            console.log('KEYBOARD: A pressed - steering left');
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            steeringInput = 1;
            console.log('KEYBOARD: D pressed - steering right');
        }
        
        // Debug current inputs - ALWAYS show when there's any input
        if (gasInput > 0 || brakeInput > 0 || steeringInput !== 0) {
            console.log(`INPUT - Gas: ${gasInput.toFixed(3)}, Brake: ${brakeInput.toFixed(3)}, Steering: ${steeringInput.toFixed(3)}, Speed: ${this.speed.toFixed(1)}, Accel: ${this.acceleration?.toFixed(1) || 'N/A'}`);
        }
        
        // Simple input handling - like a normal car
        if (brakeInput > 0.1) {
            // Simple braking
            this.acceleration = -brakeInput * 0.8;
        } else {
            // Simple acceleration
            this.acceleration = gasInput * 0.3;
        }
        
        // Simple steering
        this.steering = steeringInput * this.maxSteering;
    }
    
    updatePhysics() {
        // Simple physics - just like a normal car
        
        // Update speed
        this.speed += this.acceleration;
        this.speed *= this.groundFriction; // Simple friction
        this.speed = Math.max(-this.maxSpeed / 2, Math.min(this.maxSpeed, this.speed));
        
        // Improved car steering physics
        if (Math.abs(this.speed) > 0.1) {
            // More realistic turning based on bicycle model
            const frontWheelAngle = this.steering * 0.8; // Max 45.8 degrees
            const speedFactor = Math.abs(this.speed) / this.maxSpeed;
            
            // Ackermann steering geometry - front wheels control direction
            const turnRadius = this.wheelbase / Math.tan(Math.abs(frontWheelAngle) + 0.001);
            const angularVelocity = -(this.speed / turnRadius) * Math.sign(frontWheelAngle);
            
            // Apply speed-dependent steering sensitivity
            const steeringDamping = Math.max(0.3, 1 - speedFactor * 0.7); // Less sensitive at high speed
            this.carRotation.y += angularVelocity * 0.01 * steeringDamping;
            
            // Store front wheel angle for visual feedback
            this.frontWheelAngle = frontWheelAngle;
        }
        
        // Car moves forward in its current direction (not sideways)
        const forwardVelocity = Math.sin(this.carRotation.y) * this.speed * 0.1;
        const lateralVelocity = -Math.cos(this.carRotation.y) * this.speed * 0.1;
        
        // Update velocity (X is forward/backward, Z is left/right)
        this.velocity.x = lateralVelocity;
        this.velocity.z = forwardVelocity;
        
        // Update position
        this.carPosition.x += this.velocity.x;
        this.carPosition.z += this.velocity.z;
        
        // Simple height
        this.carPosition.y = 0.1;
        
        // Update car mesh
        this.car.position.set(this.carPosition.x, this.carPosition.y, this.carPosition.z);
        this.car.rotation.y = this.carRotation.y;
        
        // Update wheel steering for front wheels with improved physics
        const visualSteeringAngle = -this.frontWheelAngle * 1.5; // Visual feedback
        this.wheels.frontLeft.rotation.y = visualSteeringAngle;
        this.wheels.frontRight.rotation.y = visualSteeringAngle;
    }
    
    updateCamera() {
        // Camera rigidly attached to the car's coordinate system
        this.camera.position.set(
            this.carPosition.x,
            this.carPosition.y + this.cameraOffset.y,
            this.carPosition.z
        );
        
        // Apply car's rotation to camera position offset (car faces negative X)
        const offsetVector = new THREE.Vector3(this.cameraOffset.z, 0, -this.cameraOffset.x);
        offsetVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carRotation.y);
        this.camera.position.add(offsetVector);
        
        // Look in the exact direction the car's headlights are pointing (car faces negative X)
        const headlightDirection = new THREE.Vector3(-1, 0, 0); // Direction where headlights point in world space
        headlightDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.carRotation.y);
        
        // Point far ahead from camera position in headlight direction
        const lookTarget = new THREE.Vector3(
            this.camera.position.x + headlightDirection.x * 50,
            this.camera.position.y,
            this.camera.position.z + headlightDirection.z * 50
        );
        
        this.camera.lookAt(lookTarget);
    }
    
    updateUI() {
        const speedKmh = Math.abs(this.speed * 2).toFixed(0);
        document.getElementById('speed').textContent = `Velocidad: ${speedKmh} km/h`;
        
        // Show simple car info
        const physicsInfo = document.getElementById('physicsInfo');
        if (physicsInfo) {
            const carAngle = (this.carRotation.y * 180 / Math.PI).toFixed(1);
            physicsInfo.textContent = `Ángulo del auto: ${carAngle}°`;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        this.handleInput();
        this.updatePhysics();
        this.updateCamera();
        this.updateUI();
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the game when the page loads
window.addEventListener('load', () => {
    new RacingGame();
});