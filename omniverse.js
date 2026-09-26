// ══════════════════════════════════════════════════
// LGAI OMNIVERSE — MAIN JAVASCRIPT
// ══════════════════════════════════════════════════

// ── QUANTUM MATRIX RAIN CANVAS ──
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');

let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()_+-=[]{}|;:,.<>?LGAI';
characters = characters.split('');

let fontSize = 14;
let columns = 0;
let drops = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  columns = canvas.width / fontSize;
  drops = [];
  for(let x = 0; x < columns; x++) {
    drops[x] = Math.random() * canvas.height / fontSize;
  }
}

function drawMatrix() {
  ctx.fillStyle = 'rgba(10, 13, 26, 0.08)'; // Dark background with slight transparency for trail
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#10b981'; // Matrix Green
  ctx.font = fontSize + 'px monospace';

  for(let i = 0; i < drops.length; i++) {
    const text = characters[Math.floor(Math.random() * characters.length)];
    ctx.fillText(text, i * fontSize, drops[i] * fontSize);

    if(drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
      drops[i] = 0;
    }
    drops[i]++;
  }
  requestAnimationFrame(drawMatrix);
}

resizeCanvas();
drawMatrix();
window.addEventListener('resize', resizeCanvas);

// ── TYPEWRITER EFFECT FOR HERO ──
document.addEventListener("DOMContentLoaded", () => {
  const heroSub = document.querySelector('.hero-sub');
  if(heroSub) {
    const text = heroSub.innerHTML;
    heroSub.innerHTML = '';
    let i = 0;
    heroSub.style.fontFamily = 'monospace';
    heroSub.style.color = '#10b981';
    function typeWriter() {
      if (i < text.length) {
        heroSub.innerHTML += text.charAt(i);
        i++;
        setTimeout(typeWriter, 15);
      } else {
        heroSub.style.borderRight = "none";
      }
    }
    setTimeout(typeWriter, 500);
  }
});

// ── NAVBAR SCROLL ──
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 50);
});

// ── LIVE COUNTER ANIMATION ──
function animateCounter(el, target, prefix = '', suffix = '', decimals = 0) {
  let start = 0;
  const duration = 2500;
  const startTime = performance.now();
  function update(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = prefix + (decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toLocaleString()) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// ── LIVE SIMULATED STATS ──
function updateLiveStats() {
  const burned = Math.floor(Math.random() * 5000 + 40000);
  const nodes  = Math.floor(Math.random() * 50 + 1200);
  const creators = Math.floor(Math.random() * 5 + 87);
  const profit = (Math.random() * 200 + 1800).toFixed(2);

  animateCounter(document.getElementById('totalBurned'), burned, '', ' LGAI');
  animateCounter(document.getElementById('activeNodes'), nodes, '', ' Nodes');
  animateCounter(document.getElementById('totalCreators'), creators, '', ' Active');
  document.getElementById('arbProfit').textContent = '$' + Number(profit).toLocaleString();

  // Pillar metrics
  animateCounter(document.getElementById('depin-nodes'), nodes);
  animateCounter(document.getElementById('social-tokens'), creators);

  const tvl = (Math.random() * 10000 + 45000).toFixed(0);
  document.getElementById('rwa-tvl').textContent = '$' + Number(tvl).toLocaleString();
  animateCounter(document.getElementById('rwa-burned'), burned);
  document.getElementById('social-vol').textContent = '$' + (Math.random() * 3000 + 5000).toFixed(0);
  document.getElementById('omni-yield').textContent = '$' + profit;
}

// Run on load + every 10 seconds
setTimeout(updateLiveStats, 800);
setInterval(updateLiveStats, 10000);

// ── BURN COUNTDOWN TIMER ──
function updateBurnCountdown() {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  const diff = midnight - now;
  const h = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const m = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const s = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  const el = document.getElementById('burnCountdown');
  if (el) el.textContent = `${h}:${m}:${s}`;
}
setInterval(updateBurnCountdown, 1000);
updateBurnCountdown();

// ── MODAL SYSTEM ──
function openDepin()     { document.getElementById('depinModal').classList.add('open'); }
function openRwa()       { document.getElementById('rwaModal').classList.add('open'); }
function openSocialFi()  { document.getElementById('socialModal').classList.add('open'); }
function openOmnichain() { document.getElementById('omnichainModal').classList.add('open'); }

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

// Close on backdrop click
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', e => {
    if (e.target === modal) modal.classList.remove('open');
  });
});

