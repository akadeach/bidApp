import React from "react";
import Alert from "react-bootstrap/Alert";

function BiddingJobTitle(props) {
  return (
    <div className="container-list title">
      <h1>Bidding Title : {props.el.auctionTitle}</h1>
      <br />
      <h3>
        <center>Organization : {props.el.organizationTitle}</center>
      </h3>
      <h5 style={{ color: "teal" }}>Job details:</h5>
      <p>
        {props.el.auctionDetail}
      </p>
    </div>
  );
}

export default BiddingJobTitle;
