// Node modulesuploadedFile
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";
import BiddingJobTitle from "./BiddingJobTitle";

// CSS
import "./Bidding.css";

// Contract
import getWeb3 from "../../getWeb3";
import Auction from "../../contracts/Auction.json";

export default class Bidding extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AuctionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      biddingCount: undefined,
      biddingDetail: "",
      biddingPrice: "",
      biddings: [],
      elDetails: {},
      currentBidding: {
        address: undefined,
        bidPrice: null,
        bidDetail: null,
        hasBided: false,
        isBided: false,
      },
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
      this.setState({
        web3: web3,
        AuctionInstance: instance,
        account: accounts[0],
      });

      // Admin account and verification
      const admin = await this.state.AuctionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get start and end values
      const start = await this.state.AuctionInstance.methods.getStart().call();
      this.setState({ isElStarted: start });
      const end = await this.state.AuctionInstance.methods.getEnd().call();
      this.setState({ isElEnded: end });

      // Getting auction details from the contract
      const auctionDetails = await this.state.AuctionInstance.methods
        .getAuctionDetails()
        .call();

      this.setState({
        elDetails: {
          adminName: auctionDetails.adminName,
          adminEmail: auctionDetails.adminEmail,
          adminTitle: auctionDetails.adminTitle,
          auctionTitle: auctionDetails.auctionTitle,
          organizationTitle: auctionDetails.organizationTitle,
          auctionDetail: auctionDetails.auctionDetail,
          isAdmin: this.state.account === admin ? "true" : "false",
        },
      });

      // Total number of biddings
      const biddingCount = await this.state.AuctionInstance.methods
        .getTotalBidding()
        .call();
      this.setState({ biddingCount: biddingCount });

      // Loading all the biddings
      for (let i = 0; i < this.state.biddingCount; i++) {
        const bidAddress = await this.state.AuctionInstance.methods
          .biddings(i)
          .call();
        const bidding = await this.state.AuctionInstance.methods
          .biddingDetails(bidAddress)
          .call();
        this.state.biddings.push({
          address: bidding.bidAddress,
          bidDetail: bidding.bidDetail,
          bidPrice: bidding.bidPrice,
          hasBided: bidding.hasBided,
          isBided: bidding.isBided,
        });
      }
      this.setState({ biddings: this.state.biddings });

      // Loading current biddings
      const bidding = await this.state.AuctionInstance.methods
        .biddingDetails(this.state.account)
        .call();
      this.setState({
        currentBidding: {
          address: bidding.bidAddress,
          bidDetail: bidding.bidDetail,
          bidPrice: bidding.bidPrice,
          hasBided: bidding.hasBided,
          isBided: bidding.isBided,
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }

    // Loading current bidder
    const bidder = await this.state.AuctionInstance.methods
      .bidderDetails(this.state.account)
      .call();
    this.setState({
      currentBidder: {
        address: bidder.bidderAddress,
        companyName: bidder.companyName,
        taxNumber: bidder.taxNumber,
        companyAddress: bidder.companyAddress,
        name: bidder.name,
        phone: bidder.phone,
        hasBided: bidder.hasBided,
        isVerified: bidder.isVerified,
        isRegistered: bidder.isRegistered,
      },
    });
  };

  updateBidDetail = (event) => {
    this.setState({ biddingDetail: event.target.value });
  };
  updateBidPrice = (event) => {
    this.setState({ biddingPrice: event.target.value });
  };
  fillBidding = async () => {
    await this.state.AuctionInstance.methods
      .fillBidding(this.state.biddingDetail, this.state.biddingPrice)
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };

  render() {
    const castBid = async (verifiedStatus, address) => {
      await this.state.AuctionInstance.methods
        .verifyBidding(verifiedStatus, address)
        .send({ from: this.state.account, gas: 1000000 });
      window.location.reload();
    };

    const confirmBid = (verifiedStatus, address) => {
      var r = window.confirm("Are you sure confirm this bidding?");
      if (r === true) {
        castBid(verifiedStatus, address);
      }
    };

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
        {!this.state.isElStarted && !this.state.isElEnded ? (
          <NotInit />
        ) : (
          <>
            {this.state.isAdmin ? (
              <div className="container-main">
                <div className="container-item info">
                  <p>Total bidders: {this.state.biddings.length}</p>
                </div>
              </div>
            ) : this.state.currentBidder.isRegistered ? (
              this.state.currentBidder.isVerified ? (
                <>
                  <div className="container-main">
                    <div className="container-item">
                      <BiddingJobTitle el={this.state.elDetails} />
                    </div>
                  </div>
                  <div className="container-main">
                    <h3>Bidding Detail</h3>
                    {!this.state.currentBidder.hasBided ? (
                      <>
                        <small>Fill in the details about bidding.</small>
                        <div className="container-item">
                          <Form style={{ width: "95%" }}>
                            <Form.Group
                              as={Row}
                              className="mb-3"
                              controlId="account"
                            >
                              <Form.Label column sm="2">
                                Account Address
                              </Form.Label>
                              <Col sm="10">
                                <Form.Control
                                  type="text"
                                  value={this.state.account}
                                />
                              </Col>
                            </Form.Group>
                            <Form.Group
                              as={Row}
                              className="mb-3"
                              controlId="biddingDetail"
                            >
                              <Form.Label column sm="2">
                                Details
                              </Form.Label>
                              <Col sm="10">
                                <Form.Control
                                  as="textarea"
                                  rows={5}
                                  value={this.state.biddingDetail}
                                  onChange={this.updateBidDetail}
                                />
                              </Col>
                            </Form.Group>
                            <Form.Group
                              as={Row}
                              className="mb-3"
                              controlId="biddingPrice"
                            >
                              <Form.Label column sm="2">
                                Price
                              </Form.Label>
                              <Col sm="10">
                                <Form.Control
                                  type="text"
                                  placeholder="eg. 5000000"
                                  value={this.state.biddingPrice}
                                  onChange={this.updateBidPrice}
                                />
                              </Col>
                            </Form.Group>
                            <p className="note">
                              <span style={{ color: "tomato" }}> Note: </span>
                              <br /> Please enter complete bidding details.
                              within the specified period.
                            </p>
                            <Button
                              variant="warning"
                              type="button"
                              disabled={this.state.biddingPrice.length < 6}
                              onClick={this.fillBidding}
                            >
                              {this.state.currentBidding.isBided
                                ? "Update"
                                : "Bidding"}
                            </Button>{" "}
                            <Button
                              variant="success"
                              type="button"
                              disabled={
                                !this.state.currentBidding.isBided ||
                                this.state.currentBidding.hasBided
                              }
                              onClick={() =>
                                confirmBid(true, this.state.account)
                              }
                            >
                              Confirm Bidding
                            </Button>
                          </Form>
                        </div>
                      </>
                    ) : (
                      <div className="container-item">
                        <Button variant="success" type="button" disabled={true}>
                          Bidding Confirmed
                        </Button>
                      </div>
                    )}
                  </div>

                  <div
                    className="container-main"
                    style={{
                      borderTop: this.state.currentBidding.isBided
                        ? null
                        : "1px solid",
                    }}
                  >
                    {loadCurrentBidding(
                      this.state.currentBidding,
                      this.state.currentBidding.isBided
                    )}
                  </div>
                </>
              ) : (
                <div className="container-main">
                  <div className="container-item attention">
                    <center>
                      <h3>Please wait for admin to verify.</h3>
                    </center>
                  </div>
                </div>
              )
            ) : (
              <div className="container-main">
                <div className="container-item attention">
                  <center>
                    <h3>You're not registered. Please register first.</h3>
                    <br />
                    <Link to="/Registration">
                      <Button variant="warning" type="button">
                        Register Page
                      </Button>
                    </Link>
                  </center>
                </div>
              </div>
            )}
            {this.state.isAdmin ? (
              <div className="container-main">
                <small>Total Bidders: {this.state.biddings.length}</small>
                {loadAllBiddings(this.state.biddings)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentBidding(bidding, isBided) {
  return (
    <>
      <div className={"container-item " + (isBided ? "success" : "attention")}>
        <center>Your Registered Info</center>
      </div>
      <div className={"container-list " + (isBided ? "success" : "attention")}>
        <table>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Account Address</th>
            <td>{bidding.address}</td>
          </tr>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Details</th>
            <td>{bidding.bidDetail}</td>
          </tr>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Price</th>
            <td>{bidding.bidPrice}</td>
          </tr>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Fill Bided</th>
            <td>{bidding.isBided ? "True" : "False"}</td>
          </tr>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Confirm Bided</th>
            <td>{bidding.hasBided ? "True" : "False"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllBiddings(biddings) {
  const renderAllBiddings = (bidding) => {
    return (
      <>
        <div className="container-list success">
          <table>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Account address</th>
              <td>{bidding.address}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Details</th>
              <td>{bidding.bidDetail}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Price</th>
              <td>{bidding.bidPrice}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Fill Bided</th>
              <td>{bidding.isBided ? "True" : "False"}</td>
            </tr>
            <tr style={{ backgroundColor: "teal" }}>
              <th>Confirm Bided</th>
              <td>{bidding.hasBided ? "True" : "False"}</td>
            </tr>
          </table>
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of bidders</center>
      </div>
      {biddings.map(renderAllBiddings)}
    </>
  );
}
