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

// BỘ LỌC TỰ PHỤC HỒI (Self-healing Filter)
// Nếu ảnh hỏng, tự động tìm ảnh khác đắp vào
async function getWorkingImage(targetId) {
    let attempts = 0;
    let currentId = targetId;
    
    // Thử tối đa 10 lần để tìm một bức ảnh lành lặn
    while (attempts < 10) { 
        const url = getImg(currentId);
        try {
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                // Nếu file lớn hơn 10 byte (không phải file rác) -> Thành công
                if (blob.size >= 10) {
                    return { safeUrl: URL.createObjectURL(blob), originalUrl: url };
                }
            }
        } catch (error) {}
        
        // Bốc ngẫu nhiên (random) một ảnh khác để thử lại
        currentId = Math.floor(Math.random() * TOTAL_IMAGES);
        attempts++;
    }
    
    // Phương án dự phòng (fallback) cuối cùng nếu 10 lần đều xịt
    return { safeUrl: 'https://picsum.photos/400?blur=2', originalUrl: null };
}

function preloadImages(startIndex, count) {
    for (let i = 0; i < count; i++) {
        fetch(getImg(startIndex + i)).catch(()=>{});
    }
}
window.onload = () => { preloadImages(0, 40); };

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
    if(num === 2) initStage2(); 
    if(num === 3) initStage3();
    if(num === 4) initStage4(); 
    if(num === 5) initStage5();
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
        openEnvelope();
    } else {
        errorMsg.innerText = "Sai rồi ngốc ạ! Thử lại xem nào."; document.getElementById('pwd-input').value = "";
    }
}

function openEnvelope() {
    isEnvOpen = true; document.getElementById('envelope').classList.add('open');
    setTimeout(() => { document.getElementById('env-wrapper').classList.add('zoom-out'); setTimeout(() => goToStage(2), 700); }, 400);
}

let stage2Inited = false;
function initStage2() {
    if(stage2Inited) return; stage2Inited = true;
    const container = document.getElementById('gallery-container');
    const nextBtnWrap = document.getElementById('next-btn-wrapper');
    
    container.removeChild(nextBtnWrap);

    for(let i = 0; i < 10; i++) {
        getWorkingImage(i).then(({safeUrl, originalUrl}) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            // Click vào ảnh sẽ hiện đúng ảnh đang xem
            const clickSrc = originalUrl ? originalUrl : safeUrl; 
            
            item.innerHTML = `
                <img src="${safeUrl}" class="gallery-img" loading="lazy" onclick="openLightbox('${clickSrc}')">
                <div class="gallery-caption">Kỷ niệm ${i + 1}</div>
            `;
            container.appendChild(item);
            setTimeout(() => { item.classList.add('show'); }, 150 * i);
        });
    }
    
    container.appendChild(nextBtnWrap);
    setTimeout(() => { document.getElementById('btn-next-2').classList.add('show'); }, 1500);
}

let stage3Inited = false; let camera3D, renderer3D;
function initStage3() {
    if(stage3Inited) return; stage3Inited = true;
    const container = document.getElementById('webgl-container');
    const scene = new THREE.Scene(); 
    
    camera3D = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100); 
    camera3D.position.z = 6.5; 
    
    renderer3D = new THREE.WebGLRenderer({ antialias: true, alpha: true }); 
    renderer3D.setPixelRatio(window.devicePixelRatio); 
    renderer3D.setSize(window.innerWidth, window.innerHeight); 
    container.appendChild(renderer3D.domElement);
    
    window.addEventListener('resize', () => {
        if(camera3D && renderer3D && document.getElementById('stage-3').classList.contains('active')) {
            camera3D.aspect = window.innerWidth / window.innerHeight;
            camera3D.updateProjectionMatrix();
            renderer3D.setSize(window.innerWidth, window.innerHeight);
        }
    });
    
    const sphereGroup = new THREE.Group(); 
    scene.add(sphereGroup); 
    const imageMeshes = [];
    
    let imageCounter = 10; 
    const textureLoader = new THREE.TextureLoader(); 
    const placeholderMat = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });

    for(let i = 0; i < 9; i++) {
        const thetaStart = i * (Math.PI / 9); const thetaLength = Math.PI / 9; const thetaMid = thetaStart + thetaLength / 2;
        const N = Math.max(4, Math.round(14 * Math.sin(thetaMid))); 
        
        for(let j = 0; j < N; j++) {
            const phiStart = j * (2 * Math.PI / N); const phiLength = 2 * Math.PI / N;
            const gap = 0.05;
            const geo = new THREE.SphereGeometry(3, 4, 4, phiStart + gap/2, phiLength - gap, thetaStart + gap/2, thetaLength - gap);
            
            const mesh = new THREE.Mesh(geo, placeholderMat.clone());
            mesh.userData.imgId = imageCounter++; // Lưu lại ID để tìm ảnh
            
            sphereGroup.add(mesh); imageMeshes.push(mesh);
        }
    }

    let loadIndex = 0;
    function loadNextImage() {
        if (loadIndex >= imageMeshes.length) return;
        const mesh = imageMeshes[loadIndex++];
        
        // Gọi bộ lọc tự động trám ảnh
        getWorkingImage(mesh.userData.imgId).then(({safeUrl, originalUrl}) => {
            textureLoader.load(safeUrl, 
                (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    mesh.material.color.setHex(0xffffff); 
                    mesh.material.map = texture;
                    mesh.material.needsUpdate = true;
                    if (originalUrl) mesh.userData.src = originalUrl;
                    setTimeout(loadNextImage, 0);
                },
                undefined,
                () => { setTimeout(loadNextImage, 0); } 
            );
        });
    }
    
    for(let k = 0; k < 8; k++) { loadNextImage(); }

    let isDragging = false; 
    let startXY = {x: 0, y: 0}, lastXY = {x: 0, y: 0}; 
    let initialDistance = 0;
    const activePointers = {};
    const raycaster = new THREE.Raycaster(); 
    const mouse = new THREE.Vector2();

    container.addEventListener('pointerdown', (e) => { 
        activePointers[e.pointerId] = e;
        const keys = Object.keys(activePointers);
        if (keys.length === 1) {
            isDragging = true; 
            startXY = { x: e.clientX, y: e.clientY };
            lastXY = { x: e.clientX, y: e.clientY }; 
        }
    });

    container.addEventListener('pointermove', (e) => {
        if (!document.getElementById('stage-3').classList.contains('active')) return;
        activePointers[e.pointerId] = e;
        const keys = Object.keys(activePointers);
        
        if (keys.length === 1 && isDragging) {
            sphereGroup.rotation.y += (e.clientX - lastXY.x) * 0.005; 
            sphereGroup.rotation.x += (e.clientY - lastXY.y) * 0.005; 
            lastXY = { x: e.clientX, y: e.clientY };
        } else if (keys.length === 2) {
            const p1 = activePointers[keys[0]];
            const p2 = activePointers[keys[1]];
            const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
            if (initialDistance > 0) {
                camera3D.position.z += (initialDistance - dist) * 0.015;
                camera3D.position.z = Math.max(3.5, Math.min(camera3D.position.z, 12));
            }
            initialDistance = dist;
        }
    });

    function onPointerUp(e) {
        delete activePointers[e.pointerId];
        const keys = Object.keys(activePointers);
        if (keys.length < 2) initialDistance = 0;
        if (keys.length === 0) {
            isDragging = false;
            if (e.type === 'pointerup') {
                const dx = e.clientX - startXY.x; 
                const dy = e.clientY - startXY.y;
                if(Math.hypot(dx, dy) < 5) {
                    mouse.x = (e.clientX / window.innerWidth) * 2 - 1; mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
                    raycaster.setFromCamera(mouse, camera3D); const intersects = raycaster.intersectObjects(imageMeshes);
                    if(intersects.length > 0 && intersects[0].object.visible && intersects[0].object.userData.src) {
                        openLightbox(intersects[0].object.userData.src);
                    }
                }
            }
        }
    }
    
    container.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointercancel', onPointerUp);

    window.addEventListener('wheel', (e) => {
        if (!document.getElementById('stage-3').classList.contains('active')) return;
        camera3D.position.z += e.deltaY * 0.005; camera3D.position.z = Math.max(3.5, Math.min(camera3D.position.z, 12));
    });
    
    function animate() { 
        requestAnimationFrame(animate); 
        if(!isDragging) sphereGroup.rotation.y += 0.001; 
        try { renderer3D.render(scene, camera3D); } catch(e) {}
    } 
    animate();
    
    setTimeout(() => document.getElementById('btn-next-3').classList.add('show'), 4000);
}

let stage4Inited = false;
function initStage4() {
    if(stage4Inited) return; stage4Inited = true;
    let imgCount = 50; 
    
    for(let row=1; row<=3; row++) {
        const contents = document.getElementById(`marquee-row-${row}`).querySelectorAll('.marquee-content'); 
        
        for(let i=0; i<6; i++) { 
            const currentId = imgCount++;
            getWorkingImage(currentId).then(({safeUrl, originalUrl}) => {
                const clickSrc = originalUrl ? originalUrl : safeUrl;
                const imgHtml = `<img src="${safeUrl}" loading="lazy" onclick="openLightbox('${clickSrc}')">`; 
                contents[0].innerHTML += imgHtml; 
                contents[1].innerHTML += imgHtml;
            });
        }
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
