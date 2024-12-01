import "./cartStyles.css";
import CartImg from "./assets/cartImg.gif";
import SupportImage from "./assets/supportImage.gif";
import BagImg from "../../assets/carryBag.jpeg";
import Barcode from "../../assets/barcode.png";
import OrderSummary from "./OrderSummary";
import Input from "../../components/Input/Input";
import axios from "axios";
import { BsFillBagPlusFill } from "react-icons/bs";
import { RxCross1 } from "react-icons/rx";
import { RiArrowDownSLine } from "react-icons/ri";
import { useStepContext } from "../../contexts/StepContext";
import { useCartContext } from "../../contexts/CartContext";
import { useAuthContext } from "../../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { MdOutlineSms } from "react-icons/md";
import { FcManager } from "react-icons/fc";
import { toast } from "react-toastify";

// Primary Component for Cart Page

export default function Cart() {
   const {
      emptyCart,
      fetchCartItems,
      cartItems,
      handleDeleteItem,
      forgotCarryBag,
      showMMRP,
   } = useCartContext();
   const { user, tillAccess } = useAuthContext();

   // State for pop-ups
   const [tillPopup, setTillPopup] = useState(false);
   const [openCarryBag, setOpenCarryBag] = useState(false);
   const [showIdSearch, setShowIdSearch] = useState(false);
   const [showBillDiscount, setShowBillDiscount] = useState(false);

   // Handle down arrow button click to scroll
   const itemListRef = useRef(null);
   function handleArrowDownClick() {
      if (itemListRef.current) {
         itemListRef.current.scrollTop += 400;
      }
   }

   // Item Deletion Pop-up
   const [itemToDelete, setItemToDelete] = useState(null);
   function showConfirmDeletePopup(item) {
      setItemToDelete(item);
   }

   // Show Image of the Product and its details
   const [showDetailsItem, setShowDetailsItem] = useState(null);
   function handleShowDetails(item) {
      setShowDetailsItem(item);
   }

   return (
      <>
         <div className="cart-container">
            {/* Manager Button */}
            {!tillAccess && (
               <button
                  className="tillButton"
                  onClick={() => setTillPopup(true)}
               >
                  <FcManager size={50} />
               </button>
            )}

            {/* Manager Authentication Popup */}
            {tillPopup && <TillPopup setTillPopup={setTillPopup} />}

            {/* Confirm Delete Pop-up */}
            {itemToDelete && (
               <ConfirmDeleteItem
                  item={itemToDelete}
                  handleDeleteItem={handleDeleteItem}
                  setItemToDelete={setItemToDelete}
               />
            )}

            {/* Show Product Details */}
            {showDetailsItem && (
               <ShowDetails
                  item={showDetailsItem}
                  setShowDetailsItem={setShowDetailsItem}
               />
            )}

            {/* Product Search Pop-up */}
            {showIdSearch && (
               <IdSearchPopup setShowIdSearch={setShowIdSearch} />
            )}

            {/* Bill Discount Pop-up */}
            {showBillDiscount && (
               <BillDiscountPopup setShowBillDiscount={setShowBillDiscount} />
            )}

            {/* Show MMRP Pop-up */}
            {showMMRP && <MMRPInput />}

            {/* Carry Bag Pop-ups */}
            {openCarryBag && forgotCarryBag && (
               <CarryBagPopup
                  setOpenCarryBag={setOpenCarryBag}
                  title={"Forgot to add Carry Bag(s)?"}
                  buttonText="Skip"
               />
            )}
            {openCarryBag && !forgotCarryBag && (
               <CarryBagPopup
                  setOpenCarryBag={setOpenCarryBag}
                  title={"Need Carry Bag(s)?"}
                  buttonText="Proceed to Payment"
               />
            )}

            {/* Cart Left */}
            <div className={"cart-left" + (emptyCart ? " empty" : "")}>
               {/* Product Search Button */}
               {/* {tillAccess && (
                  <div className="manager-opts">
                     <button
                        className="manager-opt-button"
                        onClick={() => setShowIdSearch(true)}
                     >
                        <div
                           style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                           }}
                        >
                           <FaSearch size={15} />
                           <span style={{ marginLeft: "10px" }}>
                              Search a Product
                           </span>
                        </div>
                     </button>
                  </div>
               )} */}

               {/* List of Cart Items */}
               <div className="item-list" ref={itemListRef}>
                  {cartItems.map((item) => (
                     <ProductTile
                        key={item.productSerial}
                        item={item}
                        showConfirmDelete={showConfirmDeletePopup}
                        handleShowDetails={handleShowDetails}
                     />
                  ))}

                  {cartItems.length > 5 && (
                     <div
                        className="down-arrow-container"
                        onClick={handleArrowDownClick}
                     >
                        <RiArrowDownSLine className="down-arrow-icon" />
                     </div>
                  )}
               </div>

               {/* Empty Cart Display*/}
               {emptyCart && (
                  <div className="empty-cart" onClick={fetchCartItems}>
                     <span style={{ fontSize: "27px" }}>
                        Welcome {user.name}
                     </span>
                     <span>
                        to the Self-Checkout Kiosk @{" "}
                        <span style={{ fontWeight: "600" }}>
                           KPMG Retail, CyberHub
                        </span>
                     </span>
                     <img
                        style={{ height: "70%" }}
                        src={CartImg}
                        alt="add-to-basket"
                     />
                     <span>
                        Your cart is <b>empty</b>. Please <b>scan</b> items
                        using the barcode scanner.
                     </span>
                  </div>
               )}
            </div>

            {/* Cart Summary */}
            <div className="cart-right">
               {/* Render OrderDetails when tillAccess is false */}
               {!tillAccess && (
                  <OrderDetails setOpenCarryBag={setOpenCarryBag} />
               )}
               {/* Render BillDiscountPopup when tillAccess is true */}
               {tillAccess && <ManagerAccess />}
            </div>
         </div>
      </>
   );
}

