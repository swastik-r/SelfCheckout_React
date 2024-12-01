import UPI from "./UPI";
import Card from "./Card";
import { useCartContext } from "../../contexts/CartContext";
import { useStepContext } from "../../contexts/StepContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useRef } from "react";
import OtpInput from "react-otp-input";
import OrderSummary from "../Cart/OrderSummary";
import "./Payment.css";
import { toast } from "react-toastify";

export default function Payment() {
   const { paymentMethod, pointsRedeemed, orderSummaryVals } = useCartContext();
   const [paymentInitiated, setPaymentInitiated] = useState(false);
   const [otp, setOtp] = useState(false);

   return (
      <>
         {otp && <OtpPopup setOtp={setOtp} />}

         <div className="cart-container">
            <div className="payment-left">
               {paymentMethod === "UPI" && paymentInitiated ? (
                  <UPI />
               ) : paymentMethod === "Debit/Credit Card" && paymentInitiated ? (
                  <Card />
               ) : (
                  <>
                     <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>
                        Cart Summary
                     </span>
                     <div>
                        <span style={{ fontSize: "1.2em" }}>
                           You will earn{" "}
                           <span
                              style={{
                                 color: "rgb(0,0,255)",
                                 fontWeight: "bold",
                              }}
                           >
                              {orderSummaryVals.pointsEarned}
                           </span>{" "}
                           Loyalty Points on this purchase
                        </span>
                     </div>

                     <OrderSummary />

                     <LPRedemption
                        pointsRedeemed={pointsRedeemed}
                        setOtp={setOtp}
                     />
                  </>
               )}
            </div>
            <div className="payment-right">
               <PaymentOpts
                  pointsRedeemed={pointsRedeemed}
                  paymentInitiated={paymentInitiated}
                  setPaymentInitiated={setPaymentInitiated}
               />
            </div>
         </div>
      </>
   );
}

