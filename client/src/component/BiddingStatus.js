import React from "react";
import Badge from "react-bootstrap/Badge";

const BiddingStatus = (props) => {
  const electionStatus = {
    padding: "11px",
    margin: "7px",
    width: "100%",
    border: "1px solid #009eb3",
    background: "#00BCD4",
    color: "white",
    marginLeft: "auto",
    marginRight: "auto",
    textAlign: "center",
    borderRadius: "0.5em",
    overflow: "auto",
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
    width: "977px",
  };
  return (
    <div className="container-main">
      <h3>Bidding Status</h3>
      <div style={electionStatus}>
        <p>
          Started:{" "}
          {props.elStarted ? (
            <Badge bg="success">True</Badge>
          ) : (
            <Badge bg="danger">False</Badge>
          )}
        </p>
        <p>
          Ended:{" "}
          {props.elEnded ? (
            <Badge bg="success">True</Badge>
          ) : (
            <Badge bg="danger">False</Badge>
          )}
        </p>
      </div>
    </div>
  );
};

export default BiddingStatus;
