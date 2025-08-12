const contractAddress = "0x950e8E9a2c78FeafB5bbCbfdFf3199b0ABe5000c";

const abi = [
  {
    "inputs": [{"internalType":"uint256","name":"amount","type":"uint256"}],
    "name":"claim",
    "outputs":[],
    "stateMutability":"nonpayable",
    "type":"function"
  }
];

let web3, contract, account;

const connectWalletButton = document.getElementById("connectWalletButton");
const claimButton = document.getElementById("claimButton");
const status = document.getElementById("status");
const setStatus = (m)=> status.textContent = m || "";

async function connectWallet() {
  if (!window.ethereum) return setStatus("MetaMask/Base Wallet not detected.");
  try {
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    account = accounts[0];
    web3 = new Web3(window.ethereum);
    contract = new web3.eth.Contract(abi, contractAddress);
    setStatus(`Wallet connected: ${account}`);
    claimButton.disabled = false;
  } catch {
    setStatus("Connection rejected.");
  }
}

async function claim() {
  if (!account) return setStatus("Please connect your wallet first.");
  claimButton.disabled = true;
  setStatus("Sending claim transaction...");

  try {
    const amount = Web3.utils.toWei("2000", "ether"); // 2000 PRIMA (18 decimals)

    let gas;
    try {
      gas = await contract.methods.claim(amount).estimateGas({ from: account });
      gas = Math.floor(gas * 1.2);
    } catch { gas = 200000; } // fallback for Base mobile

    const receipt = await contract.methods.claim(amount).send({ from: account, gas });
    setStatus(`Claim successful! Tx Hash: ${receipt.transactionHash}`);
  } catch (err) {
    setStatus(`Claim failed: ${err?.message || err}`);
  } finally {
    claimButton.disabled = false;
  }
}

window.addEventListener("load", () => {
  connectWalletButton.addEventListener("click", connectWallet);
  claimButton.addEventListener("click", claim);
});