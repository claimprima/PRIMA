document.addEventListener("DOMContentLoaded", async () => {
  const connectWalletButton = document.getElementById("connectWalletButton");
  const claimButton = document.getElementById("claimButton");
  const status = document.getElementById("status");

  let account;
  const contractAddress = "0x950e8E9a2c78FeafB5bbCbfdFf3199b0ABe5000c";

  // Inline ABI: claim(uint256 amount)
  const abi = [
    {
      "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
      "name": "claim",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];

  let web3;
  let contract;

  // Wait for Ethereum provider (MetaMask/Base Wallet) — same as before
  async function waitForEthereum(timeout = 3000) {
    const start = Date.now();
    while (!window.ethereum && Date.now() - start < timeout) {
      await new Promise(r => setTimeout(r, 50));
    }
    if (!window.ethereum) {
      status.textContent = "MetaMask/Base Wallet not found. Open in wallet browser.";
      throw new Error("No provider");
    }
  }

  await waitForEthereum();
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(abi, contractAddress);

  // Connect Wallet — same onclick pattern
  connectWalletButton.onclick = async () => {
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      account = accounts[0];
      status.textContent = `Connected: ${account}`;
      claimButton.disabled = false;
    } catch (err) {
      status.textContent = "Connection failed.";
    }
  };

  // Claim — same flow, now passes 2000e18
  claimButton.onclick = async () => {
    if (!account) {
      status.textContent = "Please connect wallet first.";
      return;
    }

    status.textContent = "Sending claim transaction...";
    claimButton.disabled = true;

    try {
      const amountWei = web3.utils.toWei("2000", "ether"); // 2000 PRIMA (18 decimals)
      const tx = {
        from: account,
        to: contractAddress,
        data: contract.methods.claim(amountWei).encodeABI()
      };

      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [tx]
      });

      status.textContent = `Transaction sent: ${txHash}`;
    } catch (err) {
      status.textContent = "Claim failed: " + (err.message || err);
    } finally {
      claimButton.disabled = false;
    }
  };
});