// Cart Components

function ProductTile({ item, showConfirmDelete, handleShowDetails }) {
   // STATES and CONSTS
   const sumDiscount =
      parseFloat(item.extraDiscount) + parseFloat(item.billDiscount);
   const { roundOff, itemsSelectable, selectedItems, setSelectedItems } =
      useCartContext();
   const selected = selectedItems.includes(item);

   // FUNCTION
   function selectItemForDiscount(item) {
      if (itemsSelectable) {
         // if item is already in selectedItems, remove it
         // else, add it to selectedItems
         if (selectedItems.includes(item)) {
            setSelectedItems(selectedItems.filter((i) => i !== item));
         } else {
            setSelectedItems([...selectedItems, item]);
         }
      }
   }

   return (
      <div
         className={`product-tile ${selected && "pt-selected"}`}
         onClick={() => selectItemForDiscount(item)}
      >
         {/* Item's Product Image */}
         <div className="detail-1" onClick={() => handleShowDetails(item)}>
            <img src={item.productImage} alt="product-image" />
         </div>

         {/* Item's Brand Name and Product Name */}
         <div className="detail-3">
            <div>
               {/* Product Brand */}
               <div className="brand-name">{item.productBrand}</div>
               {/* Product Name */}
               <div className="product-name">{item.productName}</div>
            </div>

            {item.productCategory === "Miscellaneous" ? (
               // Carry Bag count
               <div className="cb-count">
                  COUNT <b>{item.quantity}</b>
               </div>
            ) : (
               // Item's Serial Number
               <div className="product-serial">
                  ID <b>{item.productSerial}</b>
               </div>
            )}
         </div>

         {/* Item's Price and Discount */}
         <div className="detail-4">
            <div>
               {/* Price */}
               <div className="product-price">₹ {item.sellingPrice}</div>

               {/* Discount Percentage */}
               {item.mrp - item.sellingPrice > 0 && (
                  <div style={{ display: "flex" }}>
                     <div className="mrp">₹ {item.mrp}</div>
                     <div className="discount">
                        {Math.round(
                           ((item.mrp - item.sellingPrice) * 100) / item.mrp
                        )}
                        % OFF
                     </div>
                  </div>
               )}
            </div>

            {/* Bill Discount */}
            {sumDiscount > 0 && (
               <div className="extra-discount">
                  Additional Discount: <b>{roundOff(sumDiscount)}</b>
               </div>
            )}
         </div>

         {/* Delete Item */}
         <div className="detail-6">
            <button
               className="delete-button"
               onClick={() => showConfirmDelete(item)}
            >
               {/* Icon: delete-outline */}
               <RxCross1 size={20} />
            </button>
         </div>
      </div>
   );
}

