import { useCartContext } from "../../contexts/CartContext";
import "./Input.css";
import { forwardRef } from "react";

const Input = forwardRef(({ labelString }, ref) => {
   function generateLabelChars(string) {
      return Array.from(string).map((char, index) => (
         <span className="label-char" key={index} style={{ "--index": index }}>
            {char}
         </span>
      ));
   }

   const inputString = labelString;
   const labelChars = generateLabelChars(inputString);
   const { pointsRedeemed } = useCartContext();

   return (
      <div className="wave-group">
         <input
            ref={ref}
            required
            type="text"
            className="input"
            disabled={pointsRedeemed}
         />
         <span className="bar"></span>
         <label className="label">{labelChars}</label>
      </div>
   );
});

export default Input;
