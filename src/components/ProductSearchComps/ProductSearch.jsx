import { FaSearch } from "react-icons/fa";

const [idSearch, setIdSearch] = useState(false);
const [nameSearch, setNameSearch] = useState(false);

{
   /* {!showPaymentOpts && (
                  <ManualSearch
                     setIdSearch={setIdSearch}
                     setNameSearch={setNameSearch}
                  />
               )} */
}

{
   /* Product Code Search Pop-up */
}
{
   /* {idSearch && (
               <>
                  <IdSearchPopup
                     setIdSearch={setIdSearch}
                     handleAddItem={handleAddItem}
                  />
               </>
            )} */
}

{
   /* Product Name Search Pop-up */
}
{
   /* {nameSearch && (
               <>
                  <NameSearchPopup
                     setNameSearch={setNameSearch}
                     handleAddItem={handleAddItem}
                  />
               </>
            )} */
}

function ManualSearch({ setIdSearch, setNameSearch }) {
   return (
      <div className="manual-search">
         <button
            style={{ marginRight: "20px" }}
            className="manual-search-button"
            onClick={() => setIdSearch(true)}
         >
            <FaSearch size={15} />
            &nbsp;&nbsp;Product Code
         </button>
         <button
            className="manual-search-button"
            onClick={() => setNameSearch(true)}
         >
            <FaSearch size={15} />
            &nbsp;&nbsp;Product Name
         </button>
      </div>
   );
}

function IdSearchPopup({ setIdSearch, handleAddItem }) {
   const [search, setSearch] = useState("");
   const [product, setProduct] = useState(null);

   useEffect(() => {
      const fetchProductDetails = async () => {
         try {
            const response = await axios.get(
               `http://localhost:9021/products/searchId=${search}`
            );
            setProduct(response.data);

            // Check if the search has a length of 5 and the response is empty
            if (search.trim().length === 5 && !response.data) {
               // Display a toast
               toast.error("No product found with this code.");
            }
         } catch (error) {
            console.error("Error fetching product details:", error);
         }
      };

      if (search.trim() !== "") {
         fetchProductDetails();
      } else {
         setProduct(null);
      }
   }, [search, setProduct]);

   return (
      <div className="popupContainer">
         <div className="popup-outer">
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
                  <button onClick={() => setIdSearch(false)}>
                     <RxCross1 size={30} />
                  </button>
               </div>

               {/* Example Barcode Image */}
               {!product && (
                  <div
                     style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "20px",
                     }}
                  >
                     <img
                        style={{ width: "300px" }}
                        src={Barcode}
                        alt="barcode"
                     />
                  </div>
               )}

               <div className="search-product-body">
                  <div className="search-input-and-error">
                     <input
                        className="search-input"
                        type="text"
                        placeholder="Enter a Product Code"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                     />
                  </div>
               </div>

               {product && (
                  <div className="search-product-result">
                     <div className="search-product-result-left">
                        <img
                           className="search-product-result-image"
                           src={product.productImage}
                           alt="product-image"
                        />
                     </div>
                     <div className="search-product-result-right">
                        <div className="search-product-result-details">
                           <b>Brand </b>
                           <b>Product </b>
                           <b>Price </b>
                        </div>
                        <div className="search-product-result-details">
                           <div>
                              <span>{product.brandName}</span>
                           </div>
                           <div>
                              <span>{product.productName}</span>
                           </div>
                           <div>
                              <span>₹ {product.price}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               )}

               <div
                  style={{
                     display: "flex",
                     justifyContent: "space-evenly",
                     width: "100%",
                  }}
               >
                  <button
                     disabled={!product}
                     onClick={() => {
                        handleAddItem(product);
                        setIdSearch(false);
                     }}
                  >
                     Add this Product
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
}

function NameSearchPopup({ setNameSearch, handleAddItem }) {
   const [inputValue, setInputValue] = useState("");
   const [suggestions, setSuggestions] = useState([]);

   function handleInputChange(e) {
      const value = e.target.value;
      setInputValue(value);
   }

   // Create a component for each suggestion
   function SuggestionTab({ product }) {
      return (
         <div
            style={{
               display: "flex",
               justifyContent: "flex-start",
               alignItems: "center",
               width: "700px",
               height: "100px",
               padding: "20px",
               boxSizing: "border-box",
            }}
         >
            <img
               style={{ width: "100px", height: "100px", marginRight: "10px" }} // Add margin for spacing
               src={product.productImage}
               alt="product-image"
            />
            <div style={{ display: "flex", flexDirection: "column" }}>
               <span style={{ marginBottom: "5px" }}>
                  {product.brandName + " " + product.productName}
               </span>
               <span style={{ fontWeight: "600" }}>₹ {product.price}</span>
            </div>
            <button
               style={{ marginLeft: "auto" }} // Add margin for spacing
               onClick={() => {
                  handleAddItem(product);
                  setNameSearch(false);
               }}
            >
               ADD
            </button>
         </div>
      );
   }

   useEffect(() => {
      async function fetchSuggestions() {
         try {
            const response = await axios.get(
               `http://localhost:9021/products/searchName=${inputValue}`
            );
            setSuggestions(response.data.slice(0, 4));
         } catch (error) {
            console.error("Error fetching product suggestions:", error);
         }
      }

      if (inputValue.trim() !== "") {
         fetchSuggestions();
      } else {
         setSuggestions([]);
      }
   }, [inputValue]);

   return (
      <div className="popupContainer">
         <div className="popup-outer">
            <div
               className="popup-inner"
               style={{ justifyContent: "flex-start" }}
            >
               <div className="header-items">
                  <div className="search-header">
                     <span
                        style={{
                           fontSize: "30px",
                           fontWeight: "400",
                        }}
                        className="carry-bag-title"
                     >
                        Search for a Product
                     </span>
                  </div>
                  <RxCross1 size={30} onClick={() => setNameSearch(false)} />
               </div>

               <div
                  className="search-product-body"
                  style={{ marginTop: "50px" }}
               >
                  <div className="search-input-and-error">
                     <input
                        className="search-input"
                        type="text"
                        placeholder="Enter a Product Name"
                        value={inputValue}
                        onChange={handleInputChange}
                     />
                     {/* Map all the suggestions */}
                     {suggestions.length > 0 && (
                        <div>
                           {suggestions.map((product) => (
                              <SuggestionTab
                                 key={product.id}
                                 product={product}
                                 handleAddItem={handleAddItem}
                              />
                           ))}
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
