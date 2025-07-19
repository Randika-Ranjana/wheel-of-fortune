/* ========= CONFIG ========= */
const CLAIM_PRIZE_URL = 'https://example.com/claim-prize'; // change me
const segments = [
    { text: '5%',  color: '#ff6b6b', value: 5  },
    { text: '40%', color: '#4ecdc4', value: 40 },
    { text: '15%', color: '#45b7d1', value: 15 },
    { text: '25%', color: '#f9ca24', value: 25 },
    { text: '10%', color: '#6c5ce7', value: 10 },
    { text: '30%', color: '#a0e7e5', value: 30 },
    { text: '35%', color: '#feca57', value: 35 },
    { text: '20%', color: '#ff9ff3', value: 20 },
    { text: '8%',  color: '#74b9ff', value: 8  },
    { text: '12%', color: '#fd79a8', value: 12 },
    { text: '18%', color: '#fdcb6e', value: 18 },
    { text: '22%', color: '#e17055', value: 22 }
];

/* ========= ELEMENTS ========= */
const wheelEl   = document.getElementById('wheel');
const spinBtn   = document.getElementById('spinBtn');
const resultTxt = document.getElementById('result');

const modal      = document.getElementById('prizeModal');
const modalClose = document.querySelector('.close');
const modalTitle = document.getElementById('modalTitle');
const modalText  = document.getElementById('modalPrizeText');
const modalClaim = document.getElementById('modalClaimBtn');

/* ========= WHEEL DRAW ========= */
const numSeg = segments.length;
const segDeg = 360 / numSeg;
const cx = 200, cy = 200, r = 180;

function polarToCart(angleDeg, radius) {
    const a = (angleDeg - 90) * Math.PI / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
}

function drawWheel() {
    wheelEl.innerHTML = '';
    segments.forEach((s, i) => {
        const start = i * segDeg;
        const end   = (i + 1) * segDeg;
        const p1 = polarToCart(start, r);
        const p2 = polarToCart(end,   r);

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = [
            `M ${cx} ${cy}`,
            `L ${p1.x} ${p1.y}`,
            `A ${r} ${r} 0 0 1 ${p2.x} ${p2.y}`,
            'Z'
        ].join(' ');
        path.setAttribute('d', d);
        path.setAttribute('fill', s.color);
        path.setAttribute('stroke', '#111');
        path.setAttribute('stroke-width', 2);
        wheelEl.appendChild(path);

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        const mid = (start + end) / 2;
        const pos = polarToCart(mid, r * 0.7);
        txt.setAttribute('x', pos.x);
        txt.setAttribute('y', pos.y);
        txt.setAttribute('text-anchor', 'middle');
        txt.setAttribute('dominant-baseline', 'middle');
        txt.setAttribute('fill', ['#f9ca24','#feca57','#a0e7e5'].includes(s.color) ? '#111' : '#fff');
        txt.setAttribute('font-size', 16);
        txt.setAttribute('font-weight', 'bold');
        txt.setAttribute('transform', `rotate(${mid}, ${pos.x}, ${pos.y})`);
        txt.textContent = s.text;
        wheelEl.appendChild(txt);
    });
}

/* ========= SPIN ========= */
let currentDeg = 0;
let spinning   = false;

spinBtn.addEventListener('click', () => {
    if (spinning) return;
    spinning = true;
    spinBtn.disabled = true;
    resultTxt.textContent = 'Spinning...';
    modal.style.display = 'none';

    /* 3-second custom cubic easing: starts fast, ends slow */
    wheelEl.style.transition = 'transform 3s cubic-bezier(.25,.1,.25,1)';
    const spins  = 4 + Math.floor(Math.random() * 2); // 4-5 full clockwise turns
    const extra  = Math.random() * 360;
    const target = currentDeg + spins * 360 + extra;   // always positive = clockwise
    wheelEl.style.transform = `rotate(${target}deg)`;
    currentDeg = target;

    /* Wait for wheel to stop + 1 s */
    setTimeout(() => {
        const norm = (360 - (currentDeg % 360)) % 360;
        const idx  = Math.floor(norm / segDeg) % numSeg;
        const seg  = segments[idx];
        resultTxt.textContent = `You landed on ${seg.text}!`;

        /* 1-second pause before modal */
        setTimeout(() => showPrize(seg), 1000);

        spinning = false;
        spinBtn.disabled = false;
    }, 4000);
});

/* ========= PRIZE MODAL ========= */
function showPrize(seg) {
    /* modal */
    modalText.textContent = seg.text;
    modalClaim.onclick   = () => openClaim(seg);
    modal.style.display = 'flex';
}

function openClaim(seg) {
    const url = `${CLAIM_PRIZE_URL}?prize=${seg.value}&percentage=${encodeURIComponent(seg.text)}`;
    window.open(url, '_blank');
}

modalClose.onclick = () => modal.style.display = 'none';
window.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };

/* ========= INIT ========= */
drawWheel();

/* sparkle effect */
setInterval(() => {
    if (!spinning) {
        const s = document.createElement('div');
        s.innerHTML = '✨';
        s.style.position = 'fixed';
        s.style.left = Math.random() * window.innerWidth + 'px';
        s.style.top  = Math.random() * window.innerHeight + 'px';
        s.style.fontSize = '22px';
        s.style.pointerEvents = 'none';
        s.style.animation = 'fadeOut 2s forwards';
        s.style.zIndex = 1;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 2000);
    }
}, 1500);