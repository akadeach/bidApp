// Node modules
import React, { Component } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

// Components
import Navbar from "./Navbar/Navigation";
import NavbarAdmin from "./Navbar/NavigationAdmin";
import NavbarNone from "./Navbar/NavigationNone";
import UserHome from "./UserHome";
import StartEnd from "./StartEnd";
import BiddingStatus from "./BiddingStatus";

// Contract
import getWeb3 from "../getWeb3";
import Auction from "../contracts/Auction.json";

// CSS
import "./Home.css";

// const buttonRef = React.createRef();
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      AuctionInstance: undefined,
      account: null,
      web3: null,
      isAdmin: false,
      elStarted: false,
      elEnded: false,
      elDetails: {},
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

      const admin = await this.state.AuctionInstance.methods.getAdmin().call();
      if (this.state.account === admin) {
        this.setState({ isAdmin: true });
      }

      // Get auction start and end values
      const start = await this.state.AuctionInstance.methods.getStart().call();
      this.setState({ elStarted: start });
      const end = await this.state.AuctionInstance.methods.getEnd().call();
      this.setState({ elEnded: end });

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
          middlePrice: auctionDetails.middlePrice,
          isAdmin: this.state.account === admin ? "true" : "false",
        },
      });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };
  // end auction
  endAuction = async () => {
    await this.state.AuctionInstance.methods
      .endAuction()
      .send({ from: this.state.account, gas: 1000000 });
    window.location.reload();
  };
  // register and start auction
  registerAuction = async (data) => {
    await this.state.AuctionInstance.methods
      .setAuctionDetails(
        data.adminFName.toLowerCase() + " " + data.adminLName.toLowerCase(),
        data.adminEmail.toLowerCase(),
        data.adminTitle.toLowerCase(),
        data.auctionTitle.toLowerCase(),
        data.organizationTitle.toLowerCase(),
        data.auctionDetail.toLowerCase(),
        data.middlePrice.toLowerCase()
      )
      .send({ from: this.state.account, gas: 1000000 });

    window.location.reload();
  };

  render() {
    if (!this.state.web3) {
      return (
        <>
          <Navbar />
          <center>Loading Web3, accounts, and contract...</center>
        </>
      );
    }
    return (
      <>
        {/* {this.state.isAdmin ? <NavbarAdmin /> : <Navbar />} */}
        {!this.state.elStarted & !this.state.elEnded ? (
          <NavbarNone />
        ) : this.state.isAdmin ? (
          <NavbarAdmin />
        ) : (
          <Navbar />
        )}
        <div className="container-main">
          {!this.state.elStarted & !this.state.elEnded ? (
            <div className="center-items header">
              <h1>Enter administrator information before start Bidding.</h1>
            </div>
          ) : null}
          <div className="container-item center-items info">
            Your Account: {this.state.account}
          </div>
        </div>
        {this.state.isAdmin ? (
          <>
            <this.renderAdminHome />
          </>
        ) : this.state.elStarted ? (
          <>
            <div className="container-main">
              <div className="container-item center-items">
                <UserHome el={this.state.elDetails} />
              </div>
            </div>
          </>
        ) : !this.state.isElStarted && this.state.isElEnded ? (
          <>
            <div className="container-item attention">
              <center>
                <h3>The Bidding ended.</h3>
                <br />
                <Link
                  to="/Results"
                  style={{ color: "black", textDecoration: "underline" }}
                >
                  See results
                </Link>
              </center>
            </div>
          </>
        ) : null}
      </>
    );
  }

  renderAdminHome = () => {
    const EMsg = (props) => {
      return <span style={{ color: "tomato" }}>{props.msg}</span>;
    };

    const AdminHome = () => {
      // Contains of Home page for the Admin
      const {
        handleSubmit,
        register,
        formState: { errors },
      } = useForm();

      const onSubmit = (data) => {
        this.registerAuction(data);
      };

      return (
        <div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {!this.state.elStarted & !this.state.elEnded ? (
              <div className="container-main">
                {/* about-admin */}
                <div className="about-admin">
                  <h3 class="title_content">About Admin</h3>
                  <div className="container-item center-items">
                    <div>
                      <label className="label-home">
                        Full Name{" "}
                        {errors.adminFName && <EMsg msg="*required" />}
                        <input
                          className="input-home"
                          type="text"
                          placeholder="First Name"
                          {...register("adminFName", {
                            required: true,
                          })}
                        />
                        <input
                          className="input-home"
                          type="text"
                          placeholder="Last Name"
                          {...register("adminLName")}
                        />
                      </label>

                      <label className="label-home">
                        Email{" "}
                        {errors.adminEmail && (
                          <EMsg msg={errors.adminEmail.message} />
                        )}
                        <input
                          className="input-home"
                          placeholder="eg. you@example.com"
                          name="adminEmail"
                          {...register("adminEmail", {
                            required: "*Required",
                            pattern: {
                              value: /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/, // email validation using RegExp
                              message: "*Invalid",
                            },
                          })}
                        />
                      </label>

                      <label className="label-home">
                        Job Title or Position{" "}
                        {errors.adminTitle && <EMsg msg="*required" />}
                        <input
                          className="input-home"
                          type="text"
                          placeholder="eg. HR Head "
                          {...register("adminTitle", {
                            required: true,
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
                {/* about-auction */}
                <div className="about-auction">
                  <h3 class="title_content">About Bidding</h3>
                  <div className="container-item center-items">
                    <div>
                      <label className="label-home">
                        Bidding Title{" "}
                        {errors.auctionTitle && <EMsg msg="*required" />}
                        <input
                          className="input-home"
                          type="text"
                          placeholder="eg. Mobile Development"
                          {...register("auctionTitle", {
                            required: true,
                          })}
                        />
                      </label>
                      <label className="label-home">
                        Organization Name{" "}
                        {errors.organizationTitle && <EMsg msg="*required" />}
                        <input
                          className="input-home"
                          type="text"
                          placeholder="eg. Test Company Co.,Ltd."
                          {...register("organizationTitle", {
                            required: true,
                          })}
                        />
                      </label>
                      <label className="label-home">
                        Job Details{" "}
                        {errors.auctionDetail && <EMsg msg="*required" />}
                        <textarea
                          className="input-home"
                          rows="10"
                          cols="50"
                          placeholder="eg. Details of job"
                          {...register("auctionDetail", {
                            required: true,
                          })}
                        ></textarea>
                      </label>
                      <label className="label-home">
                        Middle Price{" "}
                        {errors.middlePrice && <EMsg msg="*required" />}
                        <input
                          className="input-home"
                          type="text"
                          placeholder="eg. 500000"
                          {...register("middlePrice", {
                            required: true,
                          })}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : this.state.elStarted ? (
              <div className="container-main">
                <div className="container-item center-items">
                  <UserHome el={this.state.elDetails} />
                </div>
              </div>
            ) : null}
            <StartEnd
              elStarted={this.state.elStarted}
              elEnded={this.state.elEnded}
              endElFn={this.endAuction}
            />
            <BiddingStatus
              elStarted={this.state.elStarted}
              elEnded={this.state.elEnded}
            />
          </form>
        </div>
      );
    };
    return <AdminHome />;
  };
}