function OrderDetails({ setOpenCarryBag }) {
   const { emptyCart, recieveInvoiceOpts, handleButtonClick, forgotCarryBag } =
      useCartContext();
   const { handleNext } = useStepContext();
   const { tillAccess } = useAuthContext();

   return (
      <>
         <OrderSummary />

         {!tillAccess && (
            <>
               {/* Invoice Receiving Option */}
               <div className="misc-div">
                  <span style={{ fontWeight: "500", fontSize: "large" }}>
                     Receive invoice on<span style={{ color: "red" }}>*</span>
                  </span>
                  <div className="notif-buttons-1">
                     <button
                        disabled={emptyCart}
                        className={`notif-button ${
                           recieveInvoiceOpts.includes("WhatsApp") &&
                           recieveInvoiceOpts.length === 1 &&
                           "selected"
                        }`}
                        onClick={() => handleButtonClick("WhatsApp")}
                     >
                        <div
                           style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                           }}
                        >
                           <FaWhatsapp size={20} />
                           <span style={{ marginLeft: "10px" }}>WhatsApp</span>
                        </div>
                     </button>
                     <button
                        disabled={emptyCart}
                        // if recieveInvoiceOpts includes SMS and does not include WhatsApp, include the selected class
                        className={`notif-button ${
                           recieveInvoiceOpts.includes("SMS") &&
                           recieveInvoiceOpts.length === 1 &&
                           "selected"
                        }`}
                        onClick={() => handleButtonClick("SMS")}
                     >
                        <div
                           style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                           }}
                        >
                           <MdOutlineSms size={20} />
                           <span style={{ marginLeft: "10px" }}>SMS</span>
                        </div>
                     </button>
                  </div>
                  <div className="notif-buttons-2">
                     <button
                        disabled={emptyCart}
                        className={`notif-button ${
                           recieveInvoiceOpts.includes("WhatsApp") &&
                           recieveInvoiceOpts.includes("SMS") &&
                           recieveInvoiceOpts.length === 2 &&
                           "selected"
                        }`}
                        onClick={() => handleButtonClick("Both")}
                     >
                        <div
                           style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                           }}
                        >
                           <span style={{ marginRight: "10px" }}>Both</span>
                           <FaWhatsapp size={20} />
                           <span style={{ margin: "0 10px" }}>and</span>
                           <MdOutlineSms size={20} />
                        </div>
                     </button>
                  </div>
               </div>

               {/* Carry Bag Selection */}
               <div className="misc-div">
                  <span style={{ fontWeight: "500", fontSize: "large" }}>
                     Need a Carry Bag?
                  </span>
                  <button
                     disabled={emptyCart}
                     // if forgotCarryBag is false, include the selected class
                     className={`notif-button ${!forgotCarryBag && "selected"}`}
                     onClick={() => {
                        setOpenCarryBag(true);
                     }}
                  >
                     <div
                        style={{
                           display: "flex",
                           alignItems: "center",
                           justifyContent: "center",
                        }}
                     >
                        <BsFillBagPlusFill size={25} />
                     </div>
                  </button>
               </div>

               <button
                  disabled={emptyCart || !recieveInvoiceOpts.length}
                  style={{
                     padding: "20px 25px",
                     fontSize: "20px",
                  }}
                  onClick={() => {
                     if (forgotCarryBag) {
                        setOpenCarryBag(true);
                     } else {
                        handleNext();
                     }
                  }}
               >
                  Proceed to Payment
               </button>
            </>
         )}
      </>
   );
}

// Miscellaneous Components

