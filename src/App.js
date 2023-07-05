
import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './Components/Home'; // Updated import statement
import Signup from './Components/Signup';
import { Login } from './Components/Login';
import { NotFound } from './Components/NotFound';
import { AddProducts } from './Components/AddProducts';
import Cart from './Components/Cart';
import ProductPage from './Components/ProductPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="signup" element={<Signup/>} />
        <Route path="login" element={<Login/>} />
        <Route path='add-products' Component={AddProducts}></Route>
        <Route path='cart' Component={Cart}></Route>
        <Route path="/product/:productID" element={<ProductPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
