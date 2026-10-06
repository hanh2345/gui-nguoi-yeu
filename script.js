const TOTAL_IMAGES = 90; 
let shuffledImages = [];
for (let i = 1; i <= TOTAL_IMAGES; i++) shuffledImages.push(i);
for (let i = shuffledImages.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledImages[i], shuffledImages[j]] = [shuffledImages[j], shuffledImages[i]];
}

function getImg(id) { 
    const imgNumber = shuffledImages[id % TOTAL_IMAGES];
    return `images/1(${imgNumber}).jpg`; 
}

function preloadImages(startIndex, count) {
    for (let i = 0; i < count; i++) {
        const img = new Image();
        img.src = getImg(startIndex + i);
    }
}

function initParticles() {
    const container = document.getElementById('particles-container');
    const symbols = ['♥', '✧', '★', '。'];
    for(let i=0; i<80; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.left = Math.random() * 100 + 'vw';
        p.style.fontSize = (Math.random() * 15 + 10) + 'px';
        p.style.animationDuration = (Math.random() * 8 + 6) + 's';
        p.style.animationDelay = '-' + (Math.random() * 15) + 's'; 
        if(p.textContent === '♥') p.style.color = '#ff4d6d';
        container.appendChild(p);
    }
}
initParticles();

function openLightbox(src) { document.getElementById('lightbox-img').src = src; document.getElementById('lightbox').classList.add('active'); }
function closeLightbox(e) { if(e.target.id === 'lightbox' || e.target.tagName === 'IMG') { document.getElementById('lightbox').classList.remove('active'); } }

function goToStage(num) {
    document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
    document.getElementById(`stage-${num}`).classList.add('active');
    if(num === 2) initStage2(); if(num === 3) initStage3();
    if(num === 4) initStage4(); if(num === 5) initStage5();
}

const audio = document.getElementById('bgMusic');
const musicBtn = document.getElementById('music-btn');
let isPlaying = false;
function toggleMusic() {
    if (isPlaying) { audio.pause(); musicBtn.classList.remove('playing'); musicBtn.classList.add('muted'); } 
    else { audio.play(); musicBtn.classList.add('playing'); musicBtn.classList.remove('muted'); }
    isPlaying = !isPlaying;
}

let isEnvOpen = false;
function requirePassword() {
    if(isEnvOpen) return;
    document.getElementById('password-modal').classList.add('active'); document.getElementById('pwd-input').focus();
}
document.getElementById('pwd-input').addEventListener('keypress', function(e) { if (e.key === 'Enter') checkPassword(); });

function checkPassword() {
    const input = document.getElementById('pwd-input').value.trim();
    const errorMsg = document.getElementById('pwd-error');
    const CORRECT_PASSWORD = "1210"; 
    
    if (input === CORRECT_PASSWORD) {
        document.getElementById('password-modal').classList.remove('active');
        audio.play().then(() => { isPlaying = true; musicBtn.classList.add('show', 'playing'); }).catch(e => console.log("Audio play blocked", e));
        
        preloadImages(0, 30); 
        openEnvelope();
    } else {
        errorMsg.innerText = "Sai rồi ngốc ạ! Thử lại xem nào."; document.getElementById('pwd-input').value = "";
    }
}

function openEnvelope() {
    isEnvOpen = true; document.getElementById('envelope').classList.add('open');
    setTimeout(() => { document.getElementById('env-wrapper').classList.add('zoom-out'); setTimeout(() => goToStage(2), 700); }, 400);
}

let stage2Inited = false; let currentPage = 0; const totalPages = 6; 
function initStage2() {
    if(stage2Inited) return; stage2Inited = true;
    const book = document.getElementById('book');
    for(let i = 0; i < totalPages; i++) {
        const page = document.createElement('div'); page.className = 'page'; page.style.zIndex = totalPages - i;
        const frontSrc = getImg(i*2); const backSrc = getImg(i*2 + 1);
        
        let capFront = i === 0 ? "Trang Bìa" : (i === totalPages - 1 ? "Kỷ niệm 10" : `Kỷ niệm ${i*2}`);
        let capBack = i === totalPages - 1 ? "Bìa Sau" : `Kỷ niệm ${i*2 + 1}`;

        page.innerHTML = `
            <div class="front" onclick="flipPage(${i}, true)">
                <img src="${frontSrc}" class="page-img" decoding="async" onerror="this.onerror=null; this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='">
                <div class="page-caption">${capFront}</div><div class="page-hint">Nhấp để lật ➔</div>
            </div>
            <div class="back" onclick="flipPage(${i}, false)">
                <img src="${backSrc}" class="page-img" decoding="async" onerror="this.onerror=null; this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='">
                <div class="page-caption">${capBack}</div><div class="page-hint"> ⬅ Nhấp để quay lại</div>
            </div>`;
        book.appendChild(page);
    }
    const pages = document.querySelectorAll('.page');
    if(pages.length > 0) {
        book.classList.add('is-open'); pages[0].style.transition = 'none'; pages[0].classList.add('flipped');
        pages[0].style.zIndex = 1; currentPage = 1; setTimeout(() => { pages[0].style.transition = ''; }, 100);
    }
    setTimeout(() => { document.getElementById('book-anim-container').classList.add('slide-in'); }, 100);
}

function flipPage(index, forward) {
    if (!forward && index === 0) return; if (forward && index === totalPages - 1) return;
    const pages = document.querySelectorAll('.page'); const bookWrap = document.getElementById('book');
    
    if(forward) {
        pages[index].classList.add('flipped'); 
        setTimeout(() => { pages[index].style.zIndex = index + 1; }, 450); 
        currentPage++; bookWrap.classList.add('is-open'); 
        if(currentPage === totalPages - 1) document.getElementById('btn-next-2').classList.add('show');
    } else {
        pages[index].style.zIndex = totalPages - index; 
        pages[index].classList.remove('flipped'); currentPage--; 
    }
}

let stage3Inited = false; let camera3D;
function initStage3() {
    if(stage3Inited) return; stage3Inited = true;
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene(); camera3D = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100); camera3D.position.z = 6.5; 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); renderer.setSize(window.innerWidth, window.innerHeight); container.appendChild(renderer.domElement);
    const sphereGroup = new THREE.Group(); scene.add(sphereGroup); const imageMeshes = [];
    
    let imageCounter = 12; 
    const loadQueue = []; 

    for(let i = 0; i < 16; i++) {
        const thetaStart = i * (Math.PI / 16); const thetaLength = Math.PI / 16; const thetaMid = thetaStart + thetaLength / 2;
        const N = Math.max(4, Math.round(30 * Math.sin(thetaMid))); 
        
        for(let j = 0; j < N; j++) {
            const phiStart = j * (2 * Math.PI / N); const phiLength = 2 * Math.PI / N;
            const geo = new THREE.SphereGeometry(3, 8, 8, phiStart, phiLength, thetaStart, thetaLength);
            
            const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
            const ctx = canvas.getContext('2d'); ctx.fillStyle = '#0f0c16'; ctx.fillRect(0,0,256,256);
            ctx.strokeStyle = '#000000'; ctx.lineWidth = 14; ctx.strokeRect(0,0,256,256);
            
            const tex = new THREE.CanvasTexture(canvas); 
            tex.generateMipmaps = false; 
            tex.minFilter = THREE.LinearFilter;
            
            const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide }); const mesh = new THREE.Mesh(geo, mat);
            
            const currentImgSrc = getImg(imageCounter++);
            mesh.userData.src = currentImgSrc; 

            // Luôn thêm ảnh vào hàng đợi
            loadQueue.push({ ctx, tex, src: currentImgSrc });
            
            sphereGroup.add(mesh); imageMeshes.push(mesh);
        }
    }

    if (loadQueue.length > 0) {
        for (let i = loadQueue.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [loadQueue[i], loadQueue[j]] = [loadQueue[j], loadQueue[i]];
        }

        let qIdx = 0;
        function processQueue() {
            if (qIdx >= loadQueue.length) return;
            const item = loadQueue[qIdx++];
            
            const img = new Image();
            img.decoding = "async"; 
            img.onload = () => {
                try { item.ctx.drawImage(img, 7, 7, 242, 242); item.tex.needsUpdate = true; } catch(e) {}
                setTimeout(processQueue, 15); 
            };
            img.onerror = () => {
                item.ctx.fillStyle = '#222'; item.ctx.fillRect(7, 7, 242, 242); item.tex.needsUpdate = true;
                setTimeout(processQueue, 15);
            };
            img.src = item.src;
        }
        
        setTimeout(processQueue, 0); setTimeout(processQueue, 100); setTimeout(processQueue, 200);
    }

    let isDragging = false; let startXY = {x: 0, y: 0}, lastXY = {x: 0, y: 0}; const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
    container.addEventListener('pointerdown', (e) => { isDragging = true; startXY = { x: e.clientX, y: e.clientY }; lastXY = { x: e.clientX, y: e.clientY }; });
    window.addEventListener('pointermove', (e) => {
        if(!isDragging || !document.getElementById('stage-3').classList.contains('active')) return;
        sphereGroup.rotation.y += (e.clientX - lastXY.x) * 0.005; sphereGroup.rotation.x += (e.clientY - lastXY.y) * 0.005; lastXY = { x: e.clientX, y: e.clientY };
    });
    window.addEventListener('pointerup', (e) => {
        isDragging = false; if (!document.getElementById('stage-3').classList.contains('active')) return;
        if(Math.hypot(e.clientX - startXY.x, e.clientY - startXY.y) < 5) {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera3D); const intersects = raycaster.intersectObjects(imageMeshes);
            if(intersects.length > 0 && intersects[0].object.userData.src) openLightbox(intersects[0].object.userData.src);
        }
    });
    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('stage-3').classList.contains('active')) return;
        camera3D.position.z += e.deltaY * 0.005; camera3D.position.z = Math.max(3.5, Math.min(camera3D.position.z, 12));
    });
    let initialDistance = 0;
    window.addEventListener('touchstart', (e) => {
        if (!document.getElementById('stage-3').classList.contains('active')) return;
        if (e.touches.length === 2) initialDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
    });
    window.addEventListener('touchmove', (e) => {
        if (!document.getElementById('stage-3').classList.contains('active')) return;
        if (e.touches.length === 2 && initialDistance > 0) {
            let currentDistance = Math.hypot(e.touches[0].pageX - e.touches[1].pageX, e.touches[0].pageY - e.touches[1].pageY);
            camera3D.position.z += (initialDistance - currentDistance) * 0.02; camera3D.position.z = Math.max(3.5, Math.min(camera3D.position.z, 12));
            initialDistance = currentDistance;
        }
    });
    function animate() { requestAnimationFrame(animate); if(!isDragging) sphereGroup.rotation.y += 0.001; renderer.render(scene, camera3D); } animate();
    setTimeout(() => document.getElementById('btn-next-3').classList.add('show'), 4000);
}

