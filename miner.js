// Web Worker based Cryptographic Miner (SHA-256 Simulation)
// This performs REAL cryptographic hashing to utilize CPU power.

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);                    
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

let isMining = false;
let hashesCalculated = 0;
let nonce = 0;

self.onmessage = function(e) {
    if (e.data.command === 'START') {
        isMining = true;
        mineLoop();
    } else if (e.data.command === 'STOP') {
        isMining = false;
    } else if (e.data.command === 'REPORT') {
        self.postMessage({ type: 'HASHRATE', hashes: hashesCalculated });
        hashesCalculated = 0; // Reset counter after reporting
    }
};

async function mineLoop() {
    while (isMining) {
        // Perform 1000 real hashes per batch to prevent freezing the worker event loop
        for(let i=0; i<1000; i++) {
            await sha256("LGAI_DEPIN_MINER_BLOCK_" + nonce);
            nonce++;
            hashesCalculated++;
        }
        
        // Small delay to allow message parsing
        await new Promise(r => setTimeout(r, 1));
    }
}
