import React, { useState, useEffect } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { auditABI } from "./auditABI";
import './App.css';

// Define your contract address and ABI here
const CONTRACT_ADDRESS = '0x9AF4B12c117FA769106530ccE921B0e0480E716b'; // Replace with your deployed contract address
const CONTRACT_ABI = auditABI;


function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [numLimitedResources, setNumLimitedResources] = useState(0);
  const [ownerRegistered, setOwnerRegistered] = useState(false);
  const [LRregistered, setLRregistered] = useState(false);




  //const [currentAccount, setCurrentAccount] = useState(null);
  const [owner, setOwner] = useState(null);
  //const [numLimitedResources, setNumLimitedResources] = useState(0);
  const [newOwner, setNewOwner] = useState("");
  const [resourceId, setResourceId] = useState(0);
  const [toAddress, setToAddress] = useState("");
  const [description, setDescription] = useState("");
  const [dappOwner, setDappOwner] = useState("");
  const [lrOwner, setlrOwner] = useState("");
  const [lrDescription, setlrDescription] = useState("");

  const [limitedResources, setLimitedResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ownerSession, setOwnerSession] = useState(false);


  const [loadingInteractions, setLoadingInteractions] = useState(true);
  const [userInteractions, setUserInteractions] = useState([]);

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
      const tx = await contract.registerInteractionOwner(currentAccount);
      await tx.wait();  // Wait for the transaction to be mined
      setOwnerRegistered(true);
      console.log('Owner registered:', currentAccount);
    } catch (error) {
      console.error('Error registering owner:', error);
    }
  };

  // Fetch the number of limited resources from the contract
  const fetchLimitedResources = async () => {
    //const contract = await getContract();
    const numResources = await contract.numLimitedResources();
    setNumLimitedResources(Number(numResources));
    console.log('Limited resources:', numResources);
  };

  const getDappOwner = async () => {
    const downer = await contract.dappOwner();
    console.log('Dapp Owner:', downer);
    setDappOwner(downer);
    console.log("downer==currentAccount -> ", downer == currentAccount);
    if (downer.toLowerCase() === currentAccount.toLowerCase()) {
      setOwnerSession(true);
      console.log("Welcome Master!");
    }

    const interactionCreator = await contract.owners(currentAccount);
    console.log('Is ', currentAccount, " interactionCreator? ", interactionCreator);
    setOwnerRegistered(interactionCreator);
  };

  // Create a new interaction
  const createLR = async () => {
    setLRregistered(false);
    if (!contract || !currentAccount) return;

    try {
      const tx = await contract.createLimitedResource(lrOwner, lrDescription);
      await tx.wait();  // Wait for the transaction to be mined
      setLRregistered(true);
      fetchLimitedResources();
      console.log('Limited Resource created:', currentAccount);
      alert("Limited Resource created!");
      getAllLR();
    } catch (error) {
      console.error('Error registering owner:', error);
    }

    //    await contract.createLimitedResource(lrOwner, lrDescription);
    //    alert("Limited Resource created!");
  };

  // Create a new interaction
  const createInteraction = async () => {
    //const contract = await getContract();
    await contract.createInteraction(resourceId, toAddress, description);
    alert("Interaction created!");
    getUserInteractions();
  };


  const getAllLR = async () => {
    setLoading(true);
    try {
      // Fetch total number of LimitedResources
      const numResources = await contract.numLimitedResources();

      // Initialize an array to store resource data
      const resources = [];

      for (let i = 0; i < numResources; i++) {
        const resource = await contract.limitedResources(i);

        resources.push({
          idResource: resource.idResource.toString(),
          resouceDescription: resource.resouceDescription,
          blocked: resource.blocked,
          owner: resource.owner,
        });
      }

      setLimitedResources(resources);
    } catch (error) {
      console.error("Error fetching limited resources:", error);
    }

    setLoading(false);

  };
  const getUserInteractions = async () => {
    setLoadingInteractions(true);
    try {
      // Fetch total number of LimitedResources
      const numUserInteractions = await contract.getUserInteractionCount(currentAccount);

      // Initialize an array to store resource data
      const interactions = [];

      for (let i = 0; i < numUserInteractions; i++) {
        console.log('currentAccount:', currentAccount);
        console.log('i:', i);

        const interaction = await contract.getUserInteractionByIndex(currentAccount, 1 + i);
        console.log('interaction:', interaction);

        console.log('interaction.resoruceId:', interaction.resoruceId);
        interactions.push({
          resoruceId: interaction[0].toString(),
          description: interaction[1],
          to: interaction[2],
          timestamp: interaction[3].toString()
        });
      }

      setUserInteractions(interactions);
    } catch (error) {
      console.error("Error fetching getUserInteractions:", error);
    }
    setLoadingInteractions(false);
  };

  useEffect(() => {

    if (currentAccount && contract) {
      // Optionally, you can fetch additional data or setup listeners here
      getDappOwner();
      getAllLR();
      getUserInteractions();

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
          
            <h2 className="heading">Limited Resources</h2>
            {loading ? (
              <div className="loading-container">
                <img src="/loading.gif" alt="Loading..." className="loading-gif" />
              </div>
            ) : (
              <ul className="list">
                {limitedResources.map((resource) => (
                  <li key={resource.idResource} className="list-item">
                    <p>ID: {parseInt(resource.idResource, 10) + 1}</p>
                    <p>Description: {resource.resouceDescription}</p>
                    <p>Blocked: {resource.blocked ? "Yes" : "No"}</p>
                    <p>Owner: {resource.owner}</p>
                  </li>
                ))}
              </ul>
            )}

            {ownerSession && (
              <div>
                <h2>Create Limited Resource</h2>
                <input
                  type="text"
                  value={lrOwner}
                  onChange={(e) => setlrOwner(e.target.value)}
                  placeholder="LR Owner  Address"
                />
                <input
                  type="text"
                  value={lrDescription}
                  onChange={(e) => setlrDescription(e.target.value)}
                  placeholder="Description"
                />
                <button onClick={createLR}>Create Limited Resource</button>
                {LRregistered && <p>LR registered correctly</p>}
              </div>
            )}
            <p>__________________________________________________________</p>

            {!ownerRegistered && <button onClick={registerOwner}>Register as Interaction Creator</button>}
            {ownerRegistered && (
              <div>
                <p>You are an Interaction Creator registered!</p>
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


                {loadingInteractions ? (
                  <div className="loading-container">
                    <img src="/loading.gif" alt="Loading..." className="loading-gif" />
                  </div>
                ) : (
                  <ul className="list">
                    {userInteractions.map((interaction) => (
                      <li key={interaction.resoruceId} className="list-item">
                        <p>ResourceID: {interaction.resoruceId}</p>
                        <p>Description: {interaction.description}</p>
                        <p>To : {interaction.to}</p>
                        <p>Timestamp: {interaction.timestamp}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            <p>__________________________________________________________</p>

            <p>Number of Limited Resources: {numLimitedResources}</p>
            <p>SC address: {CONTRACT_ADDRESS}</p>
            <p>SC Owner: {dappOwner}</p>

            <p>Interaction Creator: {currentAccount}</p>

          </div>
        )}
      </header>
    </div>
  );
}

export default App;
