import React from "react";
import Alert from "react-bootstrap/Alert";

function UserHome(props) {
  return (
    <div className="container-list title">
      <h1>Bidding Title : {props.el.auctionTitle}</h1>
      <br />
      <h3>
        <center>Organization : {props.el.organizationTitle}</center>
      </h3>
      {props.el.isAdmin === "true" ? (
        <table style={{ marginTop: "21px" }}>
          <tr>
            <th>admin</th>
            <td>
              {props.el.adminName} ({props.el.adminTitle})
            </td>
          </tr>
          <tr>
            <th>contact</th>
            <td style={{ textTransform: "none" }}>{props.el.adminEmail}</td>
          </tr>
        </table>
      ) : null}
      <table style={{ marginTop: "21px" }}>
        <tr>
          <th>Job details</th>
          <td>{props.el.auctionDetail}</td>
        </tr>
      </table>
      {["success"].map((variant) => (
        <Alert key={variant} variant={variant}>
          <center>The Bidding started.</center>
        </Alert>
      ))}
    </div>
  );
}

export default UserHome;
