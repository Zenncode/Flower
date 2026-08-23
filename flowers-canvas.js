/**
 * High-Performance Procedural Flower & Bouquet Canvas Engine
 * Renders organic, blooming flowers, wind sway, particle physics, and interactions.
 */

class FlowerCanvasEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.flowers = [];
        this.floatingPetals = [];
        this.sparkles = [];
        this.fireflies = [];
        this.mouse = { x: -1000, y: -1000, isDown: false, targetFlower: null };

        this.time = 0;
        this.growthProgress = 0;
        this.isBlooming = false;
        this.bloomSpeed = 0.006;
        this.windStrength = 0.8;
        this.wrapType = 'luxury_ribbon'; // 'luxury_ribbon', 'matte_black', 'kraft_paper', 'frosted_glass'
        this.onFlowerClick = null;

        this.initCanvas();
        this.initEventListeners();
        this.initParticles();
        this.generateBouquet();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initCanvas() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * this.dpr;
        this.canvas.height = this.height * this.dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }

    initEventListeners() {
        window.addEventListener('resize', () => {
            this.initCanvas();
            this.generateBouquet();
        });

        const handlePointerMove = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            this.mouse.x = clientX - rect.left;
            this.mouse.y = clientY - rect.top;

            // Spawn stardust on drag or touch move
            if (this.mouse.isDown || Math.random() < 0.3) {
                this.addSparkles(this.mouse.x, this.mouse.y, 2);
            }

            // Check hovered flower
            this.checkHoveredFlower();
        };

        const handlePointerDown = (e) => {
            this.mouse.isDown = true;
            handlePointerMove(e);
            this.addSparkles(this.mouse.x, this.mouse.y, 8);
            if (window.romanticAudio) {
                window.romanticAudio.playSparkleSound();
            }

            // Check if clicked a flower
            const clickedFlower = this.getFlowerAt(this.mouse.x, this.mouse.y);
            if (clickedFlower) {
                this.burstPollen(clickedFlower.headX, clickedFlower.headY, clickedFlower.colorScheme.primary);
                if (this.onFlowerClick) {
                    this.onFlowerClick(clickedFlower);
                }
            }
        };

        const handlePointerUp = () => {
            this.mouse.isDown = false;
        };

        this.canvas.addEventListener('mousemove', handlePointerMove);
        this.canvas.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('mouseup', handlePointerUp);

        this.canvas.addEventListener('touchmove', handlePointerMove, { passive: true });
        this.canvas.addEventListener('touchstart', handlePointerDown, { passive: true });
        window.addEventListener('touchend', handlePointerUp);
    }

    initParticles() {
        // Floating rose / sakura petals in the air
        this.floatingPetals = [];
        const petalCount = this.width < 768 ? 16 : 28;
        for (let i = 0; i < petalCount; i++) {
            this.floatingPetals.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                size: 8 + Math.random() * 12,
                speedY: 0.6 + Math.random() * 1.2,
                speedX: -0.3 + Math.random() * 0.6,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.03,
                swayAmp: 1.5 + Math.random() * 2,
                swayFreq: 0.02 + Math.random() * 0.02,
                phase: Math.random() * Math.PI * 2,
                color: Math.random() > 0.4 ? 'rgba(255, 182, 193, 0.75)' : 'rgba(255, 105, 140, 0.65)'
            });
        }

        // Ambient glowing fireflies / orbs
        this.fireflies = [];
        for (let i = 0; i < 24; i++) {
            this.fireflies.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: 1.2 + Math.random() * 2.2,
                baseAlpha: 0.3 + Math.random() * 0.5,
                pulseSpeed: 0.03 + Math.random() * 0.04,
                phase: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4
            });
        }
    }

    addSparkles(x, y, count = 5) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 2.5;
            this.sparkles.push({
                x: x + (Math.random() - 0.5) * 10,
                y: y + (Math.random() - 0.5) * 10,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5,
                size: 2 + Math.random() * 3.5,
                alpha: 1,
                decay: 0.015 + Math.random() * 0.025,
                color: Math.random() > 0.5 ? '#fff' : (Math.random() > 0.5 ? '#ffd700' : '#ffb6c1')
            });
        }
    }

    burstPollen(x, y, color = '#ff69b4') {
        for (let i = 0; i < 35; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 4.5;
            this.sparkles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2.5 + Math.random() * 4,
                alpha: 1,
                decay: 0.012 + Math.random() * 0.018,
                color: Math.random() > 0.4 ? color : '#ffffff'
            });
        }
    }

    generateBouquet() {
        const cx = this.width / 2;
        const isMobile = this.width < 768;
        const cy = isMobile ? this.height * 0.88 : this.height * 0.90;
        const bouquetHeight = isMobile ? this.height * 0.48 : this.height * 0.55;

        this.bouquetOrigin = { x: cx, y: cy };
        this.flowers = [];

        // Definition of flowers in the luxury bouquet (13 Blooming Flowers)
        const flowerConfigs = [
            // 1. Centerpiece Grand Velvet Rose
            {
                id: 1,
                name: "Grand Velvet Rose",
                type: "rose",
                meaning: "My eternal, unconditional love for you",
                reason: "You are the sweetest part of every single day.",
                targetAngle: 0,
                stemLength: bouquetHeight * 0.96,
                scale: 1.15,
                curve: 0,
                colorScheme: {
                    primary: "#e6194b",
                    secondary: "#990024",
                    highlight: "#ff7597",
                    core: "#4a000e",
                    glow: "rgba(255, 50, 90, 0.4)"
                },
                delay: 0.0
            },
            // 2. Left Romantic Pink Peony
            {
                id: 2,
                name: "Blush Peony",
                type: "peony",
                meaning: "Happiness, romance, and prosperity",
                reason: "Your smile brightens up my whole world instantly.",
                targetAngle: -0.20,
                stemLength: bouquetHeight * 0.91,
                scale: 1.1,
                curve: -30,
                colorScheme: {
                    primary: "#ff8da1",
                    secondary: "#e05275",
                    highlight: "#ffeef2",
                    core: "#8c1b3f",
                    glow: "rgba(255, 140, 160, 0.4)"
                },
                delay: 0.06
            },
            // 3. Right Golden Sunflower
            {
                id: 3,
                name: "Sunlit Bloom",
                type: "sunflower",
                meaning: "Adoration, warmth, and pure loyalty",
                reason: "You bring so much warmth, comfort, and joy into my life.",
                targetAngle: 0.20,
                stemLength: bouquetHeight * 0.92,
                scale: 1.05,
                curve: 30,
                colorScheme: {
                    primary: "#ffb703",
                    secondary: "#fb8500",
                    highlight: "#fff3b0",
                    core: "#582f0e",
                    glow: "rgba(255, 183, 3, 0.4)"
                },
                delay: 0.10
            },
            // 4. Far Left Royal Lavender
            {
                id: 4,
                name: "Twilight Lavender",
                type: "lavender",
                meaning: "Grace, calmness, and devotion",
                reason: "Being with you feels like home and perfect peace.",
                targetAngle: -0.38,
                stemLength: bouquetHeight * 0.88,
                scale: 0.96,
                curve: -55,
                colorScheme: {
                    primary: "#9d4edd",
                    secondary: "#5a189a",
                    highlight: "#e0aaff",
                    core: "#240046",
                    glow: "rgba(157, 78, 221, 0.4)"
                },
                delay: 0.15
            },
            // 5. Far Right Sakura / Cherry Blossom
            {
                id: 5,
                name: "Sakura Cherry Blossom",
                type: "sakura",
                meaning: "Gentle beauty, kindness, and sweet beginnings",
                reason: "Every little moment with you is a cherished memory.",
                targetAngle: 0.38,
                stemLength: bouquetHeight * 0.89,
                scale: 0.96,
                curve: 55,
                colorScheme: {
                    primary: "#ffb3c6",
                    secondary: "#fb6f92",
                    highlight: "#ffffff",
                    core: "#ff477e",
                    glow: "rgba(255, 179, 198, 0.4)"
                },
                delay: 0.18
            },
            // 6. Mid-Left Enchanted Blue Lotus
            {
                id: 6,
                name: "Celestial Blue Lotus",
                type: "lotus",
                meaning: "Deep trust, magic, and soulful connection",
                reason: "I love your gentle heart, kindness, and beautiful laugh.",
                targetAngle: -0.12,
                stemLength: bouquetHeight * 0.77,
                scale: 0.94,
                curve: -18,
                colorScheme: {
                    primary: "#48cae4",
                    secondary: "#0077b6",
                    highlight: "#caf0f8",
                    core: "#03045e",
                    glow: "rgba(72, 202, 228, 0.4)"
                },
                delay: 0.22
            },
            // 7. Mid-Right Ruby Tulip
            {
                id: 7,
                name: "Crimson Tulip",
                type: "tulip",
                meaning: "Perfect and passionate love",
                reason: "I will choose you, love you, and treasure you always.",
                targetAngle: 0.12,
                stemLength: bouquetHeight * 0.78,
                scale: 0.95,
                curve: 18,
                colorScheme: {
                    primary: "#ff4d6d",
                    secondary: "#c9184a",
                    highlight: "#ffccd5",
                    core: "#590d22",
                    glow: "rgba(255, 77, 109, 0.4)"
                },
                delay: 0.25
            },
            // 8. Upper Right Golden Sunburst Rose (Background Depth)
            {
                id: 8,
                name: "Golden Sunburst Rose",
                type: "rose",
                meaning: "Joy, gratitude, and warm companionship",
                reason: "Every single day with you is filled with light, laughter, and grace.",
                targetAngle: 0.08,
                stemLength: bouquetHeight * 1.05,
                scale: 1.02,
                curve: 14,
                colorScheme: {
                    primary: "#ffbe0b",
                    secondary: "#d48b00",
                    highlight: "#fff0b3",
                    core: "#663e00",
                    glow: "rgba(255, 190, 11, 0.4)"
                },
                delay: 0.04
            },
            // 9. Upper Left Royal Magenta Peony (Background Depth)
            {
                id: 9,
                name: "Royal Magenta Peony",
                type: "peony",
                meaning: "Deep romance, prosperity, and devotion",
                reason: "Through every season of life, my heart belongs to you completely.",
                targetAngle: -0.08,
                stemLength: bouquetHeight * 1.04,
                scale: 1.04,
                curve: -14,
                colorScheme: {
                    primary: "#d90429",
                    secondary: "#850017",
                    highlight: "#ff758f",
                    core: "#40000a",
                    glow: "rgba(217, 4, 41, 0.4)"
                },
                delay: 0.05
            },
            // 10. Foreground Left Peach Blossom Tulip
            {
                id: 10,
                name: "Peach Sunrise Tulip",
                type: "tulip",
                meaning: "Gentle affection and sweet dreams",
                reason: "You make ordinary moments feel like pure magic and poetry.",
                targetAngle: -0.27,
                stemLength: bouquetHeight * 0.65,
                scale: 0.90,
                curve: -36,
                colorScheme: {
                    primary: "#ff9e00",
                    secondary: "#e85d04",
                    highlight: "#ffe3a8",
                    core: "#6a040f",
                    glow: "rgba(255, 158, 0, 0.4)"
                },
                delay: 0.28
            },
            // 11. Foreground Right Moonlit Lotus
            {
                id: 11,
                name: "Moonlit Violet Lotus",
                type: "lotus",
                meaning: "Serenity, peace, and spiritual bond",
                reason: "Being with you gives me a peace that no one else ever could.",
                targetAngle: 0.27,
                stemLength: bouquetHeight * 0.66,
                scale: 0.90,
                curve: 36,
                colorScheme: {
                    primary: "#7209b7",
                    secondary: "#3f37c9",
                    highlight: "#c77dff",
                    core: "#10002b",
                    glow: "rgba(114, 9, 183, 0.4)"
                },
                delay: 0.30
            },
            // 12. Foreground Far-Left Frosted Lavender
            {
                id: 12,
                name: "Frosted Lavender",
                type: "lavender",
                meaning: "Everlasting tenderness and loyalty",
                reason: "You will always be my favorite hello and my sweetest thought.",
                targetAngle: -0.46,
                stemLength: bouquetHeight * 0.60,
                scale: 0.86,
                curve: -72,
                colorScheme: {
                    primary: "#b5179e",
                    secondary: "#7209b7",
                    highlight: "#f72585",
                    core: "#240046",
                    glow: "rgba(181, 23, 158, 0.4)"
                },
                delay: 0.33
            },
            // 13. Foreground Far-Right Pearl White Sakura
            {
                id: 13,
                name: "Pearl White Sakura",
                type: "sakura",
                meaning: "Purity of love and cherished memories",
                reason: "Thank you for being my peace, my smile, and my greatest blessing.",
                targetAngle: 0.46,
                stemLength: bouquetHeight * 0.61,
                scale: 0.86,
                curve: 72,
                colorScheme: {
                    primary: "#ffe5ec",
                    secondary: "#ffb3c6",
                    highlight: "#ffffff",
                    core: "#ff758f",
                    glow: "rgba(255, 229, 236, 0.5)"
                },
                delay: 0.36
            }
        ];

        this.flowers = flowerConfigs.map(cfg => {
            const angle = cfg.targetAngle + (Math.random() - 0.5) * 0.04;
            const length = cfg.stemLength * (0.95 + Math.random() * 0.1);
            
            // Calculate natural stem endpoints
            const endX = cx + Math.sin(angle) * length + cfg.curve * 0.4;
            const endY = cy - Math.cos(angle) * length;

            // Generate leaves along stem
            const leaves = [
                { pos: 0.35, side: -1, size: 24 * cfg.scale, angle: -0.7 },
                { pos: 0.55, side: 1, size: 28 * cfg.scale, angle: 0.7 },
                { pos: 0.72, side: -1, size: 22 * cfg.scale, angle: -0.6 }
            ];

            return {
                ...cfg,
                baseX: cx,
                baseY: cy,
                headX: endX,
                headY: endY,
                currentHeadX: endX,
                currentHeadY: endY,
                leaves: leaves,
                swayOffset: Math.random() * Math.PI * 2,
                swaySpeed: 0.8 + Math.random() * 0.4,
                isHovered: false,
                bloomProgress: 0,
                clickRipple: 0
            };
        });
    }

    startBlooming() {
        this.isBlooming = true;
        this.growthProgress = 0;
        if (window.romanticAudio) {
            window.romanticAudio.playBloomBurstSound();
        }
    }

    checkHoveredFlower() {
        let found = null;
        for (let i = this.flowers.length - 1; i >= 0; i--) {
            const flower = this.flowers[i];
            const dist = Math.hypot(this.mouse.x - flower.currentHeadX, this.mouse.y - flower.currentHeadY);
            const radius = 45 * flower.scale;
            if (dist < radius) {
                found = flower;
                flower.isHovered = true;
                this.canvas.style.cursor = 'pointer';
            } else {
                flower.isHovered = false;
            }
        }
        if (!found) {
            this.canvas.style.cursor = 'default';
        }
        this.mouse.targetFlower = found;
    }

    getFlowerAt(x, y) {
        for (let i = this.flowers.length - 1; i >= 0; i--) {
            const flower = this.flowers[i];
            const dist = Math.hypot(x - flower.currentHeadX, y - flower.currentHeadY);
            const radius = 50 * flower.scale;
            if (dist < radius) {
                return flower;
            }
        }
        return null;
    }

    update() {
        this.time += 0.02;

        // Progress growth
        if (this.isBlooming && this.growthProgress < 1) {
            this.growthProgress += this.bloomSpeed;
            if (this.growthProgress > 1) this.growthProgress = 1;
        }

        // Update flowers
        this.flowers.forEach(flower => {
            // Calculate individual bloom progress
            const effectiveProgress = Math.max(0, (this.growthProgress - flower.delay) / (1 - flower.delay));
            flower.bloomProgress = Math.min(1, effectiveProgress);

            // Wind sway physics
            const wind = Math.sin(this.time * flower.swaySpeed + flower.swayOffset) * (8 * this.windStrength);
            const mouseProximity = Math.hypot(this.mouse.x - flower.headX, this.mouse.y - flower.headY);
            const mousePush = mouseProximity < 120 ? (1 - mouseProximity / 120) * 12 : 0;
            const pushDir = this.mouse.x < flower.headX ? 1 : -1;

            flower.currentHeadX = flower.headX + wind + (mousePush * pushDir);
            flower.currentHeadY = flower.headY + Math.abs(wind) * 0.3;

            if (flower.clickRipple > 0) {
                flower.clickRipple -= 0.03;
            }
        });

        // Update floating petals
        this.floatingPetals.forEach(petal => {
            petal.y += petal.speedY;
            petal.x += petal.speedX + Math.sin(this.time * petal.swayFreq + petal.phase) * petal.swayAmp;
            petal.rotation += petal.rotSpeed;

            // Screen wrap
            if (petal.y > this.height + 30) {
                petal.y = -20;
                petal.x = Math.random() * this.width;
            }
            if (petal.x < -30) petal.x = this.width + 20;
            if (petal.x > this.width + 30) petal.x = -20;
        });

        // Update fireflies
        this.fireflies.forEach(fly => {
            fly.x += fly.vx;
            fly.y += fly.vy;
            if (fly.x < 0 || fly.x > this.width) fly.vx *= -1;
            if (fly.y < 0 || fly.y > this.height) fly.vy *= -1;
        });

        // Update sparkles
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
            const sp = this.sparkles[i];
            sp.x += sp.vx;
            sp.y += sp.vy;
            sp.alpha -= sp.decay;
            if (sp.alpha <= 0) {
                this.sparkles.splice(i, 1);
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw ambient fireflies
        this.drawFireflies();

        // 2. Draw bouquet stems and leaves
        this.drawStemsAndLeaves();

        // 3. Draw bouquet wrapping (if blossomed)
        if (this.growthProgress > 0.2) {
            this.drawBouquetWrap();
        }

        // 4. Draw flower blossoms
        this.drawFlowerBlossoms();

        // 5. Draw sparkles / pollen
        this.drawSparkles();

        // 6. Draw floating atmosphere petals
        this.drawFloatingPetals();
    }

    drawFireflies() {
        this.fireflies.forEach(fly => {
            const alpha = fly.baseAlpha + Math.sin(this.time * 2 + fly.phase) * 0.2;
            this.ctx.save();
            const grad = this.ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, fly.radius * 3);
            grad.addColorStop(0, `rgba(255, 240, 180, ${alpha})`);
            grad.addColorStop(0.5, `rgba(255, 200, 100, ${alpha * 0.4})`);
            grad.addColorStop(1, 'rgba(255, 200, 100, 0)');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(fly.x, fly.y, fly.radius * 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawStemsAndLeaves() {
        const ctx = this.ctx;

        this.flowers.forEach(flower => {
            if (flower.bloomProgress <= 0) return;

            const p = Math.min(1, flower.bloomProgress * 1.5); // Stems grow first
            const startX = flower.baseX;
            const startY = flower.baseY;
            const ctrlX = (startX + flower.currentHeadX) / 2 + flower.curve * 0.7;
            const ctrlY = (startY + flower.currentHeadY) / 2;

            // Interpolate current growth tip
            const currentHeadX = startX + (flower.currentHeadX - startX) * p;
            const currentHeadY = startY + (flower.currentHeadY - startY) * p;

            ctx.save();
            ctx.lineWidth = 5 * flower.scale;
            ctx.lineCap = 'round';

            // Natural stem gradient
            const stemGrad = ctx.createLinearGradient(startX, startY, currentHeadX, currentHeadY);
            stemGrad.addColorStop(0, '#1b4332');
            stemGrad.addColorStop(0.5, '#2d6a4f');
            stemGrad.addColorStop(1, '#52b788');
            ctx.strokeStyle = stemGrad;

            // Draw curved stem
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(ctrlX, ctrlY, currentHeadX, currentHeadY);
            ctx.stroke();

            // Draw leaves along stem if grown enough
            flower.leaves.forEach(leaf => {
                if (p > leaf.pos) {
                    const leafProgress = Math.min(1, (p - leaf.pos) * 4);
                    // Leaf position along quadratic curve
                    const t = leaf.pos;
                    const lx = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * ctrlX + t * t * flower.currentHeadX;
                    const ly = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * ctrlY + t * t * flower.currentHeadY;

                    this.drawLeaf(lx, ly, leaf.size * leafProgress, leaf.angle, leaf.side);
                }
            });

            ctx.restore();
        });
    }

    drawLeaf(x, y, size, angle, side) {
        if (size <= 0) return;
        const ctx = this.ctx;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.scale(side, 1);

        const leafGrad = ctx.createLinearGradient(0, 0, size, -size * 0.4);
        leafGrad.addColorStop(0, '#2d6a4f');
        leafGrad.addColorStop(0.6, '#40916c');
        leafGrad.addColorStop(1, '#74c69d');
        ctx.fillStyle = leafGrad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(size * 0.4, -size * 0.4, size * 0.8, -size * 0.2, size, 0);
        ctx.bezierCurveTo(size * 0.8, size * 0.2, size * 0.4, size * 0.3, 0, 0);
        ctx.fill();

        // Leaf central vein
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size * 0.9, 0);
        ctx.stroke();

        ctx.restore();
    }

    drawBouquetWrap() {
        const ctx = this.ctx;
        const cx = this.bouquetOrigin.x;
        const cy = this.bouquetOrigin.y;
        const wrapProgress = Math.min(1, (this.growthProgress - 0.2) * 2);
        const w = (this.width < 768 ? 95 : 130) * wrapProgress;
        const h = (this.width < 768 ? 120 : 150) * wrapProgress;

        ctx.save();
        ctx.translate(cx, cy - 20);

        // Luxury Silk Paper Wrapping
        const wrapGrad = ctx.createLinearGradient(-w, -h * 0.8, w, h);
        wrapGrad.addColorStop(0, '#1c1917');
        wrapGrad.addColorStop(0.5, '#292524');
        wrapGrad.addColorStop(1, '#0c0a09');

        ctx.fillStyle = wrapGrad;
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 25;

        // Cone / Folded Wrapping Geometry
        ctx.beginPath();
        ctx.moveTo(0, h * 0.6); // Bottom tip
        ctx.lineTo(-w, -h * 0.6);
        ctx.quadraticCurveTo(0, -h * 0.3, w, -h * 0.6);
        ctx.closePath();
        ctx.fill();

        // Golden Silk Ribbon & Bow
        ctx.shadowBlur = 0;
        const ribbonGrad = ctx.createLinearGradient(-w * 0.7, 0, w * 0.7, 0);
        ribbonGrad.addColorStop(0, '#e5a93c');
        ribbonGrad.addColorStop(0.5, '#fff1a8');
        ribbonGrad.addColorStop(1, '#c28723');

        ctx.fillStyle = ribbonGrad;
        ctx.fillRect(-w * 0.55, -h * 0.2, w * 1.1, 14);

        // Golden Bow loops
        ctx.beginPath();
        ctx.ellipse(-18, -h * 0.2 + 7, 20, 10, -Math.PI / 6, 0, Math.PI * 2);
        ctx.ellipse(18, -h * 0.2 + 7, 20, 10, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Ribbon Tails
        ctx.beginPath();
        ctx.moveTo(-5, -h * 0.2 + 7);
        ctx.quadraticCurveTo(-25, h * 0.2, -15, h * 0.45);
        ctx.lineTo(-6, h * 0.4);
        ctx.lineTo(0, -h * 0.2 + 10);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(5, -h * 0.2 + 7);
        ctx.quadraticCurveTo(25, h * 0.2, 15, h * 0.45);
        ctx.lineTo(6, h * 0.4);
        ctx.lineTo(0, -h * 0.2 + 10);
        ctx.fill();

        ctx.restore();
    }

    drawFlowerBlossoms() {
        this.flowers.forEach(flower => {
            if (flower.bloomProgress <= 0.2) return;

            const ctx = this.ctx;
            const x = flower.currentHeadX;
            const y = flower.currentHeadY;
            const scale = flower.scale * Math.min(1, (flower.bloomProgress - 0.15) * 1.25);

            ctx.save();
            ctx.translate(x, y);

            // Hover / Selected Glow Aura
            if (flower.isHovered || flower.clickRipple > 0) {
                const auraRadius = (55 + Math.sin(this.time * 6) * 6) * scale;
                const glowGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, auraRadius);
                glowGrad.addColorStop(0, flower.colorScheme.glow);
                glowGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
                glowGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
                ctx.fillStyle = glowGrad;
                ctx.beginPath();
                ctx.arc(0, 0, auraRadius, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw specific flower species
            switch (flower.type) {
                case 'rose':
                    this.drawRose(flower, scale);
                    break;
                case 'peony':
                    this.drawPeony(flower, scale);
                    break;
                case 'sunflower':
                    this.drawSunflower(flower, scale);
                    break;
                case 'lavender':
                    this.drawLavender(flower, scale);
                    break;
                case 'sakura':
                    this.drawSakura(flower, scale);
                    break;
                case 'lotus':
                    this.drawLotus(flower, scale);
                    break;
                case 'tulip':
                    this.drawTulip(flower, scale);
                    break;
                default:
                    this.drawRose(flower, scale);
            }

            // Interactive Badge Indicator (Pulse dot to invite clicking)
            if (flower.bloomProgress >= 0.9) {
                const pulse = 1 + Math.sin(this.time * 4 + flower.id) * 0.2;
                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                ctx.shadowColor = flower.colorScheme.primary;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(0, -38 * scale, 3.5 * pulse, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            ctx.restore();
        });
    }

    // --- Flower Species Renderers ---

    drawRose(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;

        // Multi-layered spiral rose petals
        const petalLayers = [
            { count: 7, radius: 36 * scale * p, width: 28 * scale, rot: 0 },
            { count: 6, radius: 27 * scale * p, width: 24 * scale, rot: 0.4 },
            { count: 5, radius: 18 * scale * p, width: 18 * scale, rot: 0.8 },
            { count: 4, radius: 11 * scale * p, width: 14 * scale, rot: 1.2 }
        ];

        petalLayers.forEach((layer, lIdx) => {
            const step = (Math.PI * 2) / layer.count;
            for (let i = 0; i < layer.count; i++) {
                const angle = i * step + layer.rot;
                const px = Math.cos(angle) * (layer.radius * 0.5);
                const py = Math.sin(angle) * (layer.radius * 0.5);

                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(angle + Math.PI / 2);

                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, layer.width);
                if (lIdx === 0) {
                    grad.addColorStop(0, colors.secondary);
                    grad.addColorStop(0.7, colors.primary);
                    grad.addColorStop(1, colors.highlight);
                } else {
                    grad.addColorStop(0, colors.core);
                    grad.addColorStop(0.6, colors.secondary);
                    grad.addColorStop(1, colors.primary);
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-layer.width * 0.7, -layer.radius, layer.width * 0.7, -layer.radius, 0, 0);
                ctx.fill();

                // Petal edge delicate highlight
                ctx.strokeStyle = 'rgba(255, 230, 240, 0.35)';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                ctx.restore();
            }
        });

        // Center spiral bud
        ctx.fillStyle = colors.core;
        ctx.beginPath();
        ctx.arc(0, 0, 6 * scale, 0, Math.PI * 2);
        ctx.fill();

        // Dew drop sparkle
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(10 * scale, -8 * scale, 2 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawPeony(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;

        // Fluffy ruffled petal clusters
        for (let layer = 0; layer < 4; layer++) {
            const count = 8 - layer;
            const radius = (38 - layer * 7) * scale * p;
            const step = (Math.PI * 2) / count;

            for (let i = 0; i < count; i++) {
                const angle = i * step + (layer * 0.5);
                ctx.save();
                ctx.rotate(angle);

                const grad = ctx.createLinearGradient(0, 0, 0, -radius);
                grad.addColorStop(0, colors.secondary);
                grad.addColorStop(0.6, colors.primary);
                grad.addColorStop(1, colors.highlight);
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(-radius * 0.4, -radius * 0.5, -radius * 0.3, -radius, 0, -radius);
                ctx.bezierCurveTo(radius * 0.3, -radius, radius * 0.4, -radius * 0.5, 0, 0);
                ctx.fill();

                ctx.restore();
            }
        }

        // Golden center stamens
        ctx.fillStyle = '#ffd166';
        for (let i = 0; i < 12; i++) {
            const a = (i / 12) * Math.PI * 2;
            const r = 5 * scale;
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.5 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawSunflower(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;

        // Two rings of vibrant golden ray petals
        const petalCount = 18;
        for (let r = 0; r < 2; r++) {
            const petalLen = (42 - r * 6) * scale * p;
            const offset = r * (Math.PI / petalCount);
            for (let i = 0; i < petalCount; i++) {
                const angle = (i * Math.PI * 2) / petalCount + offset;
                ctx.save();
                ctx.rotate(angle);

                const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
                grad.addColorStop(0, colors.secondary);
                grad.addColorStop(0.5, colors.primary);
                grad.addColorStop(1, colors.highlight);
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-9 * scale, -petalLen * 0.5, 0, -petalLen);
                ctx.quadraticCurveTo(9 * scale, -petalLen * 0.5, 0, 0);
                ctx.fill();

                ctx.restore();
            }
        }

        // Center Seed Disc (Fibonacci-styled disk)
        const discRadius = 18 * scale * p;
        const discGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, discRadius);
        discGrad.addColorStop(0, '#2b0900');
        discGrad.addColorStop(0.7, '#5c2c00');
        discGrad.addColorStop(1, '#8f4f00');
        ctx.fillStyle = discGrad;
        ctx.beginPath();
        ctx.arc(0, 0, discRadius, 0, Math.PI * 2);
        ctx.fill();

        // Seed Texture dots
        ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
        for (let i = 0; i < 28; i++) {
            const a = i * 2.399; // Golden angle
            const r = Math.sqrt(i / 28) * (discRadius * 0.85);
            ctx.beginPath();
            ctx.arc(Math.cos(a) * r, Math.sin(a) * r, 1.2 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawLavender(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;

        // Slender floral spike with clustered purple florets
        const tiers = 9;
        const spikeHeight = 65 * scale * p;

        for (let t = 0; t < tiers; t++) {
            const ty = -t * (spikeHeight / tiers);
            const floretScale = (1 - (t / tiers) * 0.4) * scale;
            const count = 5;

            for (let f = 0; f < count; f++) {
                const angle = (f / count) * Math.PI * 2;
                const fx = Math.cos(angle) * (10 * floretScale);
                const fy = ty + Math.sin(angle) * (3 * floretScale);

                ctx.save();
                ctx.translate(fx, fy);
                ctx.rotate(angle);

                const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 7 * floretScale);
                grad.addColorStop(0, colors.highlight);
                grad.addColorStop(0.5, colors.primary);
                grad.addColorStop(1, colors.secondary);
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.ellipse(0, 0, 6 * floretScale, 3.5 * floretScale, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }
    }

    drawSakura(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;

        // 5 Heart-notched delicate petals
        const petalCount = 5;
        const petalLen = 35 * scale * p;

        for (let i = 0; i < petalCount; i++) {
            const angle = (i * Math.PI * 2) / petalCount;
            ctx.save();
            ctx.rotate(angle);

            const grad = ctx.createLinearGradient(0, 0, 0, -petalLen);
            grad.addColorStop(0, colors.core);
            grad.addColorStop(0.3, colors.secondary);
            grad.addColorStop(0.8, colors.primary);
            grad.addColorStop(1, colors.highlight);
            ctx.fillStyle = grad;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(-14 * scale, -petalLen * 0.4, -16 * scale, -petalLen * 0.9, -6 * scale, -petalLen);
            ctx.lineTo(0, -petalLen * 0.85); // Notch
            ctx.lineTo(6 * scale, -petalLen);
            ctx.bezierCurveTo(16 * scale, -petalLen * 0.9, 14 * scale, -petalLen * 0.4, 0, 0);
            ctx.fill();

            ctx.restore();
        }

        // Center delicate pink & gold stamens
        ctx.strokeStyle = '#ffe5ec';
        ctx.lineWidth = 1.2;
        for (let s = 0; s < 10; s++) {
            const sa = (s / 10) * Math.PI * 2;
            const slen = 10 * scale;
            const sx = Math.cos(sa) * slen;
            const sy = Math.sin(sa) * slen;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(sx, sy);
            ctx.stroke();

            // Golden pollen tip
            ctx.fillStyle = '#ffb703';
            ctx.beginPath();
            ctx.arc(sx, sy, 1.8 * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawLotus(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;

        // Crystalline luminous lotus petals
        for (let layer = 0; layer < 3; layer++) {
            const count = 7 - layer;
            const radius = (40 - layer * 9) * scale * p;
            const step = (Math.PI * 2) / count;

            for (let i = 0; i < count; i++) {
                const angle = i * step + (layer * 0.4);
                ctx.save();
                ctx.rotate(angle);

                const grad = ctx.createLinearGradient(0, 0, 0, -radius);
                grad.addColorStop(0, colors.core);
                grad.addColorStop(0.4, colors.secondary);
                grad.addColorStop(0.8, colors.primary);
                grad.addColorStop(1, colors.highlight);
                ctx.fillStyle = grad;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(-15 * scale, -radius * 0.5, 0, -radius);
                ctx.quadraticCurveTo(15 * scale, -radius * 0.5, 0, 0);
                ctx.fill();

                ctx.restore();
            }
        }

        // Luminous glowing core
        const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 10 * scale);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.5, colors.primary);
        coreGrad.addColorStop(1, colors.core);
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, 0, 8 * scale, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTulip(flower, scale) {
        const ctx = this.ctx;
        const colors = flower.colorScheme;
        const p = flower.bloomProgress;
        const h = 44 * scale * p;
        const w = 26 * scale;

        ctx.save();

        // 3 Elegant overlapping cup petals
        // Back petals
        const backGrad = ctx.createLinearGradient(0, 0, 0, -h);
        backGrad.addColorStop(0, colors.core);
        backGrad.addColorStop(0.6, colors.secondary);
        backGrad.addColorStop(1, colors.primary);
        ctx.fillStyle = backGrad;

        ctx.beginPath();
        ctx.ellipse(-w * 0.4, -h * 0.5, w * 0.45, h * 0.45, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(w * 0.4, -h * 0.5, w * 0.45, h * 0.45, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Front central petal
        const frontGrad = ctx.createLinearGradient(0, 0, 0, -h);
        frontGrad.addColorStop(0, colors.secondary);
        frontGrad.addColorStop(0.5, colors.primary);
        frontGrad.addColorStop(1, colors.highlight);
        ctx.fillStyle = frontGrad;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(-w * 0.6, -h * 0.3, -w * 0.5, -h * 0.9, 0, -h);
        ctx.bezierCurveTo(w * 0.5, -h * 0.9, w * 0.6, -h * 0.3, 0, 0);
        ctx.fill();

        ctx.restore();
    }

    drawSparkles() {
        const ctx = this.ctx;
        this.sparkles.forEach(sp => {
            ctx.save();
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = sp.alpha;
            ctx.shadowColor = sp.color;
            ctx.shadowBlur = 8;

            // 4-point star sparkle shape
            ctx.translate(sp.x, sp.y);
            ctx.beginPath();
            ctx.moveTo(0, -sp.size);
            ctx.quadraticCurveTo(0, 0, sp.size, 0);
            ctx.quadraticCurveTo(0, 0, 0, sp.size);
            ctx.quadraticCurveTo(0, 0, -sp.size, 0);
            ctx.quadraticCurveTo(0, 0, 0, -sp.size);
            ctx.fill();

            ctx.restore();
        });
    }

    drawFloatingPetals() {
        const ctx = this.ctx;
        this.floatingPetals.forEach(petal => {
            ctx.save();
            ctx.translate(petal.x, petal.y);
            ctx.rotate(petal.rotation);
            ctx.fillStyle = petal.color;
            ctx.shadowColor = 'rgba(255, 182, 193, 0.4)';
            ctx.shadowBlur = 6;

            // Realistic curved petal silhouette
            ctx.beginPath();
            ctx.moveTo(0, -petal.size * 0.6);
            ctx.bezierCurveTo(petal.size * 0.6, -petal.size * 0.6, petal.size * 0.8, petal.size * 0.3, 0, petal.size * 0.6);
            ctx.bezierCurveTo(-petal.size * 0.8, petal.size * 0.3, -petal.size * 0.6, -petal.size * 0.6, 0, -petal.size * 0.6);
            ctx.fill();

            ctx.restore();
        });
    }

    animate() {
        this.update();
        this.render();
        requestAnimationFrame(this.animate);
    }
}

window.FlowerCanvasEngine = FlowerCanvasEngine;
