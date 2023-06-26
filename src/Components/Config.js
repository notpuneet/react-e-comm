import  firebase from 'firebase'

import 'firebase/storage';
import 'firebase/firestore';
import 'firebase/auth'

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAczV_ZvEb0QBOWJJC8Pj0OxW91zhDadE0",
    authDomain: "ecommerce-with-react-2ac-7b8d1.firebaseapp.com",
    databaseURL: "https://ecommerce-with-react-2ac-7b8d1-default-rtdb.firebaseio.com",
    projectId: "ecommerce-with-react-2ac-7b8d1",
    storageBucket: "ecommerce-with-react-2ac-7b8d1.appspot.com",
    messagingSenderId: "1091207270862",
    appId: "1:1091207270862:web:7157fe3a0b92feab5f1b9f",
    measurementId: "G-TRS2K5JS51"
  };

  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const fs = firebase.firestore();
  const storage = firebase.storage();
  
  export { auth, fs, storage };