function IdSearchPopup({ setShowIdSearch }) {
   const [searchId, setSearchId] = useState("");
   const [suggestions, setSuggestions] = useState([]);
   const [product, setProduct] = useState(null);
   const [showDiscountAmountPopup, setShowDiscountAmountPopup] =
      useState(false);
   const [showDiscountPercentagePopup, setShowDiscountPercentagePopup] =
      useState(false);
   const { cartItems, handleAddItem } = useCartContext();

   // Search for Product by ID
   useEffect(() => {
      async function searchProducts() {
         try {
            const response = await axios.get(
               `http://localhost:9021/products/searchByProductSerial/${searchId}`
            );
            const filteredProducts = response.data.filter(
               (product) =>
                  !cartItems.some(
                     (cartItem) =>
                        cartItem.productSerial === product.productSerial
                  )
            );
            setSuggestions(filteredProducts.slice(0, 3));
         } catch (error) {
            console.error("Error fetching product details:", error);
         }
      }

      if (searchId.trim() === "") {
         setSuggestions([]);
      } else {
         searchProducts();
      }
   }, [searchId]);

   // Component: Suggestion Tab
   function SuggestionTab({ product }) {
      return (
         <div
            style={{
               display: "flex",
               alignItems: "center",
               width: "600px",
               height: "100px",
               padding: "20px",
            }}
         >
            <img
               style={{
                  width: "100px",
                  height: "100px",
                  marginRight: "10px",
               }} // Add margin for spacing
               src={product.productImage}
               alt="product-image"
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
               <span style={{ marginBottom: "5px" }}>
                  {product.productBrand + " " + product.productName}
               </span>
               <span style={{ fontWeight: "600", marginBottom: "5px" }}>
                  ₹ {product.sellingPrice}
               </span>
               <div className="product-serial">
                  ID <b>{product.productSerial}</b>
               </div>
            </div>
            <button
               style={{ marginLeft: "auto" }}
               onClick={() => {
                  setProduct(product);
               }}
            >
               SELECT
            </button>
         </div>
      );
   }

   function DiscountPopupAmount({ product }) {
      const [discountVal, setDiscountVal] = useState("");

      function applyDiscount() {
         if (discountVal > 0 && discountVal <= product.sellingPrice) {
            product.extraDiscount = parseFloat(discountVal).toFixed(2);
            setProduct({ ...product });
            console.log(product);
            handleAddItem(product);
            setShowIdSearch(false);
            toast.success(
               "Discount of ₹" +
                  product.extraDiscount +
                  " applied on " +
                  product.productName +
                  " successfully"
            );
         } else {
            toast.error("Please enter a valid discount amount");
         }
      }

      // To show modifed selling price after discount
      const [modPrice, setModPrice] = useState(product.sellingPrice);
      // PREVIEW: Discounted Price
      useEffect(() => {
         if (discountVal >= 0 && discountVal <= product.sellingPrice) {
            setModPrice(product.sellingPrice - discountVal);
         } else {
            setModPrice("Invalid Discount Amount");
         }
      }, [discountVal]);

      return (
         <div
            className="popupContainer"
            onClick={() => setShowDiscountAmountPopup(false)}
         >
            <div
               className="popup-outer"
               style={{ width: "50%", height: "70%" }}
               onClick={(event) => event.stopPropagation()}
            >
               <div className="popup-inner">
                  {/* Popup Header */}
                  <div className="header-items">
                     <span style={{ fontSize: "1.25rem" }}>
                        Discount for {product.productName}
                     </span>
                     <RxCross1
                        size={30}
                        onClick={() => setShowDiscountAmountPopup(false)}
                        style={{ cursor: "pointer" }}
                     />
                  </div>

                  {/* Popup Content */}
                  <div
                     style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                     }}
                  >
                     {/* Show Product Image */}
                     <img
                        style={{
                           width: "200px",
                           height: "200px",
                           marginBottom: "20px",
                        }}
                        src={product.productImage}
                        alt="product-image"
                     />

                     {/* Prices Division */}
                     <div
                        style={{
                           width: "100%",
                           display: "flex",
                           flexDirection: "row",
                           justifyContent: "space-evenly",
                        }}
                     >
                        <div
                           style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                           }}
                        >
                           <b>MRP</b>
                           <span>{product.mrp}</span>
                        </div>

                        <div
                           style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                           }}
                        >
                           <b>Selling Price after discount</b>
                           <span>{modPrice}</span>
                        </div>
                     </div>

                     {/* Discount Amount */}
                     <div
                        style={{
                           display: "flex",
                           justifyContent: "space-evenly",
                           width: "100%",
                        }}
                     >
                        {/* Input for entering discount amount or percentage to be applied on Product's MRP */}
                        <input
                           className="search-input"
                           style={{ width: "150px" }}
                           type="value"
                           value={discountVal}
                           onChange={(e) => setDiscountVal(e.target.value)}
                        />
                        <button
                           onClick={() => {
                              applyDiscount();
                              setShowDiscountAmountPopup(false);
                           }}
                        >
                           Apply Discount and Add
                        </button>
                        {/* Button that applies the entered discount */}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   function DiscountPopupPercentage({ product }) {
      const [discountPercentage, setDiscountPercentage] = useState("");
      function applyDiscountPercentage() {
         if (discountPercentage > 0 && discountPercentage <= 100) {
            product.extraDiscount = parseFloat(
               (discountPercentage * product.sellingPrice) / 100
            ).toFixed(2);
            setProduct({ ...product });
            console.log(product);
            handleAddItem(product);
            setShowIdSearch(false);
            toast.success(
               "Discount of " +
                  discountPercentage +
                  "% applied on " +
                  product.productName +
                  " successfully"
            );
         } else {
            toast.error("Please enter a valid discount percentage");
         }
      }

      // To show modifed selling price after discount
      const [modPrice, setModPrice] = useState(product.sellingPrice);
      useEffect(() => {
         if (discountPercentage >= 0 && discountPercentage <= 100) {
            const newPrice =
               product.sellingPrice -
               (product.sellingPrice * discountPercentage) / 100;
            setModPrice(parseFloat(newPrice.toFixed(2)));
         } else {
            setModPrice("Invalid Discount Percentage");
         }
      }, [discountPercentage]);

      return (
         <div
            className="popupContainer"
            onClick={() => setShowDiscountPercentagePopup(false)}
         >
            <div
               className="popup-outer"
               style={{ width: "50%", height: "70%" }}
               onClick={(event) => event.stopPropagation()}
            >
               <div className="popup-inner">
                  {/* Popup Header */}
                  <div className="header-items">
                     <span style={{ fontSize: "1.25rem" }}>
                        Discount Percentage for {product.productName}
                     </span>
                     <RxCross1
                        size={30}
                        onClick={() => setShowDiscountPercentagePopup(false)}
                        style={{ cursor: "pointer" }}
                     />
                  </div>

                  {/* Popup Content */}
                  <div
                     style={{
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                     }}
                  >
                     {/* Show Product Image */}
                     <img
                        style={{
                           width: "200px",
                           height: "200px",
                           marginBottom: "20px",
                        }}
                        src={product.productImage}
                        alt="product-image"
                     />

                     {/* Prices Division */}
                     <div
                        style={{
                           width: "100%",
                           display: "flex",
                           flexDirection: "row",
                           justifyContent: "space-evenly",
                        }}
                     >
                        <div
                           style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                           }}
                        >
                           <b>MRP</b>
                           <span>{product.mrp}</span>
                        </div>

                        <div
                           style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                           }}
                        >
                           <b>Selling Price after discount</b>
                           <span>{modPrice}</span>
                        </div>
                     </div>

                     {/* Discount Percent */}
                     <div
                        style={{
                           display: "flex",
                           justifyContent: "space-evenly",
                           width: "100%",
                        }}
                     >
                        <input
                           className="search-input"
                           style={{ width: "150px" }}
                           type="value"
                           value={discountPercentage}
                           onChange={(e) =>
                              setDiscountPercentage(e.target.value)
                           }
                        />
                        <button
                           onClick={() => {
                              applyDiscountPercentage();
                              setShowDiscountPercentagePopup(false);
                           }}
                        >
                           Apply Discount and Add
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      );
   }

   return (
      <div className="popupContainer" onClick={() => setShowIdSearch(false)}>
         <div
            className="popup-outer"
            style={{ width: "60%", height: "80%" }}
            onClick={(event) => event.stopPropagation()}
         >
            <div className="popup-inner">
               <div className="header-items">
                  <div className="search-header">
                     <span
                        style={{ fontSize: "30px", fontWeight: "400" }}
                        className="carry-bag-title"
                     >
                        Search for a Product
                     </span>
                  </div>
                  <div onClick={() => setShowIdSearch(false)}>
                     <RxCross1 size={30} />
                  </div>
               </div>

               <div className="popup-content">
                  {/* Example Barcode Image */}
                  {!product && suggestions.length === 0 && (
                     <div
                        style={{
                           display: "flex",
                           justifyContent: "center",
                           alignItems: "center",
                           marginTop: "20px",
                        }}
                     >
                        <img
                           style={{
                              width: "300px",
                           }}
                           src={Barcode}
                           alt="barcode"
                        />
                     </div>
                  )}

                  {/* Search Input and Suggestions */}
                  {!product && (
                     <div className="search-product-body">
                        <div className="search-input-and-error">
                           {/* Search Input */}
                           <input
                              className="search-input"
                              style={{ width: "350px" }}
                              type="text"
                              placeholder="Enter a Item Code"
                              value={searchId}
                              onChange={(e) => setSearchId(e.target.value)}
                           />
                           {/* Map all the suggestions */}
                           {suggestions.length > 0 && (
                              <div>
                                 {suggestions.map((product, index) => (
                                    <SuggestionTab
                                       key={index}
                                       product={product}
                                       handleAddItem={handleAddItem}
                                    />
                                 ))}
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Selected Product Details */}
                  {product && (
                     <div
                        style={{
                           display: "flex",
                           flexDirection: "column",
                           justifyContent: "space-evenly",
                           alignItems: "center",
                           height: "100%",
                           width: "100%",
                        }}
                     >
                        <div className="search-product-result">
                           {/* Result Left */}
                           <div className="search-product-result-left">
                              <img
                                 style={{
                                    marginRight: "20px",
                                    width: "200px",
                                    height: "200px",
                                 }}
                                 className="search-product-result-image"
                                 src={product.productImage}
                                 alt="product-image"
                              />
                           </div>
                           {/* Result Right */}
                           <div className="search-product-result-right">
                              <div className="search-product-result-details">
                                 <b>Brand </b>
                                 <b>Product </b>
                                 <b>MRP</b>
                                 <b>Price </b>
                              </div>
                              <div className="search-product-result-details">
                                 <div>
                                    <span>{product.productBrand}</span>
                                 </div>
                                 <div>
                                    <span>{product.productName}</span>
                                 </div>
                                 <div>
                                    <span>₹ {product.mrp}</span>
                                 </div>
                                 <div>
                                    <span>₹ {product.sellingPrice}</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        {/* Discount Application Popup */}
                        {showDiscountAmountPopup && (
                           <DiscountPopupAmount product={product} />
                        )}
                        {showDiscountPercentagePopup && (
                           <DiscountPopupPercentage product={product} />
                        )}

                        {/* Add Button */}
                        <div
                           style={{
                              display: "flex",
                              justifyContent: "space-evenly",
                              width: "100%",
                           }}
                        >
                           <button
                              style={{
                                 backgroundColor: "transparent",
                                 color: "black",
                                 border: "1px solid black",
                              }}
                              onClick={() => setShowDiscountAmountPopup(true)}
                           >
                              Discount Amount
                           </button>
                           <button
                              style={{
                                 backgroundColor: "transparent",
                                 color: "black",
                                 border: "1px solid black",
                              }}
                              onClick={() =>
                                 setShowDiscountPercentagePopup(true)
                              }
                           >
                              Discount Percentage
                           </button>
                           <button
                              onClick={() => {
                                 product.extraDiscount = 0;
                                 handleAddItem(product);
                                 setShowIdSearch(false);
                              }}
                           >
                              Add Item
                           </button>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

function TillPopup({ setTillPopup }) {
   const { setTillAccess, setManager } = useAuthContext();
   const usernameRef = useRef(null);
   const passwordRef = useRef(null);

   function handleAuth() {
      // authentication data with username, name and pass
      const authData = {
         user1: ["TM0001", "Ravi", "pass"],
         user2: ["TM0002", "Rahul", "pass"],
         user3: ["TM0003", "Rohit", "pass"],
         user4: ["TM0004", "Raj", "pass"],
      };
      const username = usernameRef.current.value;
      const password = passwordRef.current.value;

      if (authData[username][2] === password) {
         setManager({
            username: authData[username][0],
            name: authData[username][1],
         });
         toast.success("Authentication successful");
         setTillAccess(true);
      } else {
         toast.error("Invalid till manager credentials");
      }
   }

   return (
      <div className="popupContainer" onClick={() => setTillPopup(false)}>
         <div
            className="popup-outer"
            onClick={(event) => event.stopPropagation()}
            style={{ height: "55%", width: "50%" }}
         >
            <div className="popup-inner">
               <div className="header-items">
                  <span className="carry-bag-title">Till Manager Login</span>
                  <RxCross1 size={30} onClick={() => setTillPopup(false)} />
               </div>
               <div className="till-body">
                  <div className="till-body-left">
                     <img style={{ width: "100%" }} src={SupportImage} />
                  </div>
                  <div className="till-body-right">
                     <Input ref={usernameRef} labelString="Username" />
                     <Input
                        ref={passwordRef}
                        labelString="Password"
                        type="password"
                     />

                     <button
                        style={{ marginTop: "20px" }}
                        onClick={() => {
                           handleAuth();
                           setTillPopup(false);
                        }}
                     >
                        Login
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function CarryBagPopup({ setOpenCarryBag, title, buttonText }) {
   const {
      carryBagData,
      handleAddCarryBag,
      handleDeleteCarryBag,
      handleAddItem,
      recieveInvoiceOpts,
   } = useCartContext();
   const { handleNext } = useStepContext();

   function CarryBag({ bag }) {
      return (
         <div className="carry-bag-item">
            {/* Bag image */}
            <img
               src={BagImg}
               style={{ height: bag.width, marginBottom: "20px" }}
            />

            {/* Buttons for quantity control */}
            <div
               style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
               }}
            >
               <button
                  className="quantButton"
                  onClick={() => {
                     handleDeleteCarryBag(bag);
                  }}
               >
                  -
               </button>

               {/* Carry Bag quantity in cart */}
               <span style={{ fontSize: "large", fontWeight: "bold" }}>
                  {bag.quantity}
               </span>

               <button
                  className="quantButton"
                  onClick={() => {
                     handleAddCarryBag(bag);
                  }}
               >
                  +
               </button>
            </div>

            {/* Bag details */}
            <span style={{ fontSize: "25px" }}>{bag.productName}</span>
            <span>₹{bag.sellingPrice} each</span>
         </div>
      );
   }

   return (
      <div className="popupContainer" onClick={() => setOpenCarryBag(false)}>
         <div
            className="popup-outer"
            onClick={(event) => event.stopPropagation()}
         >
            <div className="popup-inner">
               <div className="header-items">
                  <span className="carry-bag-title">{title}</span>
                  <RxCross1 size={30} onClick={() => setOpenCarryBag(false)} />
               </div>

               <div className="carry-bag-allItems">
                  {carryBagData.map((bag) => (
                     <CarryBag
                        key={bag.productName}
                        bag={bag}
                        handleAddItem={handleAddItem}
                     />
                  ))}
               </div>

               {/* SKIP Button */}
               <div className="carry-bag-buttons">
                  <button
                     disabled={recieveInvoiceOpts.length === 0}
                     onClick={() => {
                        setOpenCarryBag(false);
                        handleNext();
                     }}
                  >
                     {buttonText}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

function BillDiscountPopup() {
   const { discAmountRef, discPercentRef } = useCartContext();

   const {
      handleDiscountCalcPerc,
      handleDiscountCalcAmt,
      resetBillDiscount,
      orderSummaryVals,
      billDiscountApplied,
   } = useCartContext();

   function handleDiscount() {
      const percent = discPercentRef.current.value;
      const amount = discAmountRef.current.value;

      // if any one of percent and amount are not valid numbers
      if (isNaN(percent) || isNaN(amount)) {
         toast.error("Please enter a valid number");
         return;
      }

      if (percent && amount) {
         toast.error("Please enter only one value");
      } else if (!percent && !amount) {
         toast.error("Please enter a value");
      } else if (percent) {
         handleDiscountCalcPerc(percent);
      } else if (amount) {
         handleDiscountCalcAmt(amount);
      }
   }

   return (
      <div
         style={{
            border: "1px dashed grey",
            width: "80%",
            padding: "20px 0",
         }}
      >
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               justifyContent: "center",
               alignItems: "center",
            }}
         ></div>
         <div
            style={{
               display: "flex",
               flexDirection: "column",
               justifyContent: "center",
               alignItems: "center",
            }}
         >
            <div
               style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
               }}
            >
               <Input ref={discPercentRef} labelString="Percentage" />
            </div>

            <span style={{ fontWeight: "700", marginTop: "20px" }}>OR</span>

            <div
               style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
               }}
            >
               <Input ref={discAmountRef} labelString="Amount" />
            </div>

            <div
               style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-evenly",
                  alignItems: "center",
                  marginTop: "20px",
               }}
            >
               <button
                  // onClick, reset the extra discount and set data for both the inputs to null
                  onClick={() => {
                     if (!billDiscountApplied) {
                        toast.error("Please apply a discount first");
                        return;
                     }
                     resetBillDiscount();
                  }}
                  style={{
                     color: "black",
                     backgroundColor: "transparent",
                     border: "1px solid black",
                  }}
               >
                  Reset
               </button>
               <button
                  onClick={handleDiscount}
                  disabled={
                     orderSummaryVals.roundedGrandTotal === 0 ||
                     billDiscountApplied
                  }
               >
                  Apply
               </button>
            </div>
         </div>
      </div>
   );
}

