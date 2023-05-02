import './App.css';
import { useState, useEffect } from 'react';
import {InfuraProvider, JsonRpcProvider} from "@ethersproject/providers"
import {ethers, BigNumber} from "ethers"
import Mintathon from "./Mintathon.json";
import Crescendo from "./Crescendo.json";

// on start
// take start current time - start time = totalStreamTime
// get Mints x TimePerMint = TotalTimeCreated
// counterStart = totalStreamTime - TotalTimeCreated

function App() {
    const [minted, setMinted] = useState(0);
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [price, setPrice] = useState(0);

    const contractAddress = "0x84AcbB49248Fd8aC27cB9FB86d58C74151c49cc2";
    const croscendoAddress = "0xD14C1C8C979562e371Cf13808Ff14358c7650560";
    const startTime = 1683064800
    const timePerMint = 1200 // seconds
    let currentMints = 0
    let newMints = 1
    let timeRemaining = 0
    let currentPrice = 0.004

    const network = process.env.ETHEREUM_NETWORK;
    const provider = new InfuraProvider("goerli", {
        projectId: process.env.REACT_APP_INFURA_ID
    })

    // // Creating a signing account from a private key
    // const signer = new ethers.Wallet(process.env.PK, provider);

    const mintathonContract = new ethers.Contract(
      contractAddress,
      Mintathon.abi,
      provider
    )

    const crescendoContract = new ethers.Contract(
      croscendoAddress,
      Crescendo.abi,
      provider
    )

    async function getMints() {
      console.log("hello")
      //newMints = BigNumber.from(await mintathonContract.totalSupply()).toNumber()
      newMints = BigNumber.from(await crescendoContract.totalSupply(0)).toNumber()

      if(newMints != currentMints) {
        console.log("new mints found, updating clock state")
        currentMints = newMints
        setMinted(newMints)
        currentPrice = await crescendoContract.calculateCurvedMintReturn(1, 0)
        currentPrice = ethers.utils.formatEther(currentPrice)
        console.log(currentPrice)
        setPrice(currentPrice)
      }
      console.log(newMints)
    }

    async function getTime() {
      const timeStreamed = Math.floor(Date.now() / 1000) - startTime
      console.log("time streamed: " + timeStreamed)
      const timeAdded = (currentMints * timePerMint) + 10800
      console.log(timeAdded)
      timeRemaining = timeAdded - timeStreamed
      console.log("time remaing: " + timeRemaining)

      const time = timeRemaining;

      //setDays(Math.floor(time / (1000 * 60 * 60 * 24)));
      setHours(Math.floor((time / (60 * 60)) % 24));
      setMinutes(Math.floor((time / 60) % 60));
      setSeconds(Math.floor((time % 60)));
    };

    useEffect(() => {
      const interval = setInterval(() => getTime(), 1000);

      return () => clearInterval(interval);
    }, []);

    useEffect(() => {
      const interval = setInterval(() => getMints(), 15000);
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="clock">
        <h1 className="digital">{hours} : {minutes} : {seconds}</h1>
        <h1 className="message">Total Minted: {minted}</h1>
        <h1 className="message">Price: {price} Ξ</h1>
      </div>
    );
}

export default App;