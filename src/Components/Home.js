import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import Products from './Products';
import { auth, fs } from './Config';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export const Home = () => {
  const navigate = useNavigate();
  // Getting current user uid
  function GetUserUid() {
    const [uid, setUid] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          setUid(user.uid);
        }
      });
    }, []);
    return uid;
  }

  const uid = GetUserUid();

  // Creating a function for getting the current user
  function GetCurrentUser() {
    const [user, setUser] = useState(null);
    useEffect(() => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          fs.collection('SignedUpUsers')
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

  const [products, setProducts] = useState([]);
  const getProducts = async () => {
    const products = await fs.collection('Products').get();
    const productsArray = [];
    for (var snap of products.docs) {
      var data = snap.data();
      data.ID = snap.id;
      productsArray.push({
        ...data,
      });
      if (productsArray.length === products.docs.length) {
        setProducts(productsArray);
      }
    }
  };
  useEffect(() => {
    getProducts();
  }, []);
 // state of totalProducts
 const [totalProducts, setTotalProducts]=useState(0);
 // getting cart products   
 useEffect(()=>{        
     auth.onAuthStateChanged(user=>{
         if(user){
             fs.collection('Cart ' + user.uid).onSnapshot(snapshot=>{
                 const qty = snapshot.docs.length;
                 setTotalProducts(qty);
             })
         }
     })       
 },[])  
  let Product;
  const addToCart = (product) => {
    if (uid !== null) {
      Product = product;
      Product['qty'] = 1;
      Product['TotalProductPrice'] = Product.qty * Product.price;
      fs.collection('Cart ' + uid)
        .doc(product.ID)
        .set(Product)
        .then(() => {
          console.log('successfully added to cart');
          toast.success('Product added to cart!', {
            position: toast.POSITION.BOTTOM_RIGHT
          });
        });
    } else {

      navigate('/login');
    }
  };

  return (
    <>
      <Navbar user={user} totalProducts={totalProducts} />
      <br></br>
      {products.length > 0 && (
        <div className='container-fluid'>
          <h1 className='text-center'>Products</h1>
          <div className='products-box'>
            <Products products={products} addToCart={addToCart} />
          </div>
        </div>
      )}
      {products.length < 1 && (
        <div className='container-fluid'>Please wait....</div>
      )}
    </>
  );
};
