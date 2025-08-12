// === CONFIG ===
const CONTRACT_ADDRESS = "0x950e8E9a2c78FeafB5bbCbfdFf3199b0ABe5000c";
const CLAIM_AMOUNT_PRIMA = "2000"; // amount in PRIMA tokens, not wei
const DECIMALS = 18;

// === INIT WEB3 ===
let web3;
let contract;
let accounts;

window.addEventListener("load", async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);

        document.getElementById("connectWalletButton").addEventListener("click", async () => {
            try {
                accounts = await ethereum.request({ method: "eth_requestAccounts" });
                document.getElementById("status").innerText = `Connected: ${accounts[0]}`;
                document.getElementById("claimButton").disabled = false;
            } catch (err) {
                console.error(err);
                document.getElementById("status").innerText = "Wallet connection failed.";
            }
        });

        document.getElementById("claimButton").addEventListener("click", async () => {
            if (!accounts || accounts.length === 0) {
                alert("Please connect your wallet first.");
                return;
            }

            const amountWei = web3.utils.toBN(CLAIM_AMOUNT_PRIMA).mul(
                web3.utils.toBN(10).pow(web3.utils.toBN(DECIMALS))
            );

            try {
                document.getElementById("status").innerText = "Sending claim transaction...";

                await contract.methods.claim(amountWei.toString()).send({ from: accounts[0] });

                document.getElementById("status").innerText = `Successfully claimed ${CLAIM_AMOUNT_PRIMA} PRIMA!`;
            } catch (err) {
                console.error(err);
                document.getElementById("status").innerText = "Claim failed: " + (err.message || err);
            }
        });
    } else {
        alert("MetaMask / Web3 wallet not detected. Please install MetaMask.");
    }
});