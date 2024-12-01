import styles from "./Header.module.css";
import kpmgLogo from "../../assets/KPMG_logo.svg";
// import samsungLogo from "../../assets/samsung_wordmark.svg";
import { IoMdLogOut } from "react-icons/io";
import ProgressBar from "../ProgressBar/ProgressBar";
import DateTime from "../DateTime";
import UserDetailsBar from "../UserDetailsBar/UserDetailsBar";
import { useStepContext } from "../../contexts/StepContext";
import { useAuthContext } from "../../contexts/AuthContext";

export default function Header() {
   const { step, handleExit } = useStepContext();
   const { tillAccess, setTillAccess } = useAuthContext();

   return (
      <>
         <div className={styles.header}>
            {/* <img src={samsungLogo} alt="logo" style={{ width: "150px" }} /> */}
            <img src={kpmgLogo} alt="logo" style={{ width: "150px" }} />
            <ProgressBar />
            <DateTime />
            {step !== 0 && step !== 5 && !tillAccess && (
               <button
                  style={{
                     backgroundColor: "darkred",
                  }}
                  onClick={() => {
                     handleExit();
                  }}
               >
                  EXIT
               </button>
            )}
            {tillAccess && (
               <button
                  style={{
                     backgroundColor: "darkred",
                  }}
                  onClick={() => setTillAccess(false)}
               >
                  <div
                     style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                     }}
                  >
                     <span style={{ marginRight: "10px" }}>Logout</span>
                     <IoMdLogOut size={20} />
                  </div>
               </button>
            )}
         </div>

         {/* Don't Show UserDetailsBar when step=0 or 1  */}
         {step > 1 && <UserDetailsBar />}
      </>
   );
}
