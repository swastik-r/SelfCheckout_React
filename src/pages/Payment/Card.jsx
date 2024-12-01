import machineImg from "./card-machine.jpg";
import "./Payment.css";
import { useCartContext } from "../../contexts/CartContext";
import { useStepContext } from "../../contexts/StepContext";

export default function Card() {
   const { handleNext } = useStepContext();
   const { createOrder, orderSummaryVals, renderMoney } = useCartContext();

   return (
      <>
         <span style={{ fontSize: "1.3rem" }}>
            To pay: <b>{renderMoney(orderSummaryVals.roundedGrandTotal)}</b>
         </span>
         <span className="paymentHeading">
            <span className="boldText">Insert, Swipe or Tap</span> your{" "}
            <span className="boldText">Credit / Debit Card</span> on the Card
            Machine
         </span>
         <div className="paymentContent">
            <img
               onClick={() => {
                  createOrder();
                  handleNext();
               }}
               className="machineImg"
               src={machineImg}
               alt="Card Machine"
            />
         </div>
      </>
   );
}
