import s from "./Receipt.module.css";
import logoImg from "../../assets/KPMG_Logo.svg";
import { useCartContext } from "../../contexts/CartContext";
import DataTable from "react-data-table-component";
import { Page, View, Document } from "@react-pdf/renderer";
import { useAuthContext } from "../../contexts/AuthContext";

export default function MyDocument() {
   const { orderSummaryVals, extraDiscount, renderMoney, setOpenInvoice } =
      useCartContext();
   const { user } = useAuthContext();
   return (
      <Document>
         <Page size="A4" className={s.page}>
            <View className={s.invoice}>
               <div className={s.invoiceHeader}>
                  <img style={{ width: "200px" }} src={logoImg} />
                  <div className={s.address}>
                     <span style={{ fontWeight: "bold", marginBottom: "10px" }}>
                        KPMG Retail Store
                     </span>
                     <span>47</span>
                     <span>Cyber Hub, Gurgaon</span>
                     <span>HR, India</span>
                     <span>122002</span>
                  </div>
               </div>
               <div
                  style={{
                     width: "100%",
                     display: "flex",
                     flexDirection: "row",
                     justifyContent: "space-between",
                     alignItems: "center",
                  }}
               >
                  <span className={s.heading}>Invoice</span>
                  <button onClick={() => setOpenInvoice(false)}>Back</button>
               </div>

               <div className={s.customerDetails}>
                  <span className={s.subHeading}>Customer Details</span>
                  {user.name ? (
                     <span>Name: {user.name}</span>
                  ) : (
                     <span>Name: Guest Customer</span>
                  )}
                  <span>Mobile: {user.mobileNumber}</span>
               </div>

               <OrderItemTable />

               <span className={s.finalDetails}>
                  <div style={{ width: "20%" }}>
                     <span>Total Item Count {orderSummaryVals.itemCount}</span>
                  </div>
                  <div
                     style={{
                        width: "80%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        marginTop: "10px",
                     }}
                     className={s.orderSummaryDetails}
                  >
                     <span style={{ fontSize: "1.4em", color: "black" }}>
                        Grand Total:{" "}
                        {renderMoney(orderSummaryVals.roundedGrandTotal)}
                     </span>
                     <span>
                        Total Amount:{" "}
                        {renderMoney(orderSummaryVals.roundedTotal)}
                     </span>
                     <span style={{ fontSize: 15 }}>
                        ( Tax Included:{" "}
                        {renderMoney(orderSummaryVals.roundedTax)} )
                     </span>
                     <span>
                        Savings: {renderMoney(orderSummaryVals.roundedDiscount)}
                     </span>
                     {orderSummaryVals.extraDiscount > 0 && (
                        <span>
                           Extra Discount:{" "}
                           {renderMoney(orderSummaryVals.extraDiscount)}
                        </span>
                     )}

                     {orderSummaryVals.pointsRedeemed > 0 && (
                        <span>
                           Loyalty Points Discount:{" "}
                           {renderMoney(orderSummaryVals.pointsRedeemed)}
                        </span>
                     )}

                     <span style={{ fontSize: "0.8em", marginTop: "20px" }}>
                        You have earned{" "}
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
               </span>
            </View>
         </Page>
      </Document>
   );
}

function OrderItemTable() {
   const { orderSummaryVals, roundOff } = useCartContext();

   // Custom Styling for the table headers
   const customStyles = {
      headCells: {
         style: {
            fontWeight: "bold",
         },
      },
   };

   // Table headers
   const columns = [
      {
         name: "PRODUCT",
         selector: (row) => row.productFullName,
         minWidth: "180px",
      },
      {
         name: "S/N",
         selector: (row) => row.productId,
         minWidth: "120px",
      },
      {
         name: "QTY",
         selector: (row) => row.quantity,
         sortable: true,
      },
      {
         name: "MRP",
         selector: (row) => row.mrp,
         sortable: true,
      },
      {
         name: "SP",
         selector: (row) => row.sellingPrice,
         sortable: true,
      },
      {
         name: "PRICE (Excl. Tax)",
         selector: (row) =>
            roundOff(
               (row.sellingPrice -
                  (parseFloat(row.extraDiscount) +
                     parseFloat(row.billDiscount))) /
                  (1 + row.taxRate / 100)
            ),
         sortable: true,
         minWidth: "170px",
      },
      {
         name: "TAX",
         selector: (row) =>
            row.taxRate +
            "%" +
            " (" +
            roundOff(
               row.sellingPrice -
                  (parseFloat(row.extraDiscount) +
                     parseFloat(row.billDiscount)) -
                  (row.sellingPrice -
                     (parseFloat(row.extraDiscount) +
                        parseFloat(row.billDiscount))) /
                     (1 + row.taxRate / 100)
            ) +
            ")",
         minWidth: "120px",
      },
      {
         name: "EXTRA DISC.",
         selector: (row) =>
            roundOff(
               parseFloat(row.extraDiscount) + parseFloat(row.billDiscount)
            ),
         sortable: true,
         minWidth: "150px",
      },
      {
         name: "TOTAL",
         selector: (row) =>
            roundOff(
               row.sellingPrice -
                  (parseFloat(row.extraDiscount) + parseFloat(row.billDiscount))
            ),
         sortable: true,
      },
   ];

   // Make all the columns sortable
   columns.forEach((col) => {
      col.wrap = true;
   });

   // Table data: Order Items
   const { simplifiedCartItems } = useCartContext();
   // To the simplifiedCartItems, add a serial number to each item
   // Calculate the total based on the selling price and tax rate applicable
   simplifiedCartItems.forEach((item, index) => {
      item.serialNum = index + 1;
      // calculate the total for each item
      item.total =
         item.price * item.quantity +
         (item.price * item.quantity * item.taxRate) / 100;
      // if there is no product id, replace it with "N/A"
      if (!item.productId) {
         item.productId = "NA";
      }
   });

   return (
      <div
         style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "end",
         }}
      >
         <span
            style={{
               margin: "0.5em 0",
               fontSize: "small",
               fontWeight: "bold",
               color: "darkgreen",
            }}
         >
            Click a header to sort
         </span>
         <DataTable
            columns={columns}
            data={simplifiedCartItems}
            striped={true}
            customStyles={customStyles}
         />
         <div className={s.tableFooter}>
            <span className={s.tableFooterTotal}>
               {orderSummaryVals.roundedGrandTotal}
            </span>
         </div>
      </div>
   );
}
