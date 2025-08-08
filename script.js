const contractAddress = "0x950e8E9a2c78FeafB5bbCbfdFf3199b0ABe5000c";
const BASE_CHAIN_ID_HEX = "0x2105"; // Base mainnet

const abi = [
  { "inputs": [], "name": "claim", "outputs": [], "stateMutability": "nonpayable", "type": "function" }
];

let web3, contract, account;

const connectWalletButton = document.getElementById("connectWalletButton");
const claimButton = document.getElementById("claimButton");
const status = document.getElementById("status");

function setStatus(msg){ status.textContent = msg || ""; }

async function ensureBaseNetwork() {
  const cid = await window.ethereum.request({ method: "eth_chainId" });
  if (cid !== BASE_CHAIN_ID_HEX) {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BASE_CHAIN_ID_HEX }],
      });
    } catch (e) {
      // If Base isn’t added, add it.
      if (e.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [{
            chainId: BASE_CHAIN_ID_HEX,
            chainName: "Base",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: ["https://mainnet.base.org"],
            blockExplorerUrls: ["https://basescan.org"],
          }],
        });
      } else {
        throw e;
      }
    }
  }
}

async function init() {
  if (!window.ethereum) {
    setStatus("MetaMask/Base Wallet not detected.");
    return;
  }
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(abi, contractAddress);

  window.ethereum.on?.("accountsChanged", (accs) => {
    account = accs?.[0];
    setStatus(account ? `Wallet connected: ${account}` : "Please connect your wallet.");
    claimButton.disabled = !account;
  });

  window.ethereum.on?.("chainChanged", () => {
    // Full reload to ensure provider state is clean
    window.location.reload();
  });
}

async function connectWallet() {
  try {
    await ensureBaseNetwork();
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    setStatus(`Wallet connected: ${account}`);
    claimButton.disabled = false;
  } catch (err) {
    setStatus(`Connection failed: ${err?.message || err}`);
  }
}

async function claim() {
  if (!account) { setStatus("Please connect your wallet first."); return; }

  setStatus("Preparing transaction...");
  claimButton.disabled = true;

  try {
    await ensureBaseNetwork();

    // Try to estimate gas; if it fails, use a safe fallback.
    let gas;
    try {
      gas = await contract.methods.claim().estimateGas({ from: account });
      // add a small buffer
      gas = Math.floor(gas * 1.2);
    } catch {
      gas = 200000; // fallback for Base mobile when estimation fails
    }

    setStatus("Sending claim transaction...");
    const receipt = await contract.methods.claim().send({ from: account, gas });

    setStatus(`Claim successful! Tx Hash: ${receipt.transactionHash}`);
  } catch (err) {
    setStatus(`Claim failed: ${err?.message || err}`);
  } finally {
    claimButton.disabled = false;
  }
}

window.addEventListener("load", async () => {
  await init();
  connectWalletButton.addEventListener("click", connectWallet);
  claimButton.addEventListener("click", claim);
});