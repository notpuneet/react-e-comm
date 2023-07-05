import React, { useState, useEffect } from "react";
import { auth, fs } from "./Config";
import { Navbar } from "./Navbar";
import { CartProducts } from "./CartProducts";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

const Cart = () => {
  // getting current user function
  function GetCurrentUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          fs.collection("SignedUpUsers")
            .doc(user.uid)
            .get()
            .then((snapshot) => {
              setUser(snapshot.data().Name);
            });
        } else {
          setUser(null);
        }
      });
    }, []);
    return user;
  }

  const user = GetCurrentUser();
  console.log(user);

  const [cartProducts, setCartProducts] = useState([]);

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        fs.collection("Cart " + user.uid).onSnapshot((snapshot) => {
          const newCartProduct = snapshot.docs.map((doc) => ({
            ID: doc.id,
            ...doc.data(),
          }));
          setCartProducts(newCartProduct);
        });
      } else {
        console.log("User is not signed in to retrieve cart");
      }
    });
  }, []);

  console.log(cartProducts);

  // cart product increase function
  const cartProductIncrease = (cartProduct) => {
    let Product = { ...cartProduct };
    Product.qty = Product.qty + 1;
    Product.TotalProductPrice = Product.qty * Product.price;

    // updating in database
    auth.onAuthStateChanged((user) => {
      if (user) {
        fs.collection("Cart " + user.uid)
          .doc(cartProduct.ID)
          .update(Product)
          .then(() => {
            console.log("Increment added");
          });
      } else {
        console.log("User is not logged in to increment");
      }
    });
  };

  // cart product decrease functionality
  const cartProductDecrease = (cartProduct) => {
    let Product = { ...cartProduct };
    if (Product.qty > 1) {
      Product.qty = Product.qty - 1;
      Product.TotalProductPrice = Product.qty * Product.price;

      // updating in database
      auth.onAuthStateChanged((user) => {
        if (user) {
          fs.collection("Cart " + user.uid)
            .doc(cartProduct.ID)
            .update(Product)
            .then(() => {
              console.log("Decrement");
            });
        } else {
          console.log("User is not logged in to decrement");
        }
      });
    }
  };

  // Calculate total quantity and price
  const totalQty = cartProducts.reduce(
    (total, cartProduct) => total + cartProduct.qty,
    0
  );
  const totalPrice = cartProducts.reduce(
    (total, cartProduct) => total + cartProduct.TotalProductPrice,
    0
  );
  let totalPriceInDollar = totalPrice * 0.01369;
  totalPriceInDollar = totalPriceInDollar.toFixed(2);
  // state of totalProducts
  const [totalProducts, setTotalProducts] = useState(0);
  // getting cart products
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        fs.collection("Cart " + user.uid).onSnapshot((snapshot) => {
          const qty = snapshot.docs.length;
          setTotalProducts(qty);
        });
      }
    });
  }, []);
  const navigate = useNavigate();
  //CHARGING PAYMENT
  /* const handleToken = async (token) => {
    //  console.log(token);
    const cart = { name: "All Products", totalPrice };
    const data ={  
      merchantId:"M2306160483220675579140",
      transactionId:"TX123456789",
      merchantUserId:"U123456789",
      amount:100,
      merchantOrderId:"OD1234",
      mobileNumber:"9xxxxxxxxx",
      message:"payment for order placed OD1234",
      subMerchant:"DemoMerchant",
      email:"amit***75@gmail.com",
      shortName:"Amit"
   }
    // const response = await axios.post("https://mercury-uat.phonepe.com/v4/debit/", {
    //   token,
    //   data,
    // });

    const response = await axios({
      method: 'post',
      url:"https://mercury-uat.phonepe.com/v4/debit/",
      params:{
       data:data,
      }
  });
    console.log(response);
    let { status } = response.data;
    console.log(status);
    if (status === "success") {
      navigate("/");

      toast.success("Your order has been placed successfully", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      });

      const uid = auth.currentUser.uid;
      const carts = await fs.collection("Cart " + uid).get();
      for (var snap of carts.docs) {
        fs.collection("Cart " + uid)
          .doc(snap.id)
          .delete();
      }
    } else {
      alert("Something went wrong in checkout");
    }
  }; */

  const handlePaymentApproval = async (details) => {
    console.log(details);
    // Empty the cart
    const uid = auth.currentUser.uid;
    const carts = await fs.collection("Cart " + uid).get();
    for (var snap of carts.docs) {
      await fs
        .collection("Cart " + uid)
        .doc(snap.id)
        .delete();
    }

    toast.success(
      "Your order has been placed successfully, Redirecting to home",
      {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        progress: undefined,
      }
    );
    // Check if the details object and id property are defined
    if (details && details.id) {
      // Store the payment data to Firebase database
      const uid = auth.currentUser.uid;
      const paymentData = {
        orderId: details.id,
        payerName: details.payer.name.given_name,
        payerEmail: details.payer.email_address,
        amount: details.purchase_units[0].amount.value,
        timestamp: new Date().toISOString(),
      };

      try {
        await fs.collection("Payments").add(paymentData);
        console.log("Payment data stored to Firebase database");
      } catch (error) {
        console.log("Error storing payment data:", error);
      }

      // Navigate to the home page after 4 seconds
      setTimeout(() => {
        navigate("/");
      }, 4000);
    } else {
      console.log("Invalid payment details");
    }
  };

  return (
    <>
      <Navbar user={user} totalProducts={totalProducts} />
      <br />

      {cartProducts.length > 0 && (
        <div className="container-fluid">
          <h1 className="text-center">Cart</h1>
          <div className="products-box">
            <CartProducts
              cartProducts={cartProducts}
              cartProductIncrease={cartProductIncrease}
              cartProductDecrease={cartProductDecrease}
            />
          </div>
          <div className="summary-box">
            <h5>Cart Summary</h5>
            <br />
            <hr></hr>Total No of Products: &nbsp; &nbsp;&nbsp;&nbsp;{totalQty}
            <hr></hr>
            <div>
              Total Price to Pay: <span>Rs {totalPrice}</span>
            </div>
            <br />
            {console.log(totalPriceInDollar)}
            {totalPriceInDollar && (
              <PayPalScriptProvider
                options={{
                  clientId:
                    "AZzkLoj7xUQcmi7PCCyE71iDgnKPmSqnyZnoKZ_dJGA9BC7ngGF0fys-psGPKycemgsV_egnD2X_0ctX",
                }}
              >
                <PayPalButtons
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          amount: {
                            value: totalPriceInDollar,
                          },
                        },
                      ],
                    });
                  }}
                  onApprove={async (details, actions) => {
                    return actions.order.capture().then(async (details) => {
                      // Navigate to the home page
                      handlePaymentApproval(details);
                    });
                  }}
                />
              </PayPalScriptProvider>
            )}
          </div>
        </div>
      )}

      {cartProducts.length < 1 && (
        <div className="container-fluid">No products to show</div>
      )}
    </>
  );
};

export default Cart;
 