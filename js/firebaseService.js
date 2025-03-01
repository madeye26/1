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
const firestore = firebase.firestore();

// Real-time sync with Firestore
function setupRealtimeSync() {
    // Sync employees
    firestore.collection('employees').onSnapshot(snapshot => {
        const employees = [];
        snapshot.forEach(doc => {
            employees.push({ id: doc.id, ...doc.data() });
        });
        window.appState.employees = employees;
        saveToLocalStorage('employees', employees);
    });

    // Sync leave requests
    firestore.collection('leaveRequests').onSnapshot(snapshot => {
        const leaveRequests = [];
        snapshot.forEach(doc => {
            leaveRequests.push({ id: doc.id, ...doc.data() });
        });
        window.appState.leaveRequests = leaveRequests;
        saveToLocalStorage('leaveRequests', leaveRequests);
    });

    // Sync advances
    firestore.collection('advances').onSnapshot(snapshot => {
        const advances = [];
        snapshot.forEach(doc => {
            advances.push({ id: doc.id, ...doc.data() });
        });
        window.appState.advances = advances;
        saveToLocalStorage('advances', advances);
    });

    // Sync salary reports
    firestore.collection('salaryReports').onSnapshot(snapshot => {
        const reports = [];
        snapshot.forEach(doc => {
            reports.push({ id: doc.id, ...doc.data() });
        });
        window.appState.salaryReports = reports;
        saveToLocalStorage('salaryReports', reports);
    });

    // Sync absence records
    firestore.collection('absenceRecords').onSnapshot(snapshot => {
        const records = [];
        snapshot.forEach(doc => {
            records.push({ id: doc.id, ...doc.data() });
        });
        window.appState.absenceRecords = records;
        saveToLocalStorage('absenceRecords', records);
    });
}

// Firestore helper functions
async function saveToFirestore(collection, data) {
    try {
        if (data.id) {
            // Update existing document
            await firestore.collection(collection).doc(data.id).set(data);
        } else {
            // Create new document
            await firestore.collection(collection).add(data);
        }
        return true;
    } catch (error) {
        console.error('Error saving to Firestore:', error);
        return false;
    }
}

async function getFromFirestore(collection, id) {
    try {
        if (id) {
            const doc = await firestore.collection(collection).doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } else {
            const snapshot = await firestore.collection(collection).get();
            const items = [];
            snapshot.forEach(doc => {
                items.push({ id: doc.id, ...doc.data() });
            });
            return items;
        }
    } catch (error) {
        console.error('Error getting from Firestore:', error);
        return null;
    }
}

async function updateInFirestore(collection, id, data) {
    try {
        await firestore.collection(collection).doc(id).update(data);
        return true;
    } catch (error) {
        console.error('Error updating in Firestore:', error);
        return false;
    }
}

async function removeFromFirestore(collection, id) {
    try {
        await firestore.collection(collection).doc(id).delete();
        return true;
    } catch (error) {
        console.error('Error removing from Firestore:', error);
        return false;
    }
}

// Initialize real-time sync when the app starts
document.addEventListener('DOMContentLoaded', () => {
    setupRealtimeSync();
});

// Export functions for use in other modules
window.firebaseService = {
    saveToFirestore,
    getFromFirestore,
    updateInFirestore,
    removeFromFirestore
};
