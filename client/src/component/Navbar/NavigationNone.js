import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse } from '@fortawesome/free-solid-svg-icons'

import "./Navbar.css";

export default function NavbarNone() {
  const [open, setOpen] = useState(false);
  return (
    <nav>
      <NavLink to="/" className="header">
        <FontAwesomeIcon icon={faHouse} /> Home
      </NavLink>
      <i onClick={() => setOpen(!open)} className="fas fa-bars burger-menu"></i>
    </nav>
  );
}
