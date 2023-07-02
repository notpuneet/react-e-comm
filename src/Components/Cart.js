import React, { useState, useEffect } from "react";
import { auth, fs } from "./Config";
import { Navbar } from "./Navbar";
import { CartProducts } from "./CartProducts";
import { IndividualCartProduct } from "./IndividualCartProduct";
import StripeCheckout from "react-stripe-checkout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  const handleToken = async (token) => {
    //  console.log(token);
    const cart = { name: "All Products", totalPrice };
    const response = await axios.post("http://localhost:8080/checkout", {
      token,
      cart,
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
            <hr></hr>Total No of Products:  &nbsp; &nbsp;&nbsp;&nbsp;{totalQty}<hr></hr>
            <div>
              Total Price to Pay: <span>Rs {totalPrice}</span>
            </div>
            <br />
            {
              <StripeCheckout
                stripeKey="pk_test_51NN9SQSDwXLKprWdR5YoV0TDeFXd5uY5am9fFJ3z1xvRrWMz8y7Ju6FiL0JKX94qjvciBGSi1TwslspLMPMETNNc00f6l1bft2"
                token={handleToken}
                billingAddress
                shippingAddress
                name="All Products"
                amount={totalPrice * 100}
              ></StripeCheckout>
            }
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