function OtpPopup({ setOtp }) {
   const [otpValue, setOtpValue] = useState("");
   const { user, setOtpVerified } = useAuthContext();

   function handleOtpVerification() {
      if (otpValue !== "0047") {
         toast.error("Invalid OTP");
         return;
      }
      toast.success("OTP Verified");
      setOtp(false);
      setOtpVerified(true);
   }

   return (
      <div className="popupContainer">
         <div className="popup-outer" style={{ width: "50%", height: "50%" }}>
            <div
               className="popup-inner"
               style={{ justifyContent: "space-evenly" }}
            >
               <span style={{ fontSize: "1.5em", fontWeight: "bold" }}>
                  Enter OTP
               </span>
               <span style={{ color: "grey" }}>
                  Please enter the OTP sent to <b>{user.mobileNumber}</b>
               </span>

               <OtpInput
                  value={otpValue}
                  onChange={setOtpValue}
                  numInputs={4}
                  separator={<span>-</span>}
                  renderInput={(inputProps) => {
                     return (
                        <input
                           {...inputProps}
                           style={{
                              width: "40px",
                              height: "40px",
                              fontSize: "1.5em",
                              margin: "10px",
                              textAlign: "center",
                              backgroundColor: "transparent",
                              border: "1px solid grey",
                              borderRadius: "10px",
                              color: "black",
                           }}
                        />
                     );
                  }}
               />

               <button
                  style={{
                     backgroundColor: "transparent",
                     color: "black",
                     border: "none",
                     fontSize: "0.8em",
                     padding: "2px",
                     cursor: "pointer",
                  }}
                  onClick={() => {
                     // Resend OTP
                     toast.success("OTP Sent Successfully");
                  }}
               >
                  Resend OTP
               </button>

               {/* Buttons */}
               <div
                  style={{
                     width: "50%",
                     margin: "20px",
                     display: "flex",
                     justifyContent: "space-between",
                  }}
               >
                  {/* Cancel Button */}
                  <button
                     style={{
                        backgroundColor: "transparent",
                        color: "black",
                        border: "1px solid black",
                     }}
                     onClick={() => {
                        setOtp(false);
                     }}
                  >
                     Cancel
                  </button>

                  {/* Submit Button */}
                  <button
                     onClick={() => {
                        handleOtpVerification();
                     }}
                  >
                     Submit
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

function PaymentOpts({ paymentInitiated, setPaymentInitiated }) {
   const { setPaymentMethod, paymentMethod } = useCartContext();
   const { handlePrev } = useStepContext();
   const paymentOpts = [
      {
         name: "Debit/Credit Card",
         disabled: false,
      },
      {
         name: "UPI",
         disabled: false,
      },
      {
         name: "Gift Card",
         disabled: true,
      },
   ];

   return (
      <>
         <div className="payment-opts">
            {/* Map the payment options */}
            {paymentOpts.map((opt) => (
               <PayOptTile
                  key={opt.name}
                  opt={opt}
                  isSelected={paymentMethod === opt.name}
                  onClick={() => setPaymentMethod(opt.name)}
                  disabled={opt.disabled || paymentInitiated}
               />
            ))}
            <div>
               {/* Button: Back to Cart */}
               <button
                  style={{ margin: "10px" }}
                  onClick={() => {
                     handlePrev();
                  }}
                  disabled={paymentInitiated}
               >
                  Back to Cart
               </button>

               {/* Button: Proceed to Pay */}
               <button
                  style={{ margin: "10px" }}
                  onClick={() => setPaymentInitiated(!paymentInitiated)}
                  disabled={!paymentMethod || paymentInitiated}
               >
                  Proceed to Pay
               </button>
            </div>
         </div>
      </>
   );
}

function PayOptTile({ opt, isSelected, onClick, disabled }) {
   return (
      <label
         className={`pay-opt-button ${isSelected ? "highlighted slow" : ""}`}
         style={{
            opacity: disabled ? "0.5" : "1",
            cursor: disabled ? "not-allowed" : "pointer",
         }}
      >
         <input
            type="radio"
            name="paymentOption"
            value={opt.name}
            checked={isSelected}
            onChange={onClick}
            style={{ display: "none" }}
            disabled={disabled}
         />
         <span style={{ fontSize: "17px", fontWeight: "600" }}>{opt.name}</span>
         {/* {!isSelected && (
            <span
               style={{
                  color: "black",
                  fontSize: "13px",
                  textAlign: "center",
               }}
            >
               {offer}
            </span>
         )} */}
      </label>
   );
}

function LPRedemption({ pointsRedeemed, setOtp }) {
   const { user, isGuest, otpVerified } = useAuthContext();
   const { orderSummaryVals, redeemPoints, revertPoints } = useCartContext();
   const lpValRef = useRef(null);

   return (
      // render only if user is not a guest
      !isGuest &&
      orderSummaryVals.roundedGrandTotal > 0 && (
         <div className="lp-redemption-container">
            <div className="lp-details">
               <span>
                  Loyalty Points Available:{" "}
                  <strong>{user.loyaltyPoints}</strong>
               </span>
               {!otpVerified && (
                  <button
                     disabled={orderSummaryVals.roundedGrandTotal < 0}
                     onClick={() => {
                        toast.success("OTP Sent Successfully!");
                        setOtp(true);
                     }}
                  >
                     Verify OTP to Redeem
                  </button>
               )}
            </div>

            {otpVerified && (
               <>
                  <div
                     style={{
                        width: "70%",
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-evenly",
                        marginBottom: "20px",
                     }}
                  >
                     {/* Create a radio button selection to redeem custom number of loyalty points or all */}
                     <input
                        className="redeemInput"
                        ref={lpValRef}
                        placeholder="Enter Redeem Points"
                        disabled={pointsRedeemed}
                     />
                     <span style={{ margin: "5px" }}>or</span>
                     <button
                        onClick={() => {
                           lpValRef.current.value = user.loyaltyPoints;
                        }}
                        disabled={pointsRedeemed}
                     >
                        Use All Points
                     </button>
                  </div>
                  <button
                     className={`redeem-button ${
                        pointsRedeemed ? "cancel" : "redeem"
                     }`}
                     onClick={() => {
                        pointsRedeemed
                           ? revertPoints()
                           : redeemPoints(lpValRef.current.value);
                     }}
                     disabled={orderSummaryVals.roundedGrandTotal === 0}
                  >
                     {pointsRedeemed ? "Cancel Redemption" : "Redeem"}
                  </button>
               </>
            )}
         </div>
      )
   );
}
