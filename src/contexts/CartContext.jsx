import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import BagImg from "../assets/carryBag.png";
import { useAuthContext } from "./AuthContext";

const CartContext = createContext();

export function useCartContext() {
   return useContext(CartContext);
}

export default function CartProvider({ children }) {
   const { user } = useAuthContext();

   // Initial Values
   const [cartItems, setCartItems] = useState([]);
   const [showPaymentOpts, setShowPaymentOpts] = useState(false);
   const [recieveInvoiceOpts, setRecieveInvoiceOpts] = useState([]);
   const [paymentMethod, setPaymentMethod] = useState(null);
   const [emptyCart, setEmptyCart] = useState(true);
   const [showConfirmDelete, setShowConfirmDelete] = useState(false);
   const [pointsRedeemed, setPointsRedeemed] = useState(false);
   const [forgotCarryBag, setForgotCarryBag] = useState(true);
   const [paymentInitiated, setPaymentInitiated] = useState(false);
   const [showMMRP, setShowMMRP] = useState(false);
   const [openInvoice, setOpenInvoice] = useState(false);
   const [mmrpItem, setMmrpItem] = useState(null);
   const [showTillPopup, setShowTillPopup] = useState(false);
   const [orderSummaryVals, setOrderSummaryVals] = useState({
      itemCount: 0,
      roundedDiscount: 0,
      extraDiscount: 0,
      roundedTotal: 0,
      roundedTax: 0,
      roundedGrandTotal: 0,
      pointsEarned: 0,
      pointsRedeemed: 0,
   });
   const [billDiscountApplied, setBillDiscountApplied] = useState(false);
   const [simplifiedCartItems, setSimplifiedCartItems] = useState([]);
   const [carryBagData, setCarryBagData] = useState([
      {
         productBrand: "KPMG Retail",
         productName: "Carry Bag (Small)",
         productImage: BagImg,
         productCategory: "Miscellaneous",
         quantity: 0,
         taxRate: 0,
         mrp: 5,
         sellingPrice: 5,
         extraDiscount: 0,
         billDiscount: 0,
         width: "100px",
      },
      {
         productBrand: "KPMG Retail",
         productName: "Carry Bag (Medium)",
         productImage: BagImg,
         productCategory: "Miscellaneous",
         quantity: 0,
         taxRate: 0,
         mrp: 10,
         sellingPrice: 10,
         extraDiscount: 0,
         billDiscount: 0,
         width: "150px",
      },
      {
         productBrand: "KPMG Retail",
         productName: "Carry Bag (Large)",
         productImage: BagImg,
         productCategory: "Miscellaneous",
         quantity: 0,
         taxRate: 0,
         mrp: 15,
         sellingPrice: 15,
         extraDiscount: 0,
         billDiscount: 0,
         width: "200px",
      },
   ]);
   const [itemsSelectable, setItemsSelectable] = useState(false);
   const [selectedItems, setSelectedItems] = useState([]);

   // Refs for Bill Discount Inputs
   const discPercentRef = useRef(null);
   const discAmountRef = useRef(null);

   // Fetch Cart Items
   function fetchCartItems() {
      axios
         .get("http://localhost:9021/products/allProducts")
         .then((response) => {
            const data = response.data.filter((item) => item.skuId !== 10003);

            // sample mmrp item
            setMmrpItem({
               productSerial: "PRD47001",
               skuId: 10003,
               productBrand: "Stride",
               productName: "Black Sneakers",
               productImage:
                  "https://imagescdn.thecollective.in/img/app/product/7/789565-9236010.jpg",
               productCategory: "Apparel",
               quantity: 1,
               taxRate: 12,
               mrp: 4700,
               sellingPrice: [4100, 4200, 4300],
               extraDiscount: 0,
               billDiscount: 0,
            });

            data.forEach((item) => {
               item.quantity = 1;
               item.extraDiscount = 0;
               item.billDiscount = 0;
            });

            //

            setCartItems(data.slice(0, 7).sort(() => Math.random() - 0.5));
         })
         .catch((error) => {
            console.error("Error fetching data: ", error.message);
         });
   }

   // Create Order
   function createOrder() {
      console.log("Creating order for: ");
      console.log(user.id, user.mobileNumber);

      // Simplify Cart Items for Order Creation
      const simplifiedCartItems = cartItems.map((item) => ({
         productId: item.productSerial,
         productFullName: item.productBrand + " " + item.productName,
         quantity: item.quantity,
         mrp: item.mrp,
         sellingPrice: item.sellingPrice,
         price:
            item.sellingPrice -
            (parseFloat(item.extraDiscount) + parseFloat(item.billDiscount)),
         taxRate: item.taxRate,
         extraDiscount: item.extraDiscount,
         billDiscount: item.billDiscount,
      }));
      setSimplifiedCartItems(simplifiedCartItems);

      // Create Order by posting the data to the backend
      axios
         .post("http://localhost:9021/transactions/create", {
            userId: user.id,
            encryptedMobile: user.mobileNumber,

            paymentId: 12345678,
            paymentMethod: paymentMethod,
            paymentStatus: "Successful",
            errorMessage: "NA",

            orderItems: simplifiedCartItems,
         })
         .then(() => {
            const recieveInvoiceOpts2 = recieveInvoiceOpts.join(" and ");
            toast.success(
               `Order has been created successfully! Invoice sent via ${recieveInvoiceOpts2}.`
            );
            toast(
               "Your order invoice is being printed. Please show it while exiting the store."
            );
         })
         .catch((error) => {
            console.error("Error creating order: ", error.message);
         });

      // Update stock in inventory on successfully placing an order
      // ... ------> After testing complete

      // Update Loyalty Points of User

      axios
         .post("http://localhost:9021/users/updateLp", {
            userId: user.id,
            pointsEarned: orderSummaryVals.pointsEarned,
            // Defines whether to clear the existing points or not
            hasRedeemed: pointsRedeemed,
         })
         .then(() => {
            console.log("Loyalty Points have been updated.");
         });

      return simplifiedCartItems;
   }

   // Handle Item Addition
   function handleAddItem(item) {
      const updatedCart = [...cartItems];
      updatedCart.push({
         ...item,
         quantity: 1,
         billDiscount: 0,
      });
      setCartItems(updatedCart);
   }

   // Handle Item Deletion
   function handleDeleteItem(item) {
      const updatedCart = cartItems.filter(
         (cartItem) => cartItem.productSerial !== item.productSerial
      );
      setCartItems(updatedCart);
      toast.success(
         `${item.productBrand} ${item.productName} removed from cart`
      );
   }

   // Handle Carry Bag Addition
   function handleAddCarryBag(item) {
      const updatedCart = [...cartItems];
      const updatedItemIndex = updatedCart.findIndex(
         (cartItem) => cartItem.productName === item.productName
      );

      // If item does not exist in Cart Items, add it
      if (updatedItemIndex < 0) {
         updatedCart.push({ ...item, quantity: 1 });
      } else {
         const updatedItem = {
            ...updatedCart[updatedItemIndex],
         };
         updatedItem.quantity++;
         updatedCart[updatedItemIndex] = updatedItem;
      }
      // Update the quantity of the carry bag in carryBagData
      const updatedCarryBagData = carryBagData.map((bag) =>
         bag.productName === item.productName
            ? { ...bag, quantity: bag.quantity + 1 }
            : bag
      );
      setCarryBagData(updatedCarryBagData);
      // Update the cart items
      setCartItems(updatedCart);
   }

   // Handle Carry Bag Subtraction
   function handleDeleteCarryBag(item) {
      if (
         cartItems.find((cartItem) => cartItem.productName === item.productName)
            .quantity === 1
      ) {
         handleRemoveCarryBag(item);
      } else {
         const updatedCart = cartItems.map((cartItem) =>
            cartItem.productName === item.productName
               ? { ...cartItem, quantity: cartItem.quantity - 1 }
               : cartItem
         );
         setCartItems(updatedCart);

         const updatedCarryBagData = carryBagData.map((bag) =>
            bag.productName === item.productName
               ? { ...bag, quantity: bag.quantity - 1 }
               : bag
         );
         setCarryBagData(updatedCarryBagData);
      }
   }

   // Handle Carry Bag Deletion
   function handleRemoveCarryBag(item) {
      const updatedCart = cartItems.filter(
         (cartItem) => cartItem.productName !== item.productName
      );
      setCartItems(updatedCart);

      const updatedCarryBagData = carryBagData.map((bag) =>
         bag.productName === item.productName ? { ...bag, quantity: 0 } : bag
      );
      setCarryBagData(updatedCarryBagData);
   }

   // Highlights the selected "Recieve Invoice" options
   function handleButtonClick(option) {
      if (option === "Both") {
         // If "Both" button is clicked, set recieveInvoiceOpts to an array containing both options
         if (recieveInvoiceOpts.length === 2) {
            // If both options are already selected, remove both options
            setRecieveInvoiceOpts([]);
         } else {
            // If not, add both options
            setRecieveInvoiceOpts(["WhatsApp", "SMS"]);
         }
      } else {
         // If any other button is clicked, toggle the option in the array
         setRecieveInvoiceOpts((prevOptions) => {
            if (prevOptions.includes(option)) {
               return prevOptions.filter((opt) => opt !== option);
            } else {
               return [...prevOptions, option];
            }
         });
      }
   }

   // Increment Quantity
   function incrementQuantity(productSerial) {
      const updatedCart = cartItems.map((item) =>
         item.productSerial === productSerial
            ? { ...item, quantity: item.quantity + 1 }
            : item
      );
      setCartItems(updatedCart);
   }

   // Decrement Quantity
   function decrementQuantity(productSerial) {
      const updatedCart = cartItems
         .map((item) =>
            item.productSerial === productSerial
               ? { ...item, quantity: item.quantity - 1 }
               : item
         )
         .filter((item) => item.quantity > 0);
      setCartItems(updatedCart);
   }

   // Redeem Points
   function redeemPoints(points) {
      // points value validation
      if (
         points % 1 !== 0 ||
         points <= 0 ||
         points > user.loyaltyPoints ||
         points > orderSummaryVals.roundedGrandTotal / 2
      ) {
         toast.error("Invalid loyalty points value");
         return;
      }

      // converting points to rupees
      const redemptionDiscount = parseInt(points);

      // Updating the Grand Total and Points Redeemed
      setOrderSummaryVals({
         ...orderSummaryVals,
         roundedGrandTotal:
            orderSummaryVals.roundedGrandTotal - redemptionDiscount,
         pointsRedeemed: orderSummaryVals.pointsRedeemed + redemptionDiscount,
      });

      setPointsRedeemed(true);

      // Update the Loyalty Points balance of User
      user.loyaltyPoints -= points;

      // notify the user
      toast.success(`You have successfully redeemed ${points} loyalty points.`);
   }

   // Revert back the redeemed points
   function revertPoints() {
      // add the points back to the user's loyalty points
      const val = parseInt(orderSummaryVals.pointsRedeemed);
      setOrderSummaryVals({
         ...orderSummaryVals,
         roundedGrandTotal: orderSummaryVals.roundedGrandTotal + val,
         pointsRedeemed: orderSummaryVals.pointsRedeemed - val,
      });
      user.loyaltyPoints += val;
      setPointsRedeemed(false);
   }

   // Add a rupee sign at start and add commas at thousands to value
   function renderMoney(val) {
      const newVal = parseFloat(val);
      return `₹ ${newVal.toLocaleString(undefined, {
         minimumFractionDigits: 2,
      })}`;
   }

   // Processing of the bill discount PERCENTAGE
   function handleDiscountCalcPerc(percent) {
      const totalSellingPrice = cartItems.reduce(
         (acc, item) =>
            item.productCategory === "Miscellaneous"
               ? acc
               : acc + (item.sellingPrice - item.extraDiscount),
         0
      );
      if (percent < 0 || percent > 100) {
         toast.error("Invalid percentage value");
      } else {
         const extraDiscount = roundOff(
            parseFloat((totalSellingPrice * percent) / 100)
         );
         extraDiscountDistribution(extraDiscount, totalSellingPrice);
         const roundedOffPercent = roundOff(parseFloat(percent));
         toast.success(
            `Discount of ${roundedOffPercent}% applied successfully.`
         );
      }
   }

   // Processing of the bill discount AMOUNT
   function handleDiscountCalcAmt(amount) {
      const totalSellingPrice = cartItems.reduce(
         (acc, item) =>
            item.productCategory === "Miscellaneous"
               ? acc
               : acc + (item.sellingPrice - item.extraDiscount),
         0
      );
      if (amount < 0 || amount > totalSellingPrice) {
         toast.error("Invalid discount value.");
      } else {
         const roundedOffAmount = roundOff(parseFloat(amount));
         extraDiscountDistribution(roundedOffAmount, totalSellingPrice);
         toast.success(
            `Discount of ₹${roundedOffAmount} applied successfully.`
         );
      }
   }

   // Distribute the extra discount among the cart items
   function extraDiscountDistribution(billDiscount, totalSellingPrice) {
      let updatedCartItems = [];
      let distributedDiscount = 0;

      cartItems.forEach((item, index) => {
         if (item.productCategory === "Miscellaneous") {
            updatedCartItems.push(item);
         } else {
            // Calculate discount for each item
            let itemDiscount = roundOff(
               ((item.sellingPrice - item.extraDiscount) / totalSellingPrice) *
                  billDiscount
            );

            // Ensure the last item receives the remaining discount to handle rounding errors
            if (index === cartItems.length - 1) {
               itemDiscount = roundOff(billDiscount - distributedDiscount);
            } else {
               distributedDiscount += itemDiscount;
            }

            updatedCartItems.push({
               ...item,
               billDiscount: itemDiscount,
            });
         }
      });

      setBillDiscountApplied(true);
      setCartItems(updatedCartItems);
   }

   // Round off a number to 2 decimal places
   function roundOff(val) {
      return Math.round(val * 100) / 100;
   }

   // Reset the bill discount
   function resetBillDiscount() {
      // Reset the bill discount for all the items
      const updatedCartItems = cartItems.map((item) => {
         return {
            ...item,
            billDiscount: 0,
         };
      });

      setBillDiscountApplied(false);
      setCartItems(updatedCartItems);
      toast.warning("Bill Discount has been reset.");
   }

   // Round off a number to 2 decimal places
   function roundOff(val) {
      return Math.round(val * 100) / 100;
   }

   // ---------------------------- useEffect Zone ---------------------------- //

   /*
      UseEffect - 1
         1. Set the forgotCarryBag state based on availability of any carry bags in the cart
         2. MMRP popup based on the availability of one or more MMRP items
         3. Updation of orderSummaryVals
   */
   useEffect(() => {
      // 1.
      setForgotCarryBag(
         cartItems.every((item) => item.productCategory !== "Miscellaneous")
      );

      // 2.
      if (mmrpItem !== null) {
         setShowMMRP(true);
      }

      // 3.
      const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
      const total = cartItems.reduce(
         (acc, item) => acc + item.mrp * item.quantity,
         0
      );
      const discount = cartItems.reduce(
         (acc, item) => acc + (item.mrp - item.sellingPrice) * item.quantity,
         0
      );
      const extraDiscount = cartItems.reduce(
         (acc, item) =>
            acc +
            parseFloat(item.extraDiscount) +
            parseFloat(item.billDiscount),
         0
      );
      const tax = cartItems.reduce(
         // price with tax: item.sellingPrice - (item.extraDiscount + item.billDiscount)
         // price without tax: item.sellingPrice - (item.extraDiscount + item.billDiscount) / (1 + item.taxRate / 100)
         // tax = price with tax - price without tax
         (acc, item) =>
            acc +
            ((item.sellingPrice -
               (parseFloat(item.extraDiscount) +
                  parseFloat(item.billDiscount))) *
               item.taxRate) /
               (100 + item.taxRate),
         0
      );
      const grandTotal = total - discount - extraDiscount;
      const pointsEarned = Math.floor(grandTotal / 20);

      // Round off the values to 2 decimal places
      setOrderSummaryVals({
         itemCount,
         roundedDiscount: roundOff(parseFloat(discount)),
         roundedTotal: roundOff(parseFloat(total)),
         roundedTax: roundOff(parseFloat(tax)),
         extraDiscount: roundOff(parseFloat(extraDiscount)),
         roundedGrandTotal: roundOff(parseFloat(grandTotal)),
         pointsEarned: pointsEarned,
         pointsRedeemed,
      });
   }, [cartItems]);

   /*
      UseEffect - 2
         1. Set "Empty Cart" on 0 cart items
         2. Reset the Bill Discount when an item is added or removed
   */
   useEffect(() => {
      // 1.
      setEmptyCart(cartItems.length === 0);

      // 2.
      if (billDiscountApplied) {
         // reset the bill discount the last added item is not a carry bag
         const isCarryBag =
            cartItems[cartItems.length - 1].productCategory === "Miscellaneous";
         if (!isCarryBag) {
            resetBillDiscount();
         }
      }
   }, [cartItems.length]);

   // ---------------------------- Context Values ---------------------------- //
   const contextValue = {
      // Cart Items and Carry Bags
      emptyCart,
      setEmptyCart,

      cartItems,
      setCartItems,

      carryBagData,
      setCarryBagData,

      showConfirmDelete,
      setShowConfirmDelete,

      forgotCarryBag,
      setForgotCarryBag,

      mmrpItem,
      setMmrpItem,
      showMMRP,
      setShowMMRP,
      openInvoice,
      setOpenInvoice,
      showTillPopup,
      setShowTillPopup,

      // Cart Item Functions
      handleAddItem,
      handleDeleteItem,
      handleAddCarryBag,
      handleRemoveCarryBag,
      handleDeleteCarryBag,
      handleButtonClick,
      incrementQuantity,
      decrementQuantity,
      fetchCartItems,
      renderMoney,
      roundOff,

      // Cart Summary and Loyalty Points
      orderSummaryVals,
      billDiscountApplied,
      redeemPoints,
      revertPoints,
      pointsRedeemed,
      setPointsRedeemed,
      handleDiscountCalcPerc,
      handleDiscountCalcAmt,
      resetBillDiscount,

      // Payment Options & Invoice Methods
      paymentInitiated,
      setPaymentInitiated,

      showPaymentOpts,
      setShowPaymentOpts,

      paymentMethod,
      setPaymentMethod,

      recieveInvoiceOpts,
      setRecieveInvoiceOpts,

      // Order Creation Function
      createOrder,
      simplifiedCartItems,

      // Refs
      discPercentRef,
      discAmountRef,

      // Item Selection for Discount
      itemsSelectable,
      setItemsSelectable,
      selectedItems,
      setSelectedItems,
   };

   return (
      <CartContext.Provider value={contextValue}>
         {children}
      </CartContext.Provider>
   );
}
