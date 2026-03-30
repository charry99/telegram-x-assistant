import React from "react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";

interface NavbarProps {
  title: string;
  showBack?: boolean;
}

function Navbar({ title, showBack = true }: NavbarProps) {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="navbar-container">
        {showBack && (
          <button className="navbar-back" onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}
        <h1 className="navbar-title">{title}</h1>
        <div className="navbar-spacer"></div>
      </div>
    </div>
  );
}

export default Navbar;
