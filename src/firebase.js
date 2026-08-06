import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "invest-dashboard-a476d",
  appId: "1:875132761362:web:6f5c2f50785ea6279dafcb",
  storageBucket: "invest-dashboard-a476d.firebasestorage.app",
  apiKey: "AIzaSyDYCC5bOcRIs5RH1zPw-U9mHI8cx0Ir5jw",
  authDomain: "invest-dashboard-a476d.firebaseapp.com",
  messagingSenderId: "875132761362",
  measurementId: "G-RGYKV6RGGY"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
