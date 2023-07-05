import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fs, auth } from "./Config";
import { Navbar } from "./Navbar";
import user from "./Cart";

const ProductPage = () => {
  const { productID } = useParams();
  const [product, setProduct] = useState(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch the product data from Firebase based on the productId
    fs.collection("Products")
      .doc(productID)
      .get()
      .then((snapshot) => {
        console.log("Snapshot:", snapshot); // Log the snapshot object
        if (snapshot.exists) {
          setProduct(snapshot.data());
        } else {
          console.log("Product not found");
        }
      })
      .catch((error) => {
        console.log("Error fetching product:", error); // Log the error message
      });

    auth.onAuthStateChanged((user) => {
      if (user) {
        fs.collection("Cart " + user.uid).onSnapshot((snapshot) => {
          const qty = snapshot.docs.length;
          setTotalProducts(qty);
        });
      }
    });

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
  }, [productID]);

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Navbar user={user} totalProducts={totalProducts} />
      <h3 className="product-title">{product.title}</h3>
      <p className="product-description">{product.description}</p>
      <div className="product-image-container">
        <img className="product-image" src={product.url} alt="product-image" />
      </div>
      <h3 className="product-price">Price: Rs. {product.price}</h3>

      {/* Display other product details */}
    </div>
  );
};

export default ProductPage;
