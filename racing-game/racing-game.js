class RacingGame {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.car = null;
        this.track = [];
        
        // Car physics - positioned at perfectly aligned starting line
        this.carPosition = { x: -250, y: 0.10, z: 0 }; // Starting at perfectly aligned circuit
        this.carRotation = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.speed = 0;
        this.maxSpeed = 200;
        this.acceleration = 0;
        this.steering = 0;
        this.maxSteering = 1; // Giro base
        this.keyboardMaxSteering = 0.5; // Giro con teclado
        this.wheelMaxSteering = 1.5; // Giro con volante G29
        
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
        // PREMIUM RACING FACILITY GROUNDS
        const groundGeometry = new THREE.PlaneGeometry(800, 800);
        const groundMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2d5a2d,
            shininess: 10,
            specular: 0x111111
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);
        
        // PADDOCK AREAS - Concrete surfaces
        const paddockMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            shininess: 80,
            specular: 0x333333
        });
        
        // REMOVED - All paddock and service roads that might interfere
        // Circuit area is now completely clean
        
        // Create professional racing circuit
        this.createRacingCircuit();
        
        // Enhanced barriers and safety features
        this.createEnhancedBarriers();
        
        // Add track decorations
        this.addTrackDecorations();
    }
    
    createRacingCircuit() {
        const trackWidth = 18; // Wider track
        
        // PREMIUM ASPHALT MATERIALS
        const trackMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2a2a2a,
            shininess: 30,
            specular: 0x111111
        });
        
        const curbMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff2222,
            shininess: 50,
            specular: 0x444444
        });
        
        const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        
        // Create a PERFECTLY ALIGNED rectangular circuit
        const trackPoints = [
            // ===== START/FINISH STRAIGHT (Perfect horizontal line) =====
            { x: -250, z: 0, width: trackWidth, elevation: 0 },
            { x: -200, z: 0, width: trackWidth, elevation: 0 },
            { x: -150, z: 0, width: trackWidth, elevation: 0 },
            { x: -100, z: 0, width: trackWidth, elevation: 0 },
            { x: -50, z: 0, width: trackWidth, elevation: 0 },
            { x: 0, z: 0, width: trackWidth, elevation: 0 },
            { x: 50, z: 0, width: trackWidth, elevation: 0 },
            { x: 100, z: 0, width: trackWidth, elevation: 0 },
            { x: 150, z: 0, width: trackWidth, elevation: 0 },
            { x: 200, z: 0, width: trackWidth, elevation: 0 },
            
            // ===== TURN 1: Perfect 90° right turn (smooth arc) =====
            { x: 210, z: -5, width: trackWidth, elevation: 0 },
            { x: 218, z: -12, width: trackWidth, elevation: 0 },
            { x: 225, z: -20, width: trackWidth, elevation: 0 },
            { x: 232, z: -30, width: trackWidth, elevation: 0 },
            { x: 238, z: -42, width: trackWidth, elevation: 0 },
            { x: 242, z: -55, width: trackWidth, elevation: 0 },
            { x: 245, z: -68, width: trackWidth, elevation: 0 },
            
            // ===== RIGHT STRAIGHT (Perfect vertical line) =====
            { x: 250, z: -80, width: trackWidth, elevation: 0 },
            { x: 250, z: -100, width: trackWidth, elevation: 0 },
            { x: 250, z: -120, width: trackWidth, elevation: 0 },
            { x: 250, z: -140, width: trackWidth, elevation: 0 },
            { x: 250, z: -160, width: trackWidth, elevation: 0 },
            { x: 250, z: -180, width: trackWidth, elevation: 0 },
            
            // ===== TURN 2: Perfect 90° right turn (smooth arc) =====
            { x: 245, z: -192, width: trackWidth, elevation: 0 },
            { x: 242, z: -205, width: trackWidth, elevation: 0 },
            { x: 238, z: -218, width: trackWidth, elevation: 0 },
            { x: 232, z: -230, width: trackWidth, elevation: 0 },
            { x: 225, z: -240, width: trackWidth, elevation: 0 },
            { x: 218, z: -248, width: trackWidth, elevation: 0 },
            { x: 210, z: -255, width: trackWidth, elevation: 0 },
            
            // ===== BACK STRAIGHT (Perfect horizontal line) =====
            { x: 200, z: -260, width: trackWidth, elevation: 0 },
            { x: 150, z: -260, width: trackWidth, elevation: 0 },
            { x: 100, z: -260, width: trackWidth, elevation: 0 },
            { x: 50, z: -260, width: trackWidth, elevation: 0 },
            { x: 0, z: -260, width: trackWidth, elevation: 0 },
            { x: -50, z: -260, width: trackWidth, elevation: 0 },
            { x: -100, z: -260, width: trackWidth, elevation: 0 },
            { x: -150, z: -260, width: trackWidth, elevation: 0 },
            { x: -200, z: -260, width: trackWidth, elevation: 0 },
            
            // ===== TURN 3: Perfect 90° right turn (smooth arc) =====
            { x: -210, z: -255, width: trackWidth, elevation: 0 },
            { x: -218, z: -248, width: trackWidth, elevation: 0 },
            { x: -225, z: -240, width: trackWidth, elevation: 0 },
            { x: -232, z: -230, width: trackWidth, elevation: 0 },
            { x: -238, z: -218, width: trackWidth, elevation: 0 },
            { x: -242, z: -205, width: trackWidth, elevation: 0 },
            { x: -245, z: -192, width: trackWidth, elevation: 0 },
            
            // ===== LEFT STRAIGHT (Perfect vertical line) =====
            { x: -250, z: -180, width: trackWidth, elevation: 0 },
            { x: -250, z: -160, width: trackWidth, elevation: 0 },
            { x: -250, z: -140, width: trackWidth, elevation: 0 },
            { x: -250, z: -120, width: trackWidth, elevation: 0 },
            { x: -250, z: -100, width: trackWidth, elevation: 0 },
            { x: -250, z: -80, width: trackWidth, elevation: 0 },
            { x: -250, z: -60, width: trackWidth, elevation: 0 },
            
            // ===== TURN 4: Perfect 90° right turn back to start (smooth arc) =====
            { x: -245, z: -68, width: trackWidth, elevation: 0 },
            { x: -242, z: -55, width: trackWidth, elevation: 0 },
            { x: -238, z: -42, width: trackWidth, elevation: 0 },
            { x: -232, z: -30, width: trackWidth, elevation: 0 },
            { x: -225, z: -20, width: trackWidth, elevation: 0 },
            { x: -218, z: -12, width: trackWidth, elevation: 0 },
            { x: -210, z: -5, width: trackWidth, elevation: 0 }
        ];
        
        // Create PREMIUM track segments with professional details
        for (let i = 0; i < trackPoints.length - 1; i++) {
            const current = trackPoints[i];
            const next = trackPoints[i + 1];
            
            const length = Math.sqrt(Math.pow(next.x - current.x, 2) + Math.pow(next.z - current.z, 2));
            const angle = Math.atan2(next.z - current.z, next.x - current.x);
            
            // MAIN ASPHALT SURFACE - Premium quality
            const segmentGeometry = new THREE.BoxGeometry(length, 0.3, current.width);
            const segment = new THREE.Mesh(segmentGeometry, trackMaterial);
            
            segment.position.set(
                (current.x + next.x) / 2,
                (current.elevation + next.elevation) / 2 + 0.15,
                (current.z + next.z) / 2
            );
            segment.rotation.y = angle;
            segment.receiveShadow = true;
            segment.castShadow = true;
            this.scene.add(segment);
            
            // CENTER LINE - Professional white stripes
            const centerLineGeometry = new THREE.BoxGeometry(length, 0.32, 0.3);
            const centerLine = new THREE.Mesh(centerLineGeometry, stripeMaterial);
            centerLine.position.set(
                (current.x + next.x) / 2,
                (current.elevation + next.elevation) / 2 + 0.16,
                (current.z + next.z) / 2
            );
            centerLine.rotation.y = angle;
            this.scene.add(centerLine);
            
            // RACING LINE INDICATORS (darker asphalt from tire wear)
            const racingLineGeometry = new THREE.BoxGeometry(length, 0.31, 3);
            const racingLineMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x1a1a1a,
                shininess: 60
            });
            const racingLine = new THREE.Mesh(racingLineGeometry, racingLineMaterial);
            
            // Offset racing line for realistic positioning
            const lineOffsetX = Math.cos(angle + Math.PI/2) * 2;
            const lineOffsetZ = Math.sin(angle + Math.PI/2) * 2;
            
            racingLine.position.set(
                (current.x + next.x) / 2 + lineOffsetX,
                (current.elevation + next.elevation) / 2 + 0.155,
                (current.z + next.z) / 2 + lineOffsetZ
            );
            racingLine.rotation.y = angle;
            this.scene.add(racingLine);
            
            // Skip automatic kerbs - we'll create them manually aligned
            // (This section intentionally left empty for manual kerb creation)
            
            // RUMBLE STRIPS for corner exits
            if (i % 8 === 0) { // Add rumble strips every 8th segment
                for (let rumble = 0; rumble < 5; rumble++) {
                    const rumbleGeometry = new THREE.BoxGeometry(2, 0.1, 0.8);
                    const rumbleMaterial = new THREE.MeshLambertMaterial({ color: 0xff8800 });
                    const rumbleStrip = new THREE.Mesh(rumbleGeometry, rumbleMaterial);
                    
                    const rumbleOffset = (rumble - 2) * 2.5;
                    const rumbleX = (current.x + next.x) / 2 + Math.cos(angle) * rumbleOffset;
                    const rumbleZ = (current.z + next.z) / 2 + Math.sin(angle) * rumbleOffset;
                    
                    rumbleStrip.position.set(
                        rumbleX,
                        (current.elevation + next.elevation) / 2 + 0.05,
                        rumbleZ
                    );
                    rumbleStrip.rotation.y = angle;
                    this.scene.add(rumbleStrip);
                }
            }
        }
        
        // Create perfectly aligned kerbs for rectangular track
        this.createAlignedKerbs(curbMaterial, stripeMaterial);
        
        // Enhanced starting line with grid positions
        this.createStartingGrid();
    }
    
    createEnhancedBarriers() {
        const barrierHeight = 4;
        const barrierMaterial = new THREE.MeshLambertMaterial({ color: 0x0066cc });
        const tireMaterial = new THREE.MeshLambertMaterial({ color: 0x222222 });
        
        // PERFECTLY POSITIONED safety barriers - FAR from racing line
        const barrierPositions = [
            // Safe outer perimeter barriers - adjusted for curved track
            { x: 0, z: 80, length: 600, rotation: 0 },      // North barrier
            { x: 0, z: -320, length: 600, rotation: 0 },    // South barrier  
            { x: 330, z: -120, length: 440, rotation: Math.PI/2 }, // East barrier
            { x: -330, z: -120, length: 440, rotation: Math.PI/2 }  // West barrier
        ];
        
        barrierPositions.forEach(pos => {
            // Main barrier
            const barrierGeometry = new THREE.BoxGeometry(pos.length, barrierHeight, 1);
            const barrier = new THREE.Mesh(barrierGeometry, barrierMaterial);
            barrier.position.set(pos.x, barrierHeight/2, pos.z);
            barrier.rotation.y = pos.rotation;
            barrier.castShadow = true;
            this.scene.add(barrier);
            
            // Tire wall in front of barrier
            for (let i = 0; i < pos.length/4; i++) {
                const tireGeometry = new THREE.TorusGeometry(1, 0.3, 8, 16);
                const tire = new THREE.Mesh(tireGeometry, tireMaterial);
                const offset = (i - pos.length/8) * 4;
                tire.position.set(
                    pos.x + Math.cos(pos.rotation) * offset,
                    0.5,
                    pos.z + Math.sin(pos.rotation) * offset
                );
                tire.rotation.x = Math.PI/2;
                tire.castShadow = true;
                this.scene.add(tire);
            }
        });
    }
    
    createAlignedKerbs(curbMaterial, stripeMaterial) {
        const kerbHeight = 0.4;
        const kerbWidth = 1.5;
        const trackHalfWidth = 9; // Half of 18m track width
        
        // ===== HORIZONTAL KERBS (Start/Finish and Back Straights) =====
        
        // Start/Finish straight kerbs (top and bottom) - scaled for larger circuit
        for (let side of [-1, 1]) {
            const kerbGeometry = new THREE.BoxGeometry(450, kerbHeight, kerbWidth);
            const kerb = new THREE.Mesh(kerbGeometry, curbMaterial);
            kerb.position.set(-25, 0.2, side * (trackHalfWidth + 0.75));
            kerb.castShadow = true;
            this.scene.add(kerb);
            
            // White stripes for start/finish kerbs
            for (let stripe = 0; stripe < 5; stripe++) {
                const stripeGeometry = new THREE.BoxGeometry(450, kerbHeight + 0.01, 0.2);
                const stripePattern = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripePattern.position.set(-25, 0.205, side * (trackHalfWidth + 0.75) + (stripe - 2) * 0.3);
                this.scene.add(stripePattern);
            }
        }
        
        // Back straight kerbs (top and bottom) - adjusted for curved track
        for (let side of [-1, 1]) {
            const kerbGeometry = new THREE.BoxGeometry(450, kerbHeight, kerbWidth);
            const kerb = new THREE.Mesh(kerbGeometry, curbMaterial);
            kerb.position.set(-25, 0.2, -260 + side * (trackHalfWidth + 0.75));
            kerb.castShadow = true;
            this.scene.add(kerb);
            
            // White stripes for back straight kerbs
            for (let stripe = 0; stripe < 5; stripe++) {
                const stripeGeometry = new THREE.BoxGeometry(450, kerbHeight + 0.01, 0.2);
                const stripePattern = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripePattern.position.set(-25, 0.205, -260 + side * (trackHalfWidth + 0.75) + (stripe - 2) * 0.3);
                this.scene.add(stripePattern);
            }
        }
        
        // ===== VERTICAL KERBS (Left and Right Straights) =====
        
        // Right straight kerbs (left and right of vertical section) - scaled for larger circuit
        for (let side of [-1, 1]) {
            const kerbGeometry = new THREE.BoxGeometry(kerbWidth, kerbHeight, 120);
            const kerb = new THREE.Mesh(kerbGeometry, curbMaterial);
            kerb.position.set(250 + side * (trackHalfWidth + 0.75), 0.2, -120);
            kerb.castShadow = true;
            this.scene.add(kerb);
            
            // White stripes for right straight kerbs
            for (let stripe = 0; stripe < 5; stripe++) {
                const stripeGeometry = new THREE.BoxGeometry(0.2, kerbHeight + 0.01, 120);
                const stripePattern = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripePattern.position.set(250 + side * (trackHalfWidth + 0.75) + (stripe - 2) * 0.3, 0.205, -120);
                this.scene.add(stripePattern);
            }
        }
        
        // Left straight kerbs (left and right of vertical section) - scaled for larger circuit
        for (let side of [-1, 1]) {
            const kerbGeometry = new THREE.BoxGeometry(kerbWidth, kerbHeight, 120);
            const kerb = new THREE.Mesh(kerbGeometry, curbMaterial);
            kerb.position.set(-250 + side * (trackHalfWidth + 0.75), 0.2, -120);
            kerb.castShadow = true;
            this.scene.add(kerb);
            
            // White stripes for left straight kerbs
            for (let stripe = 0; stripe < 5; stripe++) {
                const stripeGeometry = new THREE.BoxGeometry(0.2, kerbHeight + 0.01, 120);
                const stripePattern = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripePattern.position.set(-250 + side * (trackHalfWidth + 0.75) + (stripe - 2) * 0.3, 0.205, -120);
                this.scene.add(stripePattern);
            }
        }
        
        // ===== CORNER KERBS (Angled for 90° turns) =====
        
        const cornerKerbData = [
            // Turn 1 (top-right)
            { x: 135, z: -15, rotation: Math.PI/4 },
            // Turn 2 (bottom-right)  
            { x: 135, z: -105, rotation: -Math.PI/4 },
            // Turn 3 (bottom-left)
            { x: -135, z: -105, rotation: Math.PI/4 },
            // Turn 4 (top-left)
            { x: -135, z: -15, rotation: -Math.PI/4 }
        ];
        
        cornerKerbData.forEach(corner => {
            for (let side of [-1, 1]) {
                const kerbGeometry = new THREE.BoxGeometry(25, kerbHeight, kerbWidth);
                const kerb = new THREE.Mesh(kerbGeometry, curbMaterial);
                
                const offsetX = Math.cos(corner.rotation + Math.PI/2) * side * 12;
                const offsetZ = Math.sin(corner.rotation + Math.PI/2) * side * 12;
                
                kerb.position.set(corner.x + offsetX, 0.2, corner.z + offsetZ);
                kerb.rotation.y = corner.rotation;
                kerb.castShadow = true;
                this.scene.add(kerb);
                
                // White stripes for corner kerbs
                for (let stripe = 0; stripe < 3; stripe++) {
                    const stripeGeometry = new THREE.BoxGeometry(25, kerbHeight + 0.01, 0.2);
                    const stripePattern = new THREE.Mesh(stripeGeometry, stripeMaterial);
                    
                    const stripeOffsetX = Math.cos(corner.rotation + Math.PI/2) * side * 12;
                    const stripeOffsetZ = Math.sin(corner.rotation + Math.PI/2) * side * 12;
                    const stripeOffsetPerp = (stripe - 1) * 0.4;
                    
                    stripePattern.position.set(
                        corner.x + stripeOffsetX + Math.cos(corner.rotation) * stripeOffsetPerp,
                        0.205,
                        corner.z + stripeOffsetZ + Math.sin(corner.rotation) * stripeOffsetPerp
                    );
                    stripePattern.rotation.y = corner.rotation;
                    this.scene.add(stripePattern);
                }
            }
        });
    }

    createStartingGrid() {
        const trackWidth = 15;
        
        // PERFECTLY ALIGNED starting line
        const startLineGeometry = new THREE.BoxGeometry(trackWidth, 0.5, 5);
        const startLineMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
        startLine.position.set(-150, 0.25, 0);
        this.scene.add(startLine);
        
        // Aligned F1-style grid
        for (let i = 0; i < 10; i++) {
            const gridGeometry = new THREE.BoxGeometry(8, 0.4, 2);
            const gridMaterial = new THREE.MeshLambertMaterial({ 
                color: i === 0 ? 0x00ff00 : 0xffff00 // Pole position in green
            });
            const gridLine = new THREE.Mesh(gridGeometry, gridMaterial);
            gridLine.position.set(-145 + i * 30, 0.2, 0);
            this.scene.add(gridLine);
        }
    }
    
    addTrackDecorations() {
        // Grandstands
        this.createGrandstands();
        
        // Pit lane
        this.createPitLane();
        
        // Trees and scenery
        this.addScenery();
        
        // Track markers
        this.addTrackMarkers();
    }
    
    createGrandstands() {
        // REMOVED - All grandstands that might interfere with track visibility
        // Circuit is now completely clear for optimal racing
    }
    
    createPitLane() {
        // PADDOCK AREAS - Concrete surfaces for teams and garages
        const paddockMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x999999, 
            shininess: 30,
            specular: 0x222222
        });
        
        // Main paddock area behind start/finish straight - scaled for larger circuit
        const paddockGeometry = new THREE.BoxGeometry(450, 0.2, 60);
        const paddock = new THREE.Mesh(paddockGeometry, paddockMaterial);
        paddock.position.set(-25, 0.1, 40); // Behind the main straight
        paddock.receiveShadow = true;
        this.scene.add(paddock);
        
        // Garage buildings along paddock
        const garageMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            shininess: 10 
        });
        
        for (let i = 0; i < 18; i++) {
            const garageGeometry = new THREE.BoxGeometry(22, 8, 18);
            const garage = new THREE.Mesh(garageGeometry, garageMaterial);
            garage.position.set(-225 + i * 25, 4, 45);
            garage.castShadow = true;
            this.scene.add(garage);
            
            // Garage door (white)
            const doorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
            const doorGeometry = new THREE.BoxGeometry(20, 6, 0.2);
            const door = new THREE.Mesh(doorGeometry, doorMaterial);
            door.position.set(-225 + i * 25, 3, 36.1);
            this.scene.add(door);
        }
        
        // Paddock club building - scaled for larger circuit
        const clubGeometry = new THREE.BoxGeometry(80, 12, 30);
        const club = new THREE.Mesh(clubGeometry, garageMaterial);
        club.position.set(0, 6, 75);
        club.castShadow = true;
        this.scene.add(club);
    }
    
    addScenery() {
        // REMOVED - All trees and scenery that might create visual interference
        // Circuit is now completely clean for pure racing focus
    }
    
    addTrackMarkers() {
        // REMOVED - All markers and advertising boards that might interfere
        // Pure clean circuit for optimal racing experience
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
        
        // Adaptive steering based on input method
        let currentMaxSteering;
        let inputMethod = '';
        
        // Detect if wheel (gamepad) input is being used
        if (this.gamepad && Math.abs(steeringInput) > 0 && !this.keys['KeyA'] && !this.keys['KeyD'] && !this.keys['ArrowLeft'] && !this.keys['ArrowRight']) {
            currentMaxSteering = this.wheelMaxSteering;
            inputMethod = 'G29 Wheel';
        }
        // Detect if keyboard input is being used
        else if ((this.keys['KeyA'] || this.keys['KeyD'] || this.keys['ArrowLeft'] || this.keys['ArrowRight']) && Math.abs(steeringInput) > 0) {
            currentMaxSteering = this.keyboardMaxSteering;
            inputMethod = 'Keyboard';
        }
        // Default fallback
        else {
            currentMaxSteering = this.maxSteering;
            inputMethod = 'Default';
        }
        
        // Apply steering with appropriate sensitivity
        this.steering = steeringInput * currentMaxSteering;
        
        // Debug info when steering is applied
        if (Math.abs(steeringInput) > 0) {
            console.log(`Steering: ${inputMethod} - Max: ${currentMaxSteering} - Input: ${steeringInput.toFixed(3)} - Applied: ${this.steering.toFixed(3)}`);
        }
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