import { AnonymousCheckInClient, CONTRACT_ADDRESS, getProofServerUrl } from './integration/contract.js';

document.addEventListener('DOMContentLoaded', () => {
  const client = new AnonymousCheckInClient();
  
  const contractAddrEl = document.getElementById('contractAddr');
  const visitorCountEl = document.getElementById('visitorCount');
  const heroVisitorCountEl = document.getElementById('heroVisitorCount');
  const lastCommitmentEl = document.getElementById('lastCommitment');
  const logBoxEl = document.getElementById('logBox');
  const formEl = document.getElementById('verifyForm') as HTMLFormElement;
  const verifierInput = document.getElementById('verifierInput') as HTMLInputElement;
  const passcodeInput = document.getElementById('passcodeInput') as HTMLInputElement;
  const progressBar = document.getElementById('progressBar');
  const progressFill = document.getElementById('progressFill');
  const connectWalletBtn = document.getElementById('connectWalletBtn');
  const proofProviderEl = document.getElementById('proofProviderEl');
  const explorerProofServerEl = document.getElementById('explorerProofServerEl');

  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const proofUrl = getProofServerUrl();

  if (contractAddrEl) contractAddrEl.textContent = CONTRACT_ADDRESS;

  if (proofProviderEl) {
    proofProviderEl.textContent = isLocal ? "http://localhost:6300 (Local Docker)" : "Midnight Preprod Cloud ZK Service";
  }
  if (explorerProofServerEl) {
    explorerProofServerEl.textContent = isLocal ? "http://localhost:6300 (Status: ONLINE)" : "Midnight Preprod ZK Infrastructure (ONLINE)";
  }

  let count = 1;
  const status = client.getWalletStatus();
  let walletConnected = status.connected;
  let walletAddress = status.address || '';

  // Sync wallet UI state across pages
  const updateWalletUI = () => {
    if (walletConnected && connectWalletBtn && walletAddress) {
      connectWalletBtn.textContent = `🟢 ${walletAddress.substring(0, 10)}... (Copy)`;
      (connectWalletBtn as HTMLButtonElement).style.background = 'linear-gradient(135deg, #059669, #047857)';
      connectWalletBtn.title = `Connected Address: ${walletAddress}\nClick to copy full address!`;
    } else if (connectWalletBtn) {
      connectWalletBtn.textContent = 'Connect Wallet';
      (connectWalletBtn as HTMLButtonElement).style.background = 'linear-gradient(135deg, #7C3AFF, #6d28d9)';
      connectWalletBtn.title = "Connect Midnight Lace Wallet";
    }
  };

  updateWalletUI();

  connectWalletBtn?.addEventListener('click', async () => {
    if (!walletConnected) {
      if (logBoxEl) {
        logBoxEl.innerHTML += `<div class="log-line info">> Requesting connection to browser Midnight Lace Wallet extension...</div>`;
      }
      try {
        const res = await client.connectWallet();
        walletConnected = true;
        walletAddress = res.walletAddress;
        updateWalletUI();

        if (logBoxEl) {
          logBoxEl.innerHTML += `<div class="log-line success">> [WALLET CONNECTED] Address: ${res.walletAddress}</div>`;
          logBoxEl.innerHTML += `<div class="log-line info">> [FAUCET] Need test tokens? Visit <a href="https://faucet.preprod.midnight.network" target="_blank" style="color:#22d3ee; text-decoration:underline;">Midnight Preprod Faucet</a></div>`;
          logBoxEl.scrollTop = logBoxEl.scrollHeight;
        }
      } catch (err: any) {
        walletConnected = false;
        walletAddress = '';
        updateWalletUI();

        const errorMsg = err?.message || "Failed to connect to Midnight Lace Wallet extension.";
        alert(`Wallet Connection Error:\n\n${errorMsg}`);

        if (logBoxEl) {
          logBoxEl.innerHTML += `<div class="log-line error">> [ERROR] ${errorMsg}</div>`;
          logBoxEl.scrollTop = logBoxEl.scrollHeight;
        }
      }
    } else {
      // If connected, copy full address to clipboard
      try {
        await navigator.clipboard.writeText(walletAddress);
        alert(`📋 Wallet Address Copied!\n\n${walletAddress}\n\nPaste this into the Midnight Preprod Faucet to receive test tokens.`);
        if (logBoxEl) {
          logBoxEl.innerHTML += `<div class="log-line success">> [COPIED] Wallet address copied: ${walletAddress}</div>`;
          logBoxEl.scrollTop = logBoxEl.scrollHeight;
        }
      } catch (e) {
        alert(`Your Full Wallet Address:\n\n${walletAddress}`);
      }
    }
  });

  formEl?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const organizer = verifierInput.value;
    const passcode = passcodeInput.value;

    if (!passcode || passcode.trim().length === 0) {
      alert("Please enter a private passcode to generate the ZK witness!");
      return;
    }

    if (progressBar && progressFill) {
      progressBar.style.display = 'block';
      progressFill.style.width = '15%';
    }

    if (logBoxEl) {
      logBoxEl.innerHTML += `<div class="log-line info">> [STEP 1/4] Constructing private witnesses: secretPasscode(), attendeeNonce(), attendeeRole()...</div>`;
      logBoxEl.innerHTML += `<div class="log-line info">> [STEP 2/4] Proof Server executing Compact ZK circuit anonymousCheckIn() (${isLocal ? 'port 6300' : 'Preprod Remote'})...</div>`;
      logBoxEl.scrollTop = logBoxEl.scrollHeight;
    }

    client.setAttendeePasscode(passcode);

    setTimeout(async () => {
      if (progressFill) progressFill.style.width = '65%';

      try {
        const result = await client.anonymousCheckIn(organizer);

        // Update wallet state if auto-connected
        walletConnected = true;
        walletAddress = result.signedBy || walletAddress;
        updateWalletUI();

        setTimeout(() => {
          if (progressFill) progressFill.style.width = '100%';

          count++;
          if (visitorCountEl) visitorCountEl.textContent = count.toString();
          if (heroVisitorCountEl) heroVisitorCountEl.textContent = count.toString();
          if (lastCommitmentEl) lastCommitmentEl.textContent = result.commitmentHex || '0x...';

          if (logBoxEl) {
            const feeStatusNote = result.walletFunded
              ? `(Deducted from Lace Wallet Balance)`
              : `(Note: Wallet unfunded — get test tokens at <a href="https://faucet.preprod.midnight.network" target="_blank" style="color:#22d3ee; text-decoration:underline;">Midnight Faucet</a>)`;
            
            logBoxEl.innerHTML += `<div class="log-line info">> [STEP 3/4] Signed by Lace Wallet: ${result.signedBy} | Fee: ${result.txFee} ${result.txFeeAsset} ${feeStatusNote}</div>`;
            logBoxEl.innerHTML += `<div class="log-line success">> [STEP 4/4] ✓ Proof Verified & Submitted! On-Chain Commitment: ${result.commitmentHex} | TxHash: ${result.txHash}</div>`;
            logBoxEl.scrollTop = logBoxEl.scrollHeight;
          }

          setTimeout(() => {
            if (progressBar) progressBar.style.display = 'none';
            if (progressFill) progressFill.style.width = '0%';
          }, 800);

        }, 400);
      } catch (err: any) {
        if (progressBar) progressBar.style.display = 'none';
        alert(`Check-In Error: ${err?.message}`);
        if (logBoxEl) {
          logBoxEl.innerHTML += `<div class="log-line error">> [ERROR] ${err?.message}</div>`;
        }
      }
    }, 400);
  });
});