function ConfirmDeleteItem({ item, setItemToDelete }) {
   const { handleDeleteItem, handleRemoveCarryBag } = useCartContext();

   return (
      <div
         className="popupContainer slow"
         onClick={() => setItemToDelete(null)}
      >
         <div
            className="deletion-outer"
            onClick={(event) => event.stopPropagation()}
         >
            <div className="popup-inner">
               <div className="header-items">
                  <span style={{ fontSize: "1.25rem" }}>
                     Are you sure you want to delete this item?
                  </span>
                  <RxCross1
                     size={30}
                     onClick={() => setItemToDelete(null)}
                     style={{ cursor: "pointer" }}
                  />
               </div>
               <div className="deletion-body">
                  <span style={{ fontSize: "1.5rem", fontWeight: "500" }}>
                     {item.productBrand} - {item.productName}
                  </span>
                  <img
                     style={{ width: "200px" }}
                     src={item.productImage}
                     alt="product"
                  />
               </div>
               <div style={{ width: "40%" }}>
                  <div
                     style={{
                        display: "flex",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                     }}
                  >
                     <button onClick={() => setItemToDelete(null)}>NO</button>
                     <button
                        onClick={() => {
                           if (item.productCategory === "Miscellaneous") {
                              handleRemoveCarryBag(item);
                           } else {
                              handleDeleteItem(item);
                           }
                           setItemToDelete(null);
                        }}
                        style={{ backgroundColor: "darkred" }}
                     >
                        YES
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function MMRPInput() {
   const { setShowMMRP, mmrpItem, handleAddItem, setMmrpItem } =
      useCartContext();
   const [inputValue, setInputValue] = useState("");

   function handleInputChange(event) {
      setInputValue(event.target.value);
   }

   function handleMmrpSubmit() {
      // if inputValue is a number
      if (!isNaN(inputValue)) {
         const value = parseFloat(inputValue);
         if (mmrpItem.sellingPrice.includes(value)) {
            mmrpItem.sellingPrice = value;
            handleAddItem(mmrpItem);
            setMmrpItem(null);
            setShowMMRP(false);
         } else {
            toast.error("Please enter a valid MRP.");
         }
      } else {
         toast.error("Please enter a numeric value.");
      }
   }

   return (
      <div className="popupContainer slow">
         <div className="deletion-outer" style={{ height: "70%" }}>
            <div className="popup-inner">
               <div>
                  <span style={{ fontSize: "2rem" }}>
                     Enter the price for this product
                  </span>
               </div>
               <div className="deletion-body">
                  <span style={{ fontSize: "1.5rem", fontWeight: "700" }}>
                     {mmrpItem.productBrand} - {mmrpItem.productName}
                  </span>
                  <div className="product-serial">
                     ID <b>{mmrpItem.productSerial}</b>
                  </div>
                  <img
                     src={mmrpItem.productImage}
                     style={{ width: "300px", height: "300px" }}
                  />
                  <div
                     style={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-evenly",
                        alignItems: "center",
                     }}
                  >
                     {/* MMRP Input */}
                     <div>
                        <span style={{ fontSize: "2rem", marginRight: "20px" }}>
                           ₹
                        </span>
                        <input
                           className="search-input"
                           type="text"
                           placeholder="Enter a price"
                           value={inputValue}
                           onChange={handleInputChange}
                        />
                     </div>

                     {/* Submit Button */}
                     <button
                        style={{ backgroundColor: "green" }}
                        onClick={handleMmrpSubmit}
                     >
                        Submit
                     </button>

                     {/* Cancel Button */}
                     <button
                        style={{ backgroundColor: "darkred" }}
                        onClick={() => {
                           setShowMMRP(false), setMmrpItem(null);
                        }}
                     >
                        Cancel
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}

function ShowDetails({ item, setShowDetailsItem }) {
   return (
      <div
         className="popupContainer slow"
         onClick={() => setShowDetailsItem(null)}
      >
         <div
            className="deletion-outer"
            onClick={(event) => event.stopPropagation()}
         >
            <div className="popup-inner">
               <div className="header-items">
                  <span style={{ fontSize: "2rem" }}>Product Image</span>
                  <RxCross1
                     size={30}
                     style={{ cursor: "pointer" }}
                     onClick={() => setShowDetailsItem(null)}
                  />
               </div>
               <div className="deletion-body">
                  <img
                     style={{ height: "100%" }}
                     src={item.productImage}
                     alt="product"
                  />
               </div>
            </div>
         </div>
      </div>
   );
}

function ManagerAccess() {
   const [selectedDiscountType, setSelectedDiscountType] = useState(null);
   const { setItemsSelectable, selectedItems } = useCartContext();

   return (
      <div className="manager-opts">
         {/* Heading */}
         <div className="maSection">
            <span className="managerAccessHeading">Manager Access</span>
         </div>

         {/* Product Search */}
         <div className="maSection">
            <>
               <div className="labelContainer">
                  <span className="label">Product Search</span>
               </div>
               <input
                  className="managerAccessInput"
                  type="text"
                  placeholder="Enter a Product ID"
               />
            </>
         </div>

         {/* Discount Application Section */}
         <div className="maSection">
            <div className="labelContainer">
               <span className="label">Select Discount Type</span>
            </div>

            {/* Discount Type Buttons */}
            <div style={{ display: "flex", flexDirection: "row" }}>
               <button
                  className={`discountButton ${
                     selectedDiscountType === "item" && "selectedDiscountButton"
                  }`.trim()}
                  onClick={() => {
                     // Set the Discount Type
                     setSelectedDiscountType("item"),
                        // Make the item cards selectable
                        setItemsSelectable(true);
                  }}
               >
                  Item Discount
               </button>
               <button
                  className={`discountButton ${
                     selectedDiscountType === "bill" && "selectedDiscountButton"
                  }`.trim()}
                  onClick={() => setSelectedDiscountType("bill")}
               >
                  Bill Discount
               </button>
            </div>
         </div>

         {/* Bill Discount Section */}
         {selectedDiscountType === "bill" && <BillDiscountPopup />}

         {/* Item Discount Section */}
         {selectedDiscountType === "item" && (
            <div className="maSection">
               {/* Label: Selected Items count */}
               <div className="labelContainer">
                  <span className="label">Selected Items</span>
                  {/* Show the length of selected items */}
                  <span className="selectedItemsCount">
                     {selectedItems.length}
                  </span>
               </div>
            </div>
         )}
      </div>
   );
}

// itemsSelectable,
// setItemsSelectable,
// selectedItems,
// setSelectedItems,
// selectItemForDiscount,
