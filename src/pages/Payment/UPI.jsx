import QRCode from "react-qr-code";
import "./Payment.css";
import { useStepContext } from "../../contexts/StepContext";
import { useCartContext } from "../../contexts/CartContext";

export default function Card() {
   const { handlePrev, handleNext } = useStepContext();
   const {
      createOrder,
      orderSummaryVals,
      renderMoney,
      paymentInitiated,
      setPaymentInitiated,
   } = useCartContext();

   // upi://pay?pa=&pn=&am=&cu=&tn=
   // where:
   // pa = Payee address or business virtual payment address (VPA).
   // pn = Payee name or business name.
   // am = Transaction amount.
   // cu = Currency Code.
   // tn = Transaction note.
   let upi = {
      pa: "swastikrai2000@okicici",
      pn: "KPMG Retail Store",
      tn: "Payment for your order at KPMG Retail Store",
      am: orderSummaryVals.roundedGrandTotal.toString(),
      cu: "INR",
   };
   let upiLink = new URLSearchParams(upi).toString();
   upiLink = "upi://pay?" + upiLink;

   return (
      <>
         <span style={{ fontSize: "1.3rem" }}>
            To pay: <b>{renderMoney(orderSummaryVals.roundedGrandTotal)}</b>
         </span>
         <span className="paymentHeading">
            <span className="boldText">Scan </span> the{" "}
            <span className="boldText">QR Code</span> and complete the payment
         </span>
         <div className="paymentContent">
            <div className="upiQrDiv">
               <QRCode
                  value={upiLink}
                  onClick={() => {
                     createOrder();
                     handleNext();
                  }}
                  title="UPI QR Code"
                  size={350}
               />
            </div>
         </div>
         <button
            onClick={() => {
               setPaymentInitiated(!paymentInitiated), handlePrev();
            }}
            style={{ backgroundColor: "darkred", color: "white" }}
         >
            Cancel Payment
         </button>
      </>
   );
}
