import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCLIvQtEtF1RHh14pybI64dh3XVjZcPXl4",
  authDomain: "xfoundation-926b3.firebaseapp.com",
  projectId: "xfoundation-926b3",
  storageBucket: "xfoundation-926b3.firebasestorage.app",
  messagingSenderId: "432789671139",
  appId: "1:432789671139:web:9adfb3dfd02eb99ec989d6",
  measurementId: "G-S95S72HV2L"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firestore and Storage
export const fire = firebase
export const db = firebase.firestore();
export const storage = firebase.storage();