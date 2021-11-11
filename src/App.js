import React, {useEffect, useState} from 'react';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';
import SelectCharacter from './Components/SelectCharacter';
import {CONTRACT_ADDRESS, transformCharacterData} from './constants';
import game from './utils/Game.json';
import { ethers } from 'ethers';
import Arena from './Components/Arena';
import LoadingIndicator from "./Components/LoadingIndicator"

// Constants
const TWITTER_HANDLE = '_buildspace';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null)
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const checkIfWalletIsConnected = async () => {
    try {
      const {ethereum} = window;
      if (!ethereum) {
        console.log("MetaMask not detected! Get MetaMask");
        setIsLoading(false);
        return;
      }
      console.log("Wallet Connected:", ethereum);
      const accounts = await ethereum.request({method: 'eth_accounts'});
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account)
        } else {
          console.log('No authorized account found');
        }
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  }
  
  const connectWalletAction = async() => {
    try {
      const {ethereum} = window;

      if (!ethereum) {
        alert('Get Metamask');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });
      console.log("Connected", accounts[0]);
    } catch (error) {
      console.log(error);
    }
  }
  
    
  useEffect(() => {
    setIsLoading(true);
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        game.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      console.log("Check if user has NFT Completed", txn);
      if (txn.name) {
        console.log('User has character NFT');
        setCharacterNFT(transformCharacterData(txn));
      }
      setIsLoading(false);
    };
    if (currentAccount) {
      console.log('Current account:', currentAccount);
      fetchNFTMetadata();
    }

  }, [currentAccount]);

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
            alt="Monty Python Gif"
          />
          <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
          >
              Connect Wallet To Get Started
          </button>
        </div>
      );
    } 
    else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT}/>;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT}/>
    }
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Metaverse Pirate⚔️</p>
          <p className="sub-tex">Team up to find the NFT One Piece</p>
          <div className="connect-wallet-container">
            {renderContent()}
          </div>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built with @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
