// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB6_qOKjIDRe1rawujXK1FmT5tmZrEzqmM",
  authDomain: "badr-payroll-hr.firebaseapp.com",
  projectId: "badr-payroll-hr",
  storageBucket: "badr-payroll-hr.appspot.com",
  messagingSenderId: "850242937097",
  appId: "1:850242937097:web:0a89cf9c3a4d84a4fc3a34",
  measurementId: "G-QGXV4JYFP9"
};

// Initialize Firebase app
firebase.initializeApp(firebaseConfig);

// Initialize Firebase services
const analytics = firebase.analytics();
const database = firebase.database();

// Firebase helper functions
function saveToFirebase(key, value) {
    return database.ref(key).set(value);
}

function getFromFirebase(key) {
    return database.ref(key).once('value').then(snapshot => snapshot.val());
}

function updateInFirebase(key, value) {
    return database.ref(key).update(value);
}

function removeFromFirebase(key) {
    return database.ref(key).remove();
}
