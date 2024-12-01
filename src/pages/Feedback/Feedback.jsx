import React, { useState } from "react";
import s from "./feedback.module.css";
import smile from "./smile.png";
import neutral from "./neutral.png";
import angry from "./angry.png";
import { useStepContext } from "../../contexts/StepContext";
import { useAuthContext } from "../../contexts/AuthContext";
import MyDocument from "../../components/Receipt/Receipt";
import axios from "axios";
import { useCartContext } from "../../contexts/CartContext";

export default function Feedback() {
   const [selectcircle, setSelectCircle] = useState(null);
   const { handleExit } = useStepContext();
   const { user } = useAuthContext();
   const { openInvoice, setOpenInvoice } = useCartContext();

   function circleSelect(imageName) {
      setSelectCircle(imageName);
   }

   function submitFeedback(selectcircle) {
      const feedbackVal =
         selectcircle === "smile" ? 3 : selectcircle === "neutral" ? 2 : 1;
      axios
         .put(`http://localhost:9021/users/feedback`, {
            userId: user.id,
            rating: feedbackVal,
         })
         .then(() => {
            console.log("Feedback rating updated successfully!");
         });

      handleExit();
   }

   // const randomFileName = Math.random().toString(36).substring(7);

   function FeedbackView() {
      return (
         <div className={s.content}>
            <div
               style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
               }}
            >
               <span style={{ fontSize: "40px" }}>Rate Your Experience</span>
               <span style={{ fontSize: "20px" }}>
                  Earn <b>10 Loyalty Points</b> for your feedback
               </span>
            </div>
            <div>
               <img
                  src={smile}
                  alt="smile"
                  onClick={() => circleSelect("smile")}
                  className={`${s.emoji} ${
                     selectcircle === "smile" && s.selected
                  }`}
               />
               <img
                  src={neutral}
                  alt="neutral"
                  onClick={() => circleSelect("neutral")}
                  className={`${s.emoji} ${
                     selectcircle === "neutral" && s.selected
                  }`}
               />
               <img
                  src={angry}
                  alt="angry"
                  onClick={() => circleSelect("angry")}
                  className={`${s.emoji} ${
                     selectcircle === "angry" && s.selected
                  }`}
               />
            </div>

            <div
               style={{
                  display: "flex",
                  flexDirection: "row",
               }}
            >
               <button
                  className={s.finalButton}
                  onClick={() => setOpenInvoice(true)}
               >
                  View Invoice
               </button>
               <button
                  className={`${s.finalButton} ${selectcircle && s.submitType}`}
                  onClick={() => {
                     selectcircle ? submitFeedback(selectcircle) : handleExit();
                  }}
               >
                  {selectcircle ? "Submit" : "Skip"} Feedback
               </button>
            </div>

            {/* Download Link */}
            {/* <PDFDownloadLink
            document={<SampleComponent />}
            fileName={`${randomFileName}.pdf`}
         >
            {() => "Download PDF"}
         </PDFDownloadLink> */}

            <div>
               <span className={s.addInfo}>
                  We would love to hear from you.{" "}
               </span>
               <span className={s.addInfo}>
                  Please reach us out at{" "}
                  <span className={s.link}>selfc.retail-feedback@kpmg.com</span>{" "}
                  for any additional feedback.
               </span>
            </div>
         </div>
      );
   }

   return <>{openInvoice ? <MyDocument /> : <FeedbackView />}</>;
}
