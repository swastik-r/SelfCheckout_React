import "./UserDetailsBar.css";
import { useAuthContext } from "../../contexts/AuthContext";
// import { FaDotCircle } from "react-icons/fa";

export default function UserDetailsBar() {
   const { user, manager, isGuest, tillAccess } = useAuthContext();

   // function getTier() {
   //    if (user.loyaltyPoints > 3000) {
   //       return "Platinum";
   //    } else if (user.loyaltyPoints > 2000) {
   //       return "Gold";
   //    } else if (user.loyaltyPoints > 1000) {
   //       return "Silver";
   //    } else {
   //       return "Bronze";
   //    }
   // }

   // function getTierColor() {
   //    if (user.loyaltyPoints > 3000) {
   //       return "#FFFFFF"; // white
   //    } else if (user.loyaltyPoints > 2000) {
   //       return "#FFD700"; // gold
   //    } else if (user.loyaltyPoints > 1000) {
   //       return "#C0C0C0"; // silver
   //    } else {
   //       return "#CD7F3F"; // bronze
   //    }
   // }

   function CustomerDetails() {
      return (
         <div className="user-info">
            <span>{user.mobileNumber}</span>
            <span>{user.name}</span>
            {!isGuest && (
               <div>
                  <span>
                     {user.loyaltyPoints}&nbsp;
                     <span style={{ fontWeight: "300" }}>
                        Loyalty Points&nbsp;
                     </span>
                  </span>
                  {/* <span>&nbsp;({getTier()}&nbsp;</span>
                  <div
                     style={{
                        color: getTierColor(),
                        marginTop: "6px",
                     }}
                  >
                     &nbsp;
                     <FaDotCircle size={20} />
                  </div>
                  ) */}
               </div>
            )}
         </div>
      );
   }

   function ManagerDetails() {
      return (
         <div className="user-info till-access">
            <span>
               <span style={{ fontWeight: "300" }}>Name - </span> {manager.name}
            </span>
            <span>
               <span style={{ fontWeight: "300" }}>User ID - </span>{" "}
               {manager.username}
            </span>
         </div>
      );
   }

   return tillAccess ? <ManagerDetails /> : <CustomerDetails />;
}
