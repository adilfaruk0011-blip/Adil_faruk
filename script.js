// ===== SMOOTH SCROLL NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== HIGHLIGHT ACTIVE NAVIGATION LINK =====
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== MOBILE MENU TOGGLE =====
const navMenu = document.querySelector('nav ul');
const navLinks = document.querySelectorAll('nav ul li a');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navMenu) {
            navMenu.style.display = 'none';
            setTimeout(() => {
                navMenu.style.display = 'flex';
            }, 100);
        }
    });
});

// ===== FLIP CARD INTERACTION =====
const flipCards = document.querySelectorAll('.flip-card');
flipCards.forEach(card => {
    card.addEventListener('click', function () {
        this.style.transform = this.style.transform === 'rotateY(180deg)' ? 'none' : 'rotateY(180deg)';
    });
});

// ===== SCROLL REVEAL ANIMATION =====
// Ye observer detect karega ki kaunsa element screen par aa gaya hai
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show-element');
        } else {
            // Agar wapas upar scroll karein toh element wapas chup jaye (optional)
            // entry.target.classList.remove('show-element');
        }
    });
});

// Saare hidden elements ko observe karna shuru karo
const hiddenElements = document.querySelectorAll('.hidden-element');
hiddenElements.forEach((el) => observer.observe(el));

// ===== UPDATED AMBIENT CANVAS ANIMATION (Tree & Leaves Source Logic) =====

window.addEventListener('load', function() {
    const canvas = document.getElementById('ambientCanvas');
    const ctx = canvas.getContext('2d');

    // Canvas size setup (responsive)
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Static Tree Image Setup
    const treeImage = new Image();
    treeImage.src = 'image/dry_tree.png'; // PNG image loaded
    let treeLoaded = false;
    treeImage.onload = () => { treeLoaded = true; };

    // Tree Dimensions state (Patton ke spawning ke liye zaroori)
    let treeData = { x: 0, y: 0, width: 0, height: 0 };

    // Leaf Particle Setup
    const leaves = [];
    const numberOfLeaves = 40; // Performance tuning
    const leafColor = 'rgba(0, 0, 0, 0.5)'; // Black leaves with 50% transparency

    class Leaf {
        constructor() {
            // First time spawn logic default rakhein, fir reset mein complex karenge
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.init(true); // Initial load true
        }

        // Reset function: Patte ko wapas ped ki branches par bhejna
        init(initialLoad = false) {
            this.size = Math.random() * 4 + 1.5; // Thoda chota patta
            
            // Physics: Downward fall + swaying
            this.speedY = Math.random() * 1.2 + 0.6; 
            this.speedX = Math.random() * 0.8 - 0.4; // Hawa ka effect
            
            // Rotation
            this.angle = Math.random() * Math.PI * 2;
            this.spin = Math.random() * 0.08 - 0.04;

            // --- NAYA SPAWNING LOGIC (Leaves coming FROM the tree) ---
            if (treeLoaded && treeData.width > 0 && !initialLoad) {
                // Agar ped load ho gaya hai, toh patton ko uske bounding box ke andar spawn karein.
                // branches usually ped ke upper 60% hisse mein hoti hain.
                this.x = treeData.x + (Math.random() * treeData.width * 0.8) + (treeData.width * 0.1); 
                this.y = treeData.y + (Math.random() * treeData.height * 0.5); // Top 50% of tree height
            } else if (initialLoad) {
                // Initial load par random positions rakhein taki screen khali na lage start mein
                this.y = (Math.random() * canvas.height * -1) - 20; 
                this.x = Math.random() * canvas.width;
            } else {
                // Fallback agar image load na ho
                this.y = (Math.random() * canvas.height * -1) - 20; 
                this.x = Math.random() * canvas.width;
            }
        }

        update() {
            this.y += this.speedY;
            this.x += this.speedX;
            this.angle += this.spin;

            // Agar patta screen se niche chala jaye, reset karein (Ped par wapas bhejien)
            if (this.y > canvas.height + 20) {
                this.init(false);
            }
            // Screen sides wrapping
            if (this.x > canvas.width + 10) this.x = -10;
            if (this.x < -10) this.x = canvas.width + 10;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);
            ctx.fillStyle = leafColor;
            ctx.beginPath();
            // Simple Leaf Shape
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(this.size, this.size, this.size, this.size * 2, 0, this.size * 3);
            ctx.bezierCurveTo(-this.size, this.size * 2, -this.size, this.size, 0, 0);
            ctx.fill();
            ctx.restore();
        }
    }

    // Initialize particle array
    for (let i = 0; i < numberOfLeaves; i++) {
        leaves.push(new Leaf());
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); 

        // 1. Sukha Ped Draw Karein (Naya robust logic)
        if (treeLoaded) {
            // Sizing calculation based on SVG natural dimensions if available, else fallback
            let treeNaturalWidth = treeImage.naturalWidth || treeImage.width || 200;
            let treeNaturalHeight = treeImage.naturalHeight || treeImage.height || 300;
            let aspectRatio = treeNaturalHeight / treeNaturalWidth;

            // Responsive Tree Width (40% screen width, max 400px)
            const treeWidth = Math.min(canvas.width * 0.4, 400); 
            const treeHeight = treeWidth * aspectRatio;

            // Position: Bottom-Right corner
            const treeX = canvas.width - treeWidth - 20; // 20px padding side se
            const treeY = canvas.height - treeHeight - 20; // 20px padding niche se

            // State update karein taki Leaves reset function ise access kar sake
            treeData.x = treeX;
            treeData.y = treeY;
            treeData.width = treeWidth;
            treeData.height = treeHeight;

            ctx.globalAlpha = 0.5; // Transparency badha di hai visibility ke liye (Pehle 0.3 thi)
            ctx.drawImage(treeImage, treeX, treeY, treeWidth, treeHeight);
            ctx.globalAlpha = 1.0; 
        }

        // 2. Patte Update aur Draw Karein
        leaves.forEach(leaf => {
            leaf.update();
            leaf.draw();
        });

        requestAnimationFrame(animate); 
    }

    animate();
});
