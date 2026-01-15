import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  databaseURL: "https://swiftconvert-8ef21-default-rtdb.europe-west1.firebasedatabase.app/",
  storageBucket: "gs://swiftconvert-8ef21.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const storage = getStorage(app);
