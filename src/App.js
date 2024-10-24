import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { auditABI } from "./auditABI";
import './App.css';

// Define your contract address and ABI here
const CONTRACT_ADDRESS = '0x813035D03f6E28b1804dcCb26A83E2B09A7EE4E6'; // Replace with your deployed contract address
const CONTRACT_ABI = auditABI;
/*
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_numResurces",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "numLimitedResources",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "name": "registerOwner",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "idResource",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "descrption",
        "type": "string"
      }
    ],
    "name": "createInteraction",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_address",
        "type": "address"
      }
    ],
    "name": "getUserInteractionCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
*/

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [numLimitedResources, setNumLimitedResources] = useState(0);
  const [ownerRegistered, setOwnerRegistered] = useState(false);


  //const [currentAccount, setCurrentAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  //const [numLimitedResources, setNumLimitedResources] = useState(0);
  const [newOwner, setNewOwner] = useState("");
  const [resourceId, setResourceId] = useState(0);
  const [toAddress, setToAddress] = useState("");
  const [description, setDescription] = useState("");


  // Connect MetaMask wallet
  const connectWallet = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert('MetaMask is not installed!');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
      console.log('Connected account:', accounts[0]);

      // Create an Ethers.js provider
      const browserProvider = new BrowserProvider(ethereum);
      setProvider(browserProvider);

      // Create a contract instance
      const signer = await browserProvider.getSigner();
      const contractInstance = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      setContract(contractInstance);

      // Fetch the initial state (number of limited resources)
      const numResources = await contractInstance.numLimitedResources();
      setNumLimitedResources(Number(numResources));
      console.log('Limited resources:', numResources);
    } catch (error) {
      console.error('Error connecting wallet: ', error);
    }
  };

  // Register an owner in the contract
  const registerOwner = async () => {
    if (!contract || !currentAccount) return;

    try {
      const tx = await contract.registerOwner(currentAccount);
      await tx.wait();  // Wait for the transaction to be mined
      setOwnerRegistered(true);
      console.log('Owner registered:', currentAccount);
    } catch (error) {
      console.error('Error registering owner:', error);
    }
  };
  /*
    // Example to create an interaction
    const createInteraction = async (resourceId, toAddress, description) => {
      if (!contract || !currentAccount) return;
  
      try {
        const tx = await contract.createInteraction(currentAccount, resourceId, toAddress, description);
        await tx.wait();  // Wait for the transaction to be mined
        console.log('Interaction created for resource:', resourceId);
      } catch (error) {
        console.error('Error creating interaction:', error);
      }
    };
  */
  // Fetch the number of limited resources from the contract
  const fetchLimitedResources = async () => {
    //const contract = await getContract();
    const numResources = await contract.numLimitedResources();
    setNumLimitedResources(numResources.toNumber());
  };



  // Create a new interaction
  const createInteraction = async () => {
    //const contract = await getContract();
    await contract.createInteraction(currentAccount, resourceId, toAddress, description);
    alert("Interaction created!");
  };
  useEffect(() => {
    if (currentAccount && contract) {
      // Optionally, you can fetch additional data or setup listeners here
    }
  }, [currentAccount, contract]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Audit Contract DApp</h1>

        {!currentAccount && (
          <button onClick={connectWallet}>Connect Wallet</button>
        )}

        {currentAccount && (
          <div>
            <p>Connected account: {currentAccount}</p>
            <p>Number of Limited Resources: {numLimitedResources}</p>

            <button onClick={registerOwner}>Register Owner</button>
            {ownerRegistered && <p>Owner registered successfully!</p>}

            <h2>Create Interaction</h2>
            <input
              type="number"
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value)}
              placeholder="Resource ID"
            />
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              placeholder="To Address"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
            />
            <button onClick={createInteraction}>Create Interaction</button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
