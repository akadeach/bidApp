// Node modules
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// Contract
import getWeb3 from "../../getWeb3";
import Auction from "../../contracts/Auction.json";

// CSS
import "./Results.css";

export default class Result extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AuctionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      biddingCount: undefined,
      biddings: [],
      currentBidder: {
        address: undefined,
        companyName: null,
        taxNumber: null,
        companyAddress: null,
        name: null,
        phone: null,
        hasBided: false,
        isVerified: false,
        isRegistered: false,
      },
      isElStarted: false,
      isElEnded: false,
    };
  }
  componentDidMount = async () => {
    // refreshing once
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

      // Get total number of biddings
      const biddingCount = await this.state.AuctionInstance.methods
        .getTotalBidding()
        .call();
      this.setState({ biddingCount: biddingCount });

      // Get start and end values
      const start = await this.state.AuctionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.AuctionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Loadin Biddings details
      for (let i = 0; i < this.state.biddingCount; i++) {
        const bidAddress = await this.state.AuctionInstance.methods
          .biddings(i)
          .call();
        const bidding = await this.state.AuctionInstance.methods
          .biddingDetails(bidAddress)
          .call();
        const bidder = await this.state.AuctionInstance.methods
          .bidderDetails(bidAddress)
          .call();

        this.state.biddings.push({
          address: bidding.bidAddress,
          bidDetail: bidding.bidDetail,
          bidPrice: bidding.bidPrice,
          hasBided: bidding.hasBided,
          isBided: bidding.isBided,
          companyName: bidder.companyName,
        });

      }
      this.setState({ biddings: this.state.biddings });

      // Admin account and verification
      const admin = await this.state.AuctionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
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

    return (
      <>
        {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />}
        <br />
        <div className="container-main">
          {!this.state.isElStarted && !this.state.isElEnded ? (
            <NotInit />
          ) : this.state.isElStarted && !this.state.isElEnded ? (
            <div className="container-item attention">
              <center>
                <h3>Bidding is being conducted at the movement.</h3>
                <p>Results will be displayed once the bidding has ended.</p>
                <p>Go ahead and present your proposal. {"(if not already)"}.</p>
                <br />
                <Link to="/Bidding">
                  <Button variant="warning" type="button">
                    Bidding Page
                  </Button>
                </Link>
              </center>
            </div>
          ) : !this.state.isElStarted && this.state.isElEnded ? (
            displayResults(this.state.biddings)
          ) : null}
        </div>
      </>
    );
  }
}

function displayWinner(biddings) {
  const getWinner = (biddings) => {
    // Returns an object having minimum bidding
    let minBidReceived = 0;
    let winnerBidding = [];
    for (let i = 0; i < biddings.length; i++) {
      if(minBidReceived == 0){
        minBidReceived = biddings[i].bidPrice;
      }  
      if (biddings[i].bidPrice < minBidReceived ) {
        minBidReceived = biddings[i].bidPrice;
        winnerBidding = [biddings[i]];
      } else if (biddings[i].bidPrice === minBidReceived) {
        winnerBidding.push(biddings[i]);
      }
    }
    return winnerBidding;
  };
  const renderWinner = (winner) => {

    return (
      <div className="container-item success">
        <Container>
          <Row>
            <Col sm={3} className="winner-tag">
              <h3>Winner!</h3>
            </Col>
            <Col sm={9}></Col>
          </Row>
          <Row>
            <Col sm={3}>
              <strong>Address</strong>
            </Col>
            <Col sm={9}>
              <strong>
                {winner.address}{" "}
              </strong>
            </Col>
          </Row>
          <Row>
            <Col sm={3}>
              <strong>Company</strong>
            </Col>
            <Col sm={9}>
              <strong>
                {winner.companyName}{" "}
              </strong>
            </Col>
          </Row>
          <Row>
            <Col sm={3}>
              <strong>Price</strong>
            </Col>
            <Col sm={9}>{winner.bidPrice}</Col>
          </Row>
          <Row>
            <Col sm={3}>
              <strong>Details</strong>
            </Col>
            <Col sm={9}>{winner.bidDetail}</Col>
          </Row>
        </Container>
      </div>
    );
  };
  const winnerBidding = getWinner(biddings);
  return <>{winnerBidding.map(renderWinner)}</>;
}

export function displayResults(biddings) {
  const renderResults = (bidding) => {
    return (
      <tr>
        <td>
          {bidding.address}
        </td>
        <td>
          {bidding.companyName}
        </td>
        <td>{bidding.bidPrice}</td>
      </tr>
    );
  };
  return (
    <>
      {biddings.length > 0 ? <>{displayWinner(biddings)}</> : null}
      <h2>Bidders List</h2>
      <small>Total bidders: {biddings.length}</small>
      {biddings.length < 1 ? (
        <div className="container-item attention">
          <center>No biddings.</center>
        </div>
      ) : (
        <>
          <div className="container-item">
            <table>
              <tr>
                <th>Address</th>
                <th>Company Name</th>
                <th>Bidding</th>
              </tr>
              {biddings.map(renderResults)}
            </table>
          </div>
        </>
      )}
    </>
  );
}