let stage4Inited = false;
function initStage4() {
    if(stage4Inited) return; stage4Inited = true;
    let imgCount = 300; 
    for(let row=1; row<=3; row++) {
        const wrapper = document.getElementById(`marquee-row-${row}`); const contents = wrapper.querySelectorAll('.marquee-content'); let imgs = '';
        for(let i=0; i<8; i++) { 
            const src = getImg(imgCount++); 
            imgs += `<img src="${src}" loading="lazy" decoding="async" onclick="openLightbox('${src}')" onerror="this.style.display='none'">`; 
        }
        contents[0].innerHTML = imgs; contents[1].innerHTML = imgs;
    }
}

let stage5Inited = false;
function initStage5() {
    if (stage5Inited) return; stage5Inited = true;
    const canvas = document.getElementById('heartCanvas'); const ctx = canvas.getContext('2d'); const particles = [];
    for(let i = 0; i < 700; i++) {
        let t = Math.PI * 2 * Math.random(); let r = Math.sqrt(Math.random()); if (Math.random() > 0.4) r = 1 - (Math.random() * 0.1); 
        let hx = 16 * Math.pow(Math.sin(t), 3); let hy = 13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t);
        particles.push({ x: hx * r, y: -hy * r, size: Math.random() * 2 + 1, angle: Math.random() * Math.PI * 2, speed: Math.random() * 0.02 + 0.01, color: Math.random() > 0.3 ? '#ff4d6d' : '#ffb3c6' });
    }
    function drawHeart() {
        if(!document.getElementById('stage-5').classList.contains('active')) { requestAnimationFrame(drawHeart); return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.translate(canvas.width/2, canvas.height/2 - 50); let scaleFactor = 22; 
        particles.forEach(p => {
            p.angle += p.speed; ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc((p.x + Math.cos(p.angle)) * scaleFactor, (p.y + Math.sin(p.angle)) * scaleFactor, p.size, 0, Math.PI*2); ctx.fill();
        });
        ctx.restore(); requestAnimationFrame(drawHeart);
    }
    drawHeart();
}
