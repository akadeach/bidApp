import React, { Component } from "react";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import Auction from "../../../contracts/Auction.json";

import "./StartEnd.css";

export default class StartEnd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AuctionInstance: undefined,
      web3: null,
      accounts: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
    };
  }

  componentDidMount = async () => {
    // refreshing page only once
    if (!window.location.hash) {
      window.location = window.location + "#loaded";
      window.location.reload();
    }

    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = Auction.networks[networkId];
      const instance = new web3.eth.Contract(
        Auction.abi,
        deployedNetwork && deployedNetwork.address
      );
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({
        web3: web3,
        AuctionInstance: instance,
        account: accounts[0],
      });

      // Admin info
      const admin = await this.state.AuctionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get auction start and end values
      const start = await this.state.AuctionInstance.methods.getStart().call();
      this.setState({ elStarted: start });
      const end = await this.state.AuctionInstance.methods.getEnd().call();
      this.setState({ elEnded: end });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  startAuction = async () => {
    await this.state.AuctionInstance.methods
      .startAuction()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  endAuction = async () => {
    await this.state.AuctionInstance.methods
      .endAuction()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    if (!this.state.isAdmin) {
      return (
        <>
          <Navbar />
          <AdminOnly page="Start and end auction page." />
        </>
      );
    }
    return (
      <>
        <NavbarAdmin />
        {!this.state.elStarted & !this.state.elEnded ? (
          <div className="container-item info">
            <center>The auction have never been initiated.</center>
          </div>
        ) : null}
        <div className="container-main">
          <h3>Start or end auction</h3>
          {!this.state.elStarted ? (
            <>
              <div className="container-item">
                <button onClick={this.startAuction} className="start-btn">
                  Start {this.state.elEnded ? "Again" : null}
                </button>
              </div>
              {this.state.elEnded ? (
                <div className="container-item">
                  <center>
                    <p>The auction ended.</p>
                  </center>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <div className="container-item">
                <center>
                  <p>The auction started.</p>
                </center>
              </div>
              <div className="container-item">
                <button onClick={this.endAuction} className="start-btn">
                  End
                </button>
              </div>
            </>
          )}
          <div className="auction-status">
            <p>Started: {this.state.elStarted ? "True" : "False"}</p>
            <p>Ended: {this.state.elEnded ? "True" : "False"}</p>
          </div>
        </div>
      </>
    );
  }
}
