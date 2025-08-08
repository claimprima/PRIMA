const contractAddress = "0x950e8E9a2c78FeafB5bbCbfdFf3199b0ABe5000c";

// ABI updated for claim(uint256)
const abi = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
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

function setStatus(message) {
  status.textContent = message;
}

// Connect Wallet
connectWalletButton.addEventListener("click", async () => {
  if (!window.ethereum) {
    setStatus("MetaMask or Base Wallet not detected.");
    return;
  }
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
    setStatus(`Wallet connected: ${account}`);
    claimButton.disabled = false;
  } catch (err) {
    setStatus("Connection rejected.");
  }
});

// Claim 50 PRIMA
claimButton.addEventListener("click", async () => {
  if (!account) {
    setStatus("Please connect your wallet first.");
    return;
  }
  claimButton.disabled = true;
  setStatus("Sending claim transaction...");

  try {
    const amount = web3.utils.toWei("50", "ether"); // 50 PRIMA with 18 decimals

    const tx = contract.methods.claim(amount);
    let gas;
    try {
      gas = await tx.estimateGas({ from: account });
      gas = Math.floor(gas * 1.2);
    } catch {
      gas = 200000; // fallback for Base mobile
    }

    const receipt = await tx.send({ from: account, gas });
    setStatus(`Claim successful! Tx Hash: ${receipt.transactionHash}`);
  } catch (err) {
    setStatus(`Claim failed: ${err.message || err}`);
  } finally {
    claimButton.disabled = false;
  }
});