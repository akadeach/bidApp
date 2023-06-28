// Node modulesuploadedFile
import React, { Component } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

// Components
import Navbar from "../Navbar/Navigation";
import NavbarAdmin from "../Navbar/NavigationAdmin";
import NotInit from "../NotInit";

// CSS
import "./Registration.css";

// Contract
import getWeb3 from "../../getWeb3";
import Auction from "../../contracts/Auction.json";

export default class Registration extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AuctionInstance: undefined,
      web3: null,
      account: null,
      isAdmin: false,
      isElStarted: false,
      isElEnded: false,
      bidderCount: undefined,
      bidderCompanyName: "",
      bidderTaxNumber: "",
      bidderCompanyAddress: "",
      bidderName: "",
      bidderPhone: "",
      bidders: [],
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

      // Loading current bidders
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
    } catch (error) {
      // Catch any errors for any of the above operations.
      console.error(error);
      alert(
        `Failed to load web3, accounts, or contract. Check console for details (f12).`
      );
    }
  };
  updateBidderCompanyName = (event) => {
    console.log(event.target.value);
    this.setState({ bidderCompanyName: event.target.value });
  };
  updateBidderTaxNumber = (event) => {
    console.log(event.target.value);
    this.setState({ bidderTaxNumber: event.target.value });
  };
  updateBidderCompanyAddress = (event) => {
    console.log(event.target.value);
    this.setState({ bidderCompanyAddress: event.target.value });
  };
  updateBidderName = (event) => {
    console.log(event.target.value);
    this.setState({ bidderName: event.target.value });
  };
  updateBidderPhone = (event) => {
    console.log(event.target.value);
    this.setState({ bidderPhone: event.target.value });
  };
  registerAsBidder = async () => {
    await this.state.AuctionInstance.methods
      .registerAsBidder(
        this.state.bidderCompanyName,
        this.state.bidderTaxNumber,
        this.state.bidderCompanyAddress,
        this.state.bidderName,
        this.state.bidderPhone
      )
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
                  <p>Total registered bidders: {this.state.bidders.length}</p>
                </div>
              </div>
            ) : (
              <>
                {!this.state.currentBidder.hasBided ? (
                  <div className="container-main">
                    <h3>Registration</h3>
                    <small>Register to bidding.</small>
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
                          controlId="bidderCompanyName"
                        >
                          <Form.Label column sm="2">
                            Company Name
                          </Form.Label>
                          <Col sm="10">
                            <Form.Control
                              type="text"
                              placeholder="e.g. Flow Digital Co.,Ltd."
                              value={this.state.bidderCompanyName}
                              onChange={this.updateBidderCompanyName}
                            />
                          </Col>
                        </Form.Group>

                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="bidderTaxNumber"
                        >
                          <Form.Label column sm="2">
                            Tax Number
                          </Form.Label>
                          <Col sm="10">
                            <Form.Control
                              type="text"
                              placeholder="eg. 02011144445555"
                              value={this.state.bidderTaxNumber}
                              onChange={this.updateBidderTaxNumber}
                            />
                          </Col>
                        </Form.Group>

                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="bidderCompanyAddress"
                        >
                          <Form.Label column sm="2">
                            Address
                          </Form.Label>
                          <Col sm="10">
                            <Form.Control
                              as="textarea"
                              rows={5}
                              placeholder="e.g. 123/456 Sansuk Chonburi 20130"
                              value={this.state.bidderCompanyAddress}
                              onChange={this.updateBidderCompanyAddress}
                            />
                          </Col>
                        </Form.Group>

                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="bidderName"
                        >
                          <Form.Label column sm="2">
                            Name
                          </Form.Label>
                          <Col sm="10">
                            <Form.Control
                              type="text"
                              placeholder="e.g. Akadeach"
                              value={this.state.bidderName}
                              onChange={this.updateBidderName}
                            />
                          </Col>
                        </Form.Group>

                        <Form.Group
                          as={Row}
                          className="mb-3"
                          controlId="bidderPhone"
                        >
                          <Form.Label column sm="2">
                            Phone number
                          </Form.Label>
                          <Col sm="10">
                            <Form.Control
                              type="text"
                              placeholder="eg. 9841234567"
                              value={this.state.bidderPhone}
                              onChange={this.updateBidderPhone}
                            />
                          </Col>
                        </Form.Group>

                        <p className="note">
                          <span style={{ color: "tomato" }}> Note: </span>
                          <br /> Make sure your account address and Phone number
                          are correct. <br /> Admin might not approve your
                          account if the provided Phone number nub does not
                          matches the account address registered in admins
                          catalogue.
                        </p>
                        <Button
                          variant="warning"
                          type="button"
                          disabled={
                            this.state.bidderPhone.length !== 10 ||
                            this.state.currentBidder.isVerified
                          }
                          onClick={this.registerAsBidder}
                        >
                          {this.state.currentBidder.isRegistered
                            ? "Update"
                            : "Register"}
                        </Button>
                      </Form>
                    </div>
                  </div>
                ) : null}
                <div
                  className="container-main"
                  style={{
                    borderTop: this.state.currentBidder.isRegistered
                      ? null
                      : "1px solid",
                  }}
                >
                  {loadCurrentBidder(
                    this.state.currentBidder,
                    this.state.currentBidder.isRegistered
                  )}
                </div>
              </>
            )}
            {this.state.isAdmin ? (
              <div className="container-main">
                <small>Total Bidders: {this.state.bidders.length}</small>
                {loadAllBidders(this.state.bidders)}
              </div>
            ) : null}
          </>
        )}
      </>
    );
  }
}
export function loadCurrentBidder(bidder, isRegistered) {
  return (
    <>
      <div
        className={"container-item " + (isRegistered ? "success" : "attention")}
      >
        <center>Your Registered Info</center>
      </div>
      <div
        className={"container-list " + (isRegistered ? "success" : "attention")}
      >
        <table>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Account Address</th>
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
            <th>Verification</th>
            <td>{bidder.isVerified ? "True" : "False"}</td>
          </tr>
          <tr style={{ backgroundColor: "teal" }}>
            <th>Registered</th>
            <td>{bidder.isRegistered ? "True" : "False"}</td>
          </tr>
        </table>
      </div>
    </>
  );
}
export function loadAllBidders(bidders) {
  const renderAllBidders = (bidder) => {
    return (
      <>
        <div className="container-list success">
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
        </div>
      </>
    );
  };
  return (
    <>
      <div className="container-item success">
        <center>List of bidders</center>
      </div>
      {bidders.map(renderAllBidders)}
    </>
  );
}
