const { ethers } = require('ethers');
const fs = require('fs');
const config = require('./config'); // Use 'require' for importing local modules

// TODO consider making price dynamic based on network usage
// hitting lots of unexpected "REPLACEMENT UNDERPRICED" issue on the dev net
const gasLimit = ethers.BigNumber.from("1600000");
const gasPrice = ethers.BigNumber.from((100 * 10**9).toString());

// Generate a new key
const wallet = ethers.Wallet.createRandom();
const privateKey = wallet.privateKey;
const publicKey = wallet.address;
const mnemonic = wallet.mnemonic;
console.log("account", {
  privateKey,
  publicKey,
  mnemonic,
});

// Send this user a load test token
const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);

// connect the wallet to the provider
const signer = wallet.connect(provider);
const abiFile = "../erc20/artifacts/contracts/ERC20.sol/ERC20.json";
const parsed = JSON.parse(fs.readFileSync(abiFile));
const abi = parsed.abi;

const contractAddress = '0x394Ba55575E35E52Ad082F232FaE761B46C1294D';
const contract = new ethers.Contract(contractAddress, abi, signer);

const methodName = 'mint';
const methodArgs = [ethers.BigNumber.from(1)]; // Add method arguments if required

async function transferEther() {
  // Use a master key with funds
  const faucet = new ethers.Wallet(config.privateKey);
  const signer = faucet.connect(provider);
  console.log("faucet: ", faucet);

  try {
    // Create a transaction object
    const transaction = {
      to: wallet.address,
      value: ethers.utils.parseEther('1'),
      gasPrice,
      gasLimit: 1420040, // Standard gas limit for Ether transfer
    };

    // Sign the transaction
    const signedTransaction = await signer.sendTransaction(transaction);

    console.log('Fund transaction hash:', signedTransaction.hash);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function mint() {
  try {
    // Call the contract method using the 'call' function
    const result = await contract[methodName](...methodArgs, {
      gasPrice,
      gasLimit
    });
    console.log('Method result:', result);
    console.log('Mint transaction hash:', result.hash);
  } catch (error) {
    console.error('Error:', error);
  }
}

async function main() {
  await transferEther();
  await mint();
}

main();

console.log("signer address: ", signer.address);
console.log("erc20 address: ", contract.address);