// ── DEPIN REWARD CALCULATOR ──
function calcReward() {
  const vram = parseInt(document.getElementById('gpuVram').value) || 0;
  const model = document.getElementById('gpuModel').value;
  const wallet = document.getElementById('depinWallet').value;

  if (!vram || !model || !wallet) {
    alert('Please fill in all fields!');
    return;
  }

  const dailyReward = vram * 10; // 10 LGAI per GB
  document.querySelector('.re-val').textContent = dailyReward.toLocaleString() + ' LGAI / day';

  setTimeout(() => {
    alert(`✅ Node Connected!\n\nGPU: ${model}\nVRAM: ${vram}GB\nEstimated Daily Reward: ${dailyReward.toLocaleString()} LGAI\n\nYour node is now part of the LegionAI DePIN network!`);
    closeModal('depinModal');
  }, 300);
}

// ── SOCIALFI LAUNCHER ──
function launchToken() {
  const name    = document.getElementById('tokenName').value;
  const symbol  = document.getElementById('tokenSymbol').value;
  const supply  = document.getElementById('tokenSupply').value;
  const price   = document.getElementById('tokenPrice').value;

  if (!name || !symbol || !supply || !price) {
    alert('Please fill in all fields!');
    return;
  }

  setTimeout(() => {
    alert(`🚀 Token Launched!\n\nName: ${name} (${symbol.toUpperCase()})\nTotal Supply: ${Number(supply).toLocaleString()}\nPrice: ${price} LGAI per token\n\nYour fan token is now LIVE on the LegionAI SocialFi Launchpad!\nAll purchases require LGAI — driving demand for our coin.`);
    closeModal('socialModal');
  }, 300);
}

// ── OMNICHAIN STAKE CALCULATOR ──
function calcStake() {
  const amount = parseFloat(document.getElementById('stakeAmount').value) || 0;
  if (!amount) { alert('Please enter a stake amount!'); return; }

  const apr = 0.38;
  const dailyYield = (amount * apr / 365).toFixed(2);
  document.getElementById('stakeYield').textContent = dailyYield + ' LGAI';

  setTimeout(() => {
    alert(`✅ Staking Confirmed!\n\nStaked: ${amount.toLocaleString()} LGAI\nEstimated Daily Yield: ${dailyYield} LGAI\nAPR: 38%\n\nOur AI agents are now hunting arbitrage opportunities across 4 chains on your behalf. Rewards will be auto-distributed daily.`);
    closeModal('omnichainModal');
  }, 300);
}

// ── SCROLL REVEAL ANIMATION ──
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fade-up 0.6s ease forwards';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.pillar-card, .market-card, .rm-item, .stat-card').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// ── OMNI-CHAIN AI LIVE PROFIT TICKER & TERMINAL ──
const chains = ['Ethereum', 'Solana', 'Avalanche', 'Base'];
function tickProfit() {
  document.querySelectorAll('.chain-profit').forEach((el, i) => {
    const gain = (Math.random() * 50 + 10).toFixed(2);
    el.textContent = '+$' + gain;
    el.style.color = '#10b981';
  });
}
setInterval(tickProfit, 3000);
tickProfit();

const TERMINAL_LOGS = [
  "[ETH] Flashloan executed. Profit: +12.4 LGAI",
  "[SOL] Arbitrage opportunity found. Routing via Jupiter...",
  "[AVAX] Sniping new LP token... Success.",
  "[BASE] Cross-chain bridge fee minimized. Rebalancing...",
  "[ETH] MEV attack blocked. Extracting value...",
  "[SOL] Raydium pool anomaly detected. Executing trade.",
  "[SYSTEM] Swarm matrix synchronized.",
  "[BASE] Aerodrome liquidity injected."
];

function updateTerminal() {
  const terminal = document.getElementById('terminalLogs');
  if (!terminal) return;
  const newLog = document.createElement('div');
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  newLog.textContent = `[${time}] ${TERMINAL_LOGS[Math.floor(Math.random() * TERMINAL_LOGS.length)]}`;
  terminal.appendChild(newLog);
  if (terminal.children.length > 5) {
    terminal.removeChild(terminal.firstChild);
  }
}
setInterval(updateTerminal, 2000);

console.log('%c🌌 LGAI OMNIVERSE ACTIVATED', 'font-family: monospace; font-size: 18px; color: #7c3aed; font-weight: bold;');
console.log('%cAll 4 autonomous pillars online. The empire is self-sustaining.', 'color: #06b6d4; font-size: 12px;');
