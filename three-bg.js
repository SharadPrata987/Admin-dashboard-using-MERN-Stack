/**
 * NEXUS ADMIN - Enhanced Three.js 3D Background v2.0
 * Galaxy particles + Wave mesh + Glowing orbs + Shooting stars + Mouse parallax
 */
(function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, 100);

    const clock = new THREE.Clock();
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const getThemeColor = () => {
        const hex = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#4f46e5';
        return new THREE.Color(hex);
    };

    const lerp = (a, b, t) => a + (b - a) * t;

    // ── 1. STARFIELD (3 layers) ──────────────────────────────────
    const starLayers = [];
    [800, 400, 200].forEach((count, li) => {
        const geo = new THREE.BufferGeometry();
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i*3]   = (Math.random() - 0.5) * (600 - li * 150);
            pos[i*3+1] = (Math.random() - 0.5) * (400 - li * 80);
            pos[i*3+2] = -200 + li * 60 - Math.random() * 100;
        }
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({
            color: li === 2 ? getThemeColor() : 0xffffff,
            size: 0.4 + li * 0.3,
            transparent: true,
            opacity: 0.3 + li * 0.2,
            depthWrite: false,
        });
        const stars = new THREE.Points(geo, mat);
        scene.add(stars);
        starLayers.push({ mesh: stars, speed: 0.0005 + li * 0.0003, mat });
    });

    // ── 2. SPIRAL GALAXY (3000 particles) ───────────────────────
    const GALAXY_N = 3000;
    const gPos = new Float32Array(GALAXY_N * 3);
    const gCol = new Float32Array(GALAXY_N * 3);
    const cA = new THREE.Color(), cB = new THREE.Color(0xc084fc);

    for (let i = 0; i < GALAXY_N; i++) {
        const r = Math.random() * 200 + 5;
        const arm = (i % 4) / 4 * Math.PI * 2;
        const spin = r * 0.25;
        const rx = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 12;
        const ry = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 4;
        const rz = Math.pow(Math.random(), 3) * (Math.random() < 0.5 ? 1 : -1) * 6;
        gPos[i*3]   = Math.cos(arm + spin) * r + rx;
        gPos[i*3+1] = ry;
        gPos[i*3+2] = Math.sin(arm + spin) * r * 0.35 + rz - 120;
        cA.copy(getThemeColor()).lerp(cB, r / 200);
        gCol[i*3] = cA.r; gCol[i*3+1] = cA.g; gCol[i*3+2] = cA.b;
    }
    const galaxyGeo = new THREE.BufferGeometry();
    galaxyGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    galaxyGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
    const galaxyMat = new THREE.PointsMaterial({ size: 0.7, vertexColors: true, transparent: true, opacity: 0.9, depthWrite: false });
    const galaxy = new THREE.Points(galaxyGeo, galaxyMat);
    scene.add(galaxy);

    // ── 3. DNA DOUBLE HELIX ──────────────────────────────────────
    const dnaGroup = new THREE.Group();
    const DNA_POINTS = 120;
    const strand1Pos = [], strand2Pos = [];

    for (let i = 0; i < DNA_POINTS; i++) {
        const t = (i / DNA_POINTS) * Math.PI * 8;
        const y = (i / DNA_POINTS) * 160 - 80;
        const r = 8;
        strand1Pos.push(new THREE.Vector3(Math.cos(t) * r, y, Math.sin(t) * r));
        strand2Pos.push(new THREE.Vector3(Math.cos(t + Math.PI) * r, y, Math.sin(t + Math.PI) * r));
    }

    [strand1Pos, strand2Pos].forEach((pts, si) => {
        const curve = new THREE.CatmullRomCurve3(pts);
        const tubeGeo = new THREE.TubeGeometry(curve, 200, 0.25, 6, false);
        const tubeMat = new THREE.MeshBasicMaterial({
            color: si === 0 ? getThemeColor() : new THREE.Color(0x818cf8),
            transparent: true, opacity: 0.6,
        });
        dnaGroup.add(new THREE.Mesh(tubeGeo, tubeMat));
    });

    for (let i = 0; i < DNA_POINTS; i += 4) {
        const rungGeo = new THREE.BufferGeometry().setFromPoints([strand1Pos[i], strand2Pos[i]]);
        dnaGroup.add(new THREE.LineSegments(rungGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })));
        [strand1Pos[i], strand2Pos[i]].forEach((pos, ni) => {
            const sphere = new THREE.Mesh(
                new THREE.SphereGeometry(0.6, 8, 8),
                new THREE.MeshBasicMaterial({ color: ni === 0 ? getThemeColor() : 0xc084fc, transparent: true, opacity: 0.8 })
            );
            sphere.position.copy(pos);
            dnaGroup.add(sphere);
        });
    }

    dnaGroup.position.set(-90, 0, -10);
    dnaGroup.rotation.z = 0.3;
    scene.add(dnaGroup);

    // ── 4. AURORA WAVES ──────────────────────────────────────────
    const auroraGroup = new THREE.Group();
    for (let l = 0; l < 5; l++) {
        const geo = new THREE.PlaneGeometry(300, 40, 40, 1);
        const colors = new Float32Array((41) * (2) * 3);
        const baseColor = getThemeColor();
        for (let i = 0; i < colors.length / 3; i++) {
            const c = new THREE.Color().copy(baseColor).lerp(new THREE.Color(0x00ffcc), i / (colors.length / 3));
            colors[i*3] = c.r; colors[i*3+1] = c.g; colors[i*3+2] = c.b;
        }
        geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        const mat = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.04 + l * 0.01, side: THREE.DoubleSide, depthWrite: false });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(0, 60 - l * 8, -80 - l * 15);
        mesh.rotation.x = -0.3 + l * 0.05;
        mesh.userData = { layer: l, baseY: 60 - l * 8 };
        auroraGroup.add(mesh);
    }
    scene.add(auroraGroup);

    // ── 5. WORMHOLE RINGS ────────────────────────────────────────
    const wormholeGroup = new THREE.Group();
    for (let i = 0; i < 20; i++) {
        const geo = new THREE.TorusGeometry(15 + i * 1.5, 0.15, 6, 80);
        const mat = new THREE.MeshBasicMaterial({ color: getThemeColor(), transparent: true, opacity: (1 - i / 20) * 0.25, depthWrite: false });
        wormholeGroup.add(new THREE.Mesh(geo, mat));
    }
    wormholeGroup.position.set(80, -10, -40);
    wormholeGroup.rotation.y = 0.5;
    scene.add(wormholeGroup);

    // ── 6. NEURAL NETWORK PARTICLES ──────────────────────────────
    const NN_COUNT = 180;
    const nnPos = new Float32Array(NN_COUNT * 3);
    const nnVel = [];
    for (let i = 0; i < NN_COUNT; i++) {
        nnPos[i*3]   = (Math.random() - 0.5) * 240;
        nnPos[i*3+1] = (Math.random() - 0.5) * 140;
        nnPos[i*3+2] = (Math.random() - 0.5) * 50;
        nnVel.push({ x: (Math.random()-0.5)*0.06, y: (Math.random()-0.5)*0.06, z: (Math.random()-0.5)*0.02 });
    }
    const nnGeo = new THREE.BufferGeometry();
    nnGeo.setAttribute('position', new THREE.BufferAttribute(nnPos, 3));
    const nnMat = new THREE.PointsMaterial({ color: getThemeColor(), size: 1.4, transparent: true, opacity: 0.85, depthWrite: false });
    scene.add(new THREE.Points(nnGeo, nnMat));

    const MAX_CONN = 400;
    const connPos = new Float32Array(MAX_CONN * 6);
    const connGeo = new THREE.BufferGeometry();
    connGeo.setAttribute('position', new THREE.BufferAttribute(connPos, 3));
    const connMat = new THREE.LineBasicMaterial({ color: getThemeColor(), transparent: true, opacity: 0.18, depthWrite: false });
    const connMesh = new THREE.LineSegments(connGeo, connMat);
    scene.add(connMesh);

    // ── 7. WIREFRAME SHAPES ──────────────────────────────────────
    const shapes = [];
    [
        { g: new THREE.OctahedronGeometry(7),    p: [-65, 30, -15] },
        { g: new THREE.IcosahedronGeometry(6),   p: [70, -25, -25] },
        { g: new THREE.TetrahedronGeometry(8),   p: [25, -50, -10] },
        { g: new THREE.TorusGeometry(7, 1.8, 8, 32), p: [-35, 45, -20] },
        { g: new THREE.OctahedronGeometry(5),    p: [55, 40, -8]  },
        { g: new THREE.IcosahedronGeometry(4),   p: [-55, -40, -18] },
        { g: new THREE.TorusGeometry(5, 1.2, 6, 24), p: [0, 55, -30] },
    ].forEach(cfg => {
        const mat = new THREE.MeshBasicMaterial({ color: getThemeColor(), wireframe: true, transparent: true, opacity: 0.18 });
        const mesh = new THREE.Mesh(cfg.g, mat);
        mesh.position.set(...cfg.p);
        mesh.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, 0);
        mesh.userData = { rx: (Math.random()-0.5)*0.006, ry: (Math.random()-0.5)*0.006, baseY: cfg.p[1], fs: Math.random()*0.4+0.2, fa: Math.random()*3+1 };
        scene.add(mesh);
        shapes.push(mesh);
    });

    // ── 8. SHOOTING STARS ────────────────────────────────────────
    const shooters = [];
    function spawnStar() {
        const len = Math.random() * 25 + 12;
        const sx = (Math.random()-0.5)*200, sy = Math.random()*70+20, sz = (Math.random()-0.5)*30;
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([sx,sy,sz, sx-len,sy-len*0.3,sz]), 3));
        const s = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 }));
        s.userData = { vx: -(Math.random()*2.5+1.5), vy: -(Math.random()*0.8+0.3), life: 1 };
        scene.add(s);
        shooters.push(s);
    }
    setInterval(spawnStar, 1800);

    // ── 9. WAVE GRID ─────────────────────────────────────────────
    const waveGeo = new THREE.PlaneGeometry(280, 150, 40, 25);
    const waveMat = new THREE.MeshBasicMaterial({ color: getThemeColor(), wireframe: true, transparent: true, opacity: 0.05 });
    const wave = new THREE.Mesh(waveGeo, waveMat);
    wave.rotation.x = -Math.PI / 2.8;
    wave.position.set(0, -55, -50);
    scene.add(wave);

    // ── 10. GLOWING ORBS ─────────────────────────────────────────
    const orbs = [];
    [[-60,30,-30,14,0.3],[70,-20,-50,18,0.2],[10,50,-60,9,0.5],[-80,-40,-40,12,0.25],[50,40,-20,10,0.4]].forEach(([x,y,z,r,sp]) => {
        const orb = new THREE.Mesh(
            new THREE.SphereGeometry(r, 32, 32),
            new THREE.MeshBasicMaterial({ color: getThemeColor(), transparent: true, opacity: 0.05, depthWrite: false })
        );
        orb.position.set(x, y, z);
        orb.userData = { baseY: y, sp };
        for (let ri = 1; ri <= 3; ri++) {
            const ring = new THREE.Mesh(
                new THREE.RingGeometry(r + ri*2, r + ri*2 + 1.5, 64),
                new THREE.MeshBasicMaterial({ color: getThemeColor(), transparent: true, opacity: 0.04 / ri, side: THREE.DoubleSide, depthWrite: false })
            );
            ring.rotation.x = Math.random() * Math.PI;
            orb.add(ring);
        }
        scene.add(orb);
        orbs.push(orb);
    });

    // ── Mouse & Resize ───────────────────────────────────────────
    document.addEventListener('mousemove', e => {
        mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ── Theme sync ───────────────────────────────────────────────
    setInterval(() => {
        const c = getThemeColor();
        nnMat.color = c; connMat.color = c; waveMat.color = c;
        shapes.forEach(s => s.material.color = c);
        orbs.forEach(o => { o.material.color = c; o.children.forEach(ch => ch.material.color = c); });
        starLayers[2].mat.color = c;
        wormholeGroup.children.forEach(ch => ch.material.color = c);
        const cb = new THREE.Color(0xc084fc);
        for (let i = 0; i < GALAXY_N; i++) {
            const mix = Math.abs(gPos[i*3]) / 200;
            cA.copy(c).lerp(cb, Math.min(1, mix));
            gCol[i*3] = cA.r; gCol[i*3+1] = cA.g; gCol[i*3+2] = cA.b;
        }
        galaxyGeo.attributes.color.needsUpdate = true;
    }, 1500);

    // ── ANIMATE ──────────────────────────────────────────────────
    function animate() {
        requestAnimationFrame(animate);
        const t = clock.getElapsedTime();

        mouse.x = lerp(mouse.x, mouse.targetX, 0.04);
        mouse.y = lerp(mouse.y, mouse.targetY, 0.04);

        galaxy.rotation.y = t * 0.012;
        galaxy.rotation.z = Math.sin(t * 0.05) * 0.05;

        starLayers.forEach((sl, i) => {
            sl.mesh.rotation.z = t * sl.speed;
            sl.mesh.position.x = mouse.x * (i + 1) * 1.5;
            sl.mesh.position.y = mouse.y * (i + 1) * 1.0;
        });

        dnaGroup.rotation.y = t * 0.25;
        dnaGroup.position.y = Math.sin(t * 0.3) * 5;

        auroraGroup.children.forEach((mesh, i) => {
            const verts = mesh.geometry.attributes.position;
            for (let vi = 0; vi < verts.count; vi++) {
                const x = verts.getX(vi);
                verts.setZ(vi, Math.sin(x * 0.02 + t * 0.6 + i) * 8 + Math.cos(x * 0.04 + t * 0.4) * 4);
            }
            verts.needsUpdate = true;
            mesh.material.opacity = (0.04 + i * 0.01) * (0.7 + Math.sin(t * 0.5 + i) * 0.3);
        });

        wormholeGroup.rotation.z = t * 0.3;
        wormholeGroup.children.forEach((ring, i) => {
            ring.material.opacity = (1 - i / 20) * 0.2 * (0.7 + Math.sin(t * 2 + i * 0.3) * 0.3);
            const scale = 1 + Math.sin(t * 1.5 + i * 0.2) * 0.03;
            ring.scale.set(scale, scale, 1);
        });

        for (let i = 0; i < NN_COUNT; i++) {
            nnPos[i*3]   += nnVel[i].x;
            nnPos[i*3+1] += nnVel[i].y;
            nnPos[i*3+2] += nnVel[i].z;
            if (Math.abs(nnPos[i*3])   > 120) nnVel[i].x *= -1;
            if (Math.abs(nnPos[i*3+1]) > 70)  nnVel[i].y *= -1;
            if (Math.abs(nnPos[i*3+2]) > 25)  nnVel[i].z *= -1;
        }
        nnGeo.attributes.position.needsUpdate = true;

        let li = 0;
        for (let i = 0; i < NN_COUNT && li < MAX_CONN; i++) {
            for (let j = i + 1; j < NN_COUNT && li < MAX_CONN; j++) {
                const dx = nnPos[i*3]-nnPos[j*3], dy = nnPos[i*3+1]-nnPos[j*3+1], dz = nnPos[i*3+2]-nnPos[j*3+2];
                if (dx*dx+dy*dy+dz*dz < 900) {
                    connPos[li*6]=nnPos[i*3]; connPos[li*6+1]=nnPos[i*3+1]; connPos[li*6+2]=nnPos[i*3+2];
                    connPos[li*6+3]=nnPos[j*3]; connPos[li*6+4]=nnPos[j*3+1]; connPos[li*6+5]=nnPos[j*3+2];
                    li++;
                }
            }
        }
        connGeo.setDrawRange(0, li * 2);
        connGeo.attributes.position.needsUpdate = true;

        shapes.forEach((s, i) => {
            s.rotation.x += s.userData.rx;
            s.rotation.y += s.userData.ry;
            s.position.y = s.userData.baseY + Math.sin(t * s.userData.fs + i) * s.userData.fa;
        });

        const wv = waveGeo.attributes.position;
        for (let i = 0; i < wv.count; i++) {
            const x = wv.getX(i), y = wv.getY(i);
            wv.setZ(i, Math.sin(x*0.04 + t*0.7)*4 + Math.cos(y*0.06 + t*0.5)*3);
        }
        wv.needsUpdate = true;

        orbs.forEach((o, i) => {
            o.position.y = o.userData.baseY + Math.sin(t * o.userData.sp + i) * 10;
            o.rotation.y = t * 0.15;
            o.material.opacity = 0.03 + Math.sin(t * o.userData.sp) * 0.02;
            o.children.forEach((ring, ri) => ring.rotation.z = t * (0.1 + ri * 0.05));
        });

        for (let i = shooters.length - 1; i >= 0; i--) {
            const s = shooters[i];
            s.userData.life -= 0.015;
            s.material.opacity = s.userData.life;
            const p = s.geometry.attributes.position;
            p.setXYZ(0, p.getX(0)+s.userData.vx, p.getY(0)+s.userData.vy, p.getZ(0));
            p.setXYZ(1, p.getX(1)+s.userData.vx, p.getY(1)+s.userData.vy, p.getZ(1));
            p.needsUpdate = true;
            if (s.userData.life <= 0) { scene.remove(s); shooters.splice(i, 1); }
        }

        camera.position.x = lerp(camera.position.x, mouse.x * 15, 0.025);
        camera.position.y = lerp(camera.position.y, mouse.y * 9, 0.025);
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    }

    animate();
})();
