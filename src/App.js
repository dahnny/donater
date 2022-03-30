import { useState, useEffect } from "react";

import Footer from "./components/Footer";
import Header from "./components/Header";
import Main from "./components/Main";

import Web3 from "web3";
import { newKitFromWeb3 } from "@celo/contractkit";
import BigNumber from "bignumber.js";

import donater from "./contracts/donater.abi.json";
import ierc from "./contracts/ierc.abi.json";

function App() {
  const [contract, setcontract] = useState(null);
  const [address, setAddress] = useState(null);
  const [kit, setKit] = useState(null);
  const [cUSDBalance, setcUSDBalance] = useState(0);
  const [donations, setDonations] = useState([]);

  const ERC20_DECIMALS = 18;

  const contractAddress = "0xf9b0A2ffeaCC51f94eE24d33304d26c8Fd3777cf";
  const cUSDContractAddress = "0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1";

  useEffect(() => {
    celoConnect();
  }, []);

  useEffect(() => {
    if (kit && address) {
      getBalance();
    } else {
      console.log("no kit");
    }
  }, [kit, address]);

  useEffect(() => {
    if (contract) {
      getDonations();
    }
  }, [contract]);

  const celoConnect = async () => {
    if (window.celo) {
      try {
        await window.celo.enable();
        const web3 = new Web3(window.celo);
        let kit = newKitFromWeb3(web3);

        const accounts = await kit.web3.eth.getAccounts();
        const user_address = accounts[0];

        kit.defaultAccount = user_address;

        await setAddress(user_address);
        await setKit(kit);
        console.log(user_address);
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log("Error");
    }
  };

  const getBalance = async () => {
    try {
      const balance = await kit.getTotalBalance(address);
      const USDBalance = balance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2);

      const contract = new kit.web3.eth.Contract(donater, contractAddress);
      setcontract(contract);
      setcUSDBalance(USDBalance);
    } catch (error) {
      console.log(error);
    }
  };

  const getDonations = async () => {
    const donationLength = await contract.methods.getDonationLength().call();
    const _donations = [];

    for (let index = 0; index < donationLength; index++) {
      let _donate = new Promise(async (resolve, reject) => {
        let donate = await contract.methods.getDonation(index).call();
        resolve({
          index: index,
          owner: donate[0],
          title: donate[1],
          description: donate[2],
          image: donate[3],
          goal: donate[4],
          amountDonated: donate[5],
          isGoalReached: donate[6],
        });
      });
      _donations.push(_donate);
    }
    const donations = await Promise.all(_donations);
    setDonations(donations);
  };

  const donate = async (index, _amount) => {
    const cUSDContract = new kit.web3.eth.Contract(ierc, cUSDContractAddress);
    try {
      const amount = new BigNumber(_amount).shiftedBy(ERC20_DECIMALS).toString();
      await cUSDContract.methods
        .approve(contractAddress, amount)
        .send({ from: address });
      await contract.methods.donate(index, amount).send({ from: address });
      getBalance();
      getDonations();
    } catch (error) {
      console.log(error);
    }
  };

  const addDonations = async (title, description, image, _goal) => {
    const cUSDContract = new kit.web3.eth.Contract(ierc, cUSDContractAddress);
    const amount = new BigNumber(1).shiftedBy(ERC20_DECIMALS).toString();
    const goal = new BigNumber(_goal).shiftedBy(ERC20_DECIMALS).toString();
    try {
      await cUSDContract.methods
        .approve(contractAddress, amount)
        .send({ from: address });
      await contract.methods
        .addDonation(title, description, image, goal)
        .send({ from: address });
    } catch (error) {
      console.log(error);
    }
    getDonations();
  };
  return (
    <>
      <div>
        <Header balance={cUSDBalance} />
        <Main
          addDonations={addDonations}
          donations={donations}
          donate={donate}
        />
        <Footer />
      </div>
    </>
  );
}

export default App;
