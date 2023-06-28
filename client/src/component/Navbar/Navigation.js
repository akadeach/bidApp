import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";

import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <NavLink to="/" className="header">
        <FontAwesomeIcon icon={faHouse} /> Home
      </NavLink>
      <ul
        className="navbar-links"
        style={{ width: "35%", transform: open ? "translateX(0px)" : "" }}
      >
        <li>
          <NavLink to="/Registration" activeClassName="nav-active">
            <i className="far fa-registered" /> Registration
          </NavLink>
        </li>
        <li>
          <NavLink to="/Bidding" activeClassName="nav-active">
            <i className="fas fa-vote-yea" /> Bidding
          </NavLink>
        </li>
        <li>
          <NavLink to="/Results" activeClassName="nav-active">
            <i className="fas fa-poll-h" /> Results
          </NavLink>
        </li>
      </ul>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
