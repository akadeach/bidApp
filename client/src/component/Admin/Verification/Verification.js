import React, { Component } from "react";
import Button from "react-bootstrap/Button";

import Navbar from "../../Navbar/Navigation";
import NavbarAdmin from "../../Navbar/NavigationAdmin";

import AdminOnly from "../../AdminOnly";

import getWeb3 from "../../../getWeb3";
import Auction from "../../../contracts/Auction.json";

import "./Verification.css";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AuctionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      bidderCount: undefined,
      bidders: [],
    };
  }

  // refreshing once
  componentDidMount = async () => {
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
      this.setState({ web3, AuctionInstance: instance, account: accounts[0] });

      // Admin account and verification
      const admin = await this.state.AuctionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
      // Total number of bidders
      const bidderCount = await this.state.AuctionInstance.methods
        .getTotalBidder()
        .call();
      this.setState({ bidderCount: bidderCount });
      // Loading all the bidders
      for (let i = 0; i < this.state.bidderCount; i++) {
        const bidderAddress = await this.state.AuctionInstance.methods
          .bidders(i)
          .call();
        const bidder = await this.state.AuctionInstance.methods
          .bidderDetails(bidderAddress)
          .call();
        this.state.bidders.push({
          address: bidder.bidderAddress,
          companyName: bidder.companyName,
          taxNumber: bidder.taxNumber,
          companyAddress: bidder.companyAddress,
          name: bidder.name,
          phone: bidder.phone,
          hasBided: bidder.hasBided,
          isVerified: bidder.isVerified,
          isRegistered: bidder.isRegistered,
        });
      }
      this.setState({ bidders: this.state.bidders });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  renderUnverifiedBidders = (bidder) => {
    const verifyBidder = async (verifiedStatus, address) => {
      // console.log("Data is : " + verifiedStatus + ' ' + this.state.account);
      await this.state.AuctionInstance.methods
        .verifyBidder(verifiedStatus, address)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };
    return (
      <>
        {bidder.isVerified ? (
          <div className="container-list success">
            <p style={{ margin: "7px 0px" }}>AC: {bidder.address}</p>
            <table>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Bided</th>
              </tr>
              <tr style={{ background: "teal" }}>
                <td>{bidder.name}</td>
                <td>{bidder.phone}</td>
                <td>{bidder.hasBided ? "True" : "False"}</td>
              </tr>
            </table>
          </div>
        ) : null}
        <div
          className="container-list success"
          style={{ display: bidder.isVerified ? "none" : null }}
        >
          <table>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Account address</th>
              <td>{bidder.address}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Company Name</th>
              <td>{bidder.companyName}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Tax Number</th>
              <td>{bidder.taxNumber}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Name</th>
              <td>{bidder.name}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Phone</th>
              <td>{bidder.phone}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Bided</th>
              <td>{bidder.hasBided ? "True" : "False"}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Verified</th>
              <td>{bidder.isVerified ? "True" : "False"}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Registered</th>
              <td>{bidder.isRegistered ? "True" : "False"}</td>
            </tr>
          </table>
          <div style={{}}>
            <Button
              variant="outline-light"
              size="lg"
              className="btn-verification approve"
              disabled={bidder.isVerified}
              onClick={() => verifyBidder(true, bidder.address)}
            >
              Approve
            </Button>
          </div>
        </div>
      </>
    );
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
          <AdminOnly page="Verification Page." />
        </>
      );
    }
    return (
      <>
        <NavbarAdmin />
        <div className="container-main">
          <h3>Verification</h3>
          <small>Total Bidders: {this.state.bidders.length}</small>
          {this.state.bidders.length < 1 ? (
            <div className="container-item info">None has registered yet.</div>
          ) : (
            <>
              <div className="container-item info">
                <center>List of registered bidders</center>
              </div>
              {this.state.bidders.map(this.renderUnverifiedBidders)}
            </>
          )}
        </div>
      </>
    );
  }
}
