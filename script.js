const contractAddress = "0x950e8E9a2c78FeafB5bbCbfdFf3199b0ABe5000c";

const abi = [
  {
    "inputs": [],
    "name": "claim",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

let web3;
let contract;
let account;

const connectWalletButton = document.getElementById("connectWalletButton");
const claimButton = document.getElementById("claimButton");
const status = document.getElementById("status");

async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      status.textContent = `Wallet connected: ${account}`;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Connection rejected.";
    }
  } else {
    status.textContent = "MetaMask or Base Wallet not detected.";
  }
}

async function claim() {
  if (!account) {
    status.textContent = "Please connect your wallet first.";
    return;
  }

  claimButton.disabled = true;
  status.textContent = "Sending claim transaction...";

  try {
    const tx = {
      from: account,
      to: contractAddress,
      data: contract.methods.claim().encodeABI()
    };

    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [tx]
    });

    status.textContent = `Claim successful! Tx Hash: ${txHash}`;
  } catch (err) {
    status.textContent = `Claim failed: ${err.message || err}`;
  } finally {
    claimButton.disabled = false;
  }
}

window.addEventListener('load', async () => {
  if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
  }

  connectWalletButton.addEventListener('click', connectWallet);
  claimButton.addEventListener('click', claim);
});