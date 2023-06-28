import React from "react";
import { Link } from "react-router-dom";
import Button from "react-bootstrap/Button";

const StartEnd = (props) => {
  const btn = {
    display: "block",
    padding: "21px",
    margin: "7px",
    minWidth: "max-content",
    textAlign: "center",
    width: "333px",
    alignSelf: "center",
  };
  return (
    <div className="container-main">
      {!props.elStarted ? (
        <>
          {/* edit here to display start auction Again button */}
          {!props.elEnded ? (
            <>
              <div className="container-item">
                <Button variant="success" type="submit">
                  Start Bidding {props.elEnded ? "Again" : null}
                </Button>
              </div>
            </>
          ) : (
            <div className="container-item">
              <center>
                <p>Re-deploy the contract to start auction again.</p>
                <p>
                  <Button variant="warning" type="button" disabled={true}>
                    The auction ended
                  </Button>
                </p>
              </center>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="container-item">
            <Button variant="warning" type="button" onClick={props.endElFn}>
              End
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default StartEnd;
