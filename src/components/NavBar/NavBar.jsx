import React from "react";
import { Link } from "react-router-dom";
import "./NavBar.css"

const NavBar = () => {

    return (
        <nav>
            <Link to="/">
                <img src="/logoletras.webp" alt="" />
            </Link>
            <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/hub">Casos</Link></li>
                <li><Link to="/login"><b>Ingresar</b></Link></li>
            </ul>
        </nav>
    );
}   


export default NavBar;