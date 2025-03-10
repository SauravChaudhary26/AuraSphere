import React from "react";
import { NavLink } from "react-router-dom";
import "./css/Error.css";

const Error = () => {
   return (
      <div id="notfound">
         <div className="notfound">
            <div className="notfound-404">
               <h1>404</h1>
            </div>
            <h2>We are sorry, Page not found!</h2>
            <p>
               The page you are looking for might have been removed had its name
               changed or is temporarily unavailable.
            </p>
            <NavLink to="/dashboard">Back To Homepage</NavLink>
         </div>
      </div>
   );
};

export default Error;
