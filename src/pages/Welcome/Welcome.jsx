import "./welcomeStyles.css";
// import WelcomeIMG from "./welcomeImg.jpg";
import WelcomeIMG from "./welcomeImg2.jpg";
import { Link } from "react-router-dom";

export default function Welcome() {
   return (
      <div className="screen">
         <div className="left-div">
            <div className="heading">
               <div className="heading-data">
                  <span className="heading-text">Self Checkout</span>
                  <span className="subheading">
                     For an effortless shopping experience
                  </span>
               </div>
               <Link to="/login">
                  <button className="button-29-go">Go</button>
               </Link>
            </div>
         </div>
         <div className="right-div">
            <img className="welcome-img" src={WelcomeIMG} alt="" />
         </div>
      </div>
   );
}
