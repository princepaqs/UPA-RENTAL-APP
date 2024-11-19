import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from 'expo-router';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, deleteUser, } from '@firebase/auth';
import { initializeApp } from '@firebase/app';
import { firebaseConfig } from "@/_dbconfig/dbconfig";
import * as SecureStore from 'expo-secure-store';
import { getDoc, setDoc, doc, getDocs, collection, updateDoc, deleteDoc, query, where } from 'firebase/firestore'; // For saving data in Firestore (optional)
import { db } from '../_dbconfig/dbconfig'; // Import Firestore instance
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'; // Import Firebase storage functions
import { storage } from '../_dbconfig/dbconfig'; // Import the storage from firebaseConfig
import { Alert } from "react-native";
import ErrorModal from '../components/ErrorModal';
import React from "react";

// Define the shape of the context
interface AuthContextType {
    user: any;
    isAuthenticated: boolean | undefined;
    onboardingCompleted: boolean; // Add a flag to track if onboarding has been completed
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (email: string, password: string, username: string) => Promise<void>;
    setPin: (pin: string) => Promise<void>;
    editUser: (uid: string, phoneNo: string, profession: string, salary: string, email: string, profilePictureUrl: string) => Promise<void>;
    removeUser: (email: string, password: string, uid: string) => Promise<void>;
    topUpWallet: (uid: string, value: string) => Promise<void>;
    withdrawWallet: (uid: string, value: string) => Promise<void>;
    addWalletTransaction: (uid: string, transactionType: string, paymentTransactionId: string, date: string, value: string, status: string) => Promise<void>;
    upgradeRole: (uid: string) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    addProperty: () => Promise<void>;
    editProperty: (email: string, uid: string) => Promise<void>;
    deleteProperty: (email: string, uid: string) => Promise<void>;
    rentProperty: () => Promise<void>;
    withdrawRent: (transactionId: string) => Promise<void>;
    payRent: (transactionId: string, ownerId: string, tenantId: string, payment: string, leaseStart: string, leaseEnd: string) => Promise<void>;
    approveTenant: (
        transactionId : string, ownerId: string, propertyId: string, tenantId: string, ownerFullName: string, ownerFullAddress: string, ownerContact: string, ownerEmail: string, tenantFullName: string, tenantFullAddress: string,
        tenantContact: string, tenantEmail: string, propertyName: string, propertyType: string, propertyAddress: string, propertyLeaseStart: string, propertyLeaseEnd: string, propertyLeaseDuration: string, propertyRentAmount: string, 
        propertyRentDueDay: string, propertySecurityDepositAmount: string, propertySecurityDepositRefundPeriod: string, propertyAdvancePaymentAmount: string, propertyHouseRules: string, propertyTerminationPeriod: string
    ) => Promise<void>; 
    rejectTenant: (transactionId: string) => Promise<void>; 
    addFavorite: (ownerId: string, propertyId: string) => Promise<void>;
    removeFavorite: (ownerId: string, propertyId: string) => Promise<void>;
    reportProperty: (ownerId: string, propertyId: string, tenantId: string, reportPropertyStep1: string, reportPropertyStep2: string, reportPropertyStep3: string) => Promise<void>;
    reportProfile: (ownerId: string, tenantId: string, reportPropertyStep1: string, reportPropertyStep2: string) => Promise<void>;
    reportIssue: (fullName: string, accountId: string, issue: string, issueId: string, description: string) => Promise<void>;
    maintenanceRequest: (uid: string, ownerId: string, propertyId: string, fullName: string, time: string, issueType: string, images: string, description: string) => Promise<void>;
    withdrawMaintenance: (uid: string, maintenanceId: string) => Promise<void>;
    updateMaintenance: (uid: string, maintenanceId: string, timeType: string, time: Date, status: string) => Promise<void>;
    sendMessage: (userId1: string, userId2: string, text: string) => Promise<void>;
    completeOnboarding: () => void; // Function to mark onboarding as completed
    
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export const AuthContextProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<any>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | undefined>(undefined);
    const [onboardingCompleted, setOnboardingCompleted] = useState(false); // Default to false
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [modalMessage, setModalMessage] = useState('');
    
    useEffect(() => {
        setTimeout(() => {
            setIsAuthenticated(true);
        }, 1500);
    }, []);

    const showErrorModal = (message: string) => {
        setModalMessage(message);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setModalMessage('');
    };

    
    const login = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await SecureStore.setItemAsync('uid', user.uid);
            const userDocRef = doc(db, 'users', user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const fullname = `${userData.firstName} ${userData.lastName}`;
                const accountStatus = userData?.accountStatus || '';
                await SecureStore.setItemAsync('accountStatus', accountStatus);
                
                const isVerified = user.emailVerified;
                if (!isVerified) {
                    await sendEmailVerification(user);
                    router.replace('../LoginEmailVerify');
                    return;
                }

                const hasPin = userData?.userPin;
                if (!hasPin) {
                    router.replace('../loginSetPin');
                    return;
                } else {
                    const usePassword = await SecureStore.getItemAsync('usePassword');

                    await SecureStore.setItemAsync('email', email);
                    await SecureStore.setItemAsync('password', password);
                    await SecureStore.setItemAsync('fullName', fullname);
                    await SecureStore.setItemAsync('accountId', userData.accountId);

                    await updateDoc(doc(db, 'users', user.uid), {userLoginTime: Date.now()});
                    if(usePassword === 'true'){
                        router.replace('../tabs/Dashboard');
                        await SecureStore.deleteItemAsync('usePassword');
                    } else{
                        await SecureStore.deleteItemAsync('usePassword');
                        router.replace('../loginPin');
                        const token = await user.getIdToken(true);
                        await SecureStore.setItemAsync('token', token);
                        //setIsAuthenticated(true); // this is where auto logged begins
                        //router.replace('../routes/userRoutes');
                    }
                    
                }
            } else {
                showErrorModal("No such user document in Firestore!");
            }
        } catch (error) {
            console.log(error)
            const firebaseError = error as { code: string; message: string };
            if (firebaseError.code === 'auth/invalid-email') {
                showErrorModal('The email address is not valid.');
            } else if (firebaseError.code === 'auth/wrong-password') {
                showErrorModal('The password is incorrect. Please try again.');
            } else if (firebaseError.code === 'auth/user-not-found') {
                showErrorModal('No user found with this email address.');
            } else if (firebaseError.code === 'auth/invalid-credential') {
                router.replace('../signIn');
                showErrorModal('Invalid credentials provided. Please check your email and password.');
            } else {
                showErrorModal('No internet connection');
            }
        }
    };
    

    const logout = async () => {
        try {
            // logout logic
            await SecureStore.deleteItemAsync('password');
            await SecureStore.deleteItemAsync('token');
            //setIsAuthenticated(false);
            auth.signOut();
            router.replace('../signIn')
        } catch (error) {
            console.error(error);
        }
    };

    //let sequence = 1;

    async function generateAccountId() {
        const usersCollection = collection(db, 'users');
        
        // Count the number of documents in the 'users' collection
        const snapshot = await getDocs(usersCollection);
        const accountCount = snapshot.size + 1; // Get document count and increment by 1 for the new account
        //console.log(accountCount);
        const year = new Date().getFullYear(); // Get the current year
        const randomFourDigit = Math.floor(1000 + Math.random() * 9000); // Generate a random 4-digit number
        const paddedSequence = String(accountCount).padStart(4, '0'); // Pad the sequence with leading zeros (e.g., '0001')
    
        const accountId = `${randomFourDigit}${year}-${paddedSequence}`;
        //console.log(randomFourDigit, year, paddedSequence, accountId);
        return accountId;
    }
    

    const register = async (email: string, password: string, username: string) => {
    try {
        await SecureStore.deleteItemAsync('email');
        await SecureStore.deleteItemAsync('password');
        // Generate the unique accountId
        const accountId = (await generateAccountId()).toString();
        //console.log('AccountId: ', accountId);

        // Retrieve user data from SecureStore
        const firstName = await SecureStore.getItemAsync('firstName');
        const middleName = await SecureStore.getItemAsync('middleName');
        const lastName = await SecureStore.getItemAsync('lastName');
        const birthday = await SecureStore.getItemAsync('birthday');
        const age = await SecureStore.getItemAsync('age');
        const gender = await SecureStore.getItemAsync('gender');
        const education = await SecureStore.getItemAsync('education');
        const civilStatus = await SecureStore.getItemAsync('civilStatus');
        const homeAddress = await SecureStore.getItemAsync('homeAddress');
        const region = await SecureStore.getItemAsync('location');
        const city = await SecureStore.getItemAsync('city');
        const barangay = await SecureStore.getItemAsync('barangay');
        const phoneNo = await SecureStore.getItemAsync('phoneNo');
        const profession = await SecureStore.getItemAsync('profession');
        const salary = await SecureStore.getItemAsync('salary');
        const profilePictureURL = await SecureStore.getItemAsync('profilePictureURL') || '';
        const barangayClearanceURL = await SecureStore.getItemAsync('barangayClearanceURL') || '';
        const nbiClearanceURL = await SecureStore.getItemAsync('nbiClearanceURL') || '';
        const govtIDURL = await SecureStore.getItemAsync('govtIDURL') || '';
        const proofOfIncomeURL = await SecureStore.getItemAsync('proofOfIncomeURL') || '';
        const userPin = '';
        const userLoginTime = '';


        // add an email verification that will be sent to user's email


        // Create user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (user) {
        // Function to upload images
        const uploadImageToStorage = async (uri: string, folderName: string, uid: string) => {
            if (!uri) return ''; // Skip upload if no URI
            try {
            //const sanitizedEmail = email.toLowerCase();
            const fileName = `${uid}-${folderName}`;
            const storageRef = ref(storage, `${folderName}/${fileName}`);
            const response = await fetch(uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            return fileName;
            } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
            }
        };

        // Upload images and get URLs
        const profilePicUrl = await uploadImageToStorage(profilePictureURL, 'profilepictures', user.uid);
        const barangayClearanceUrl = await uploadImageToStorage(barangayClearanceURL, 'barangayclearances', user.uid);
        const nbiClearanceUrl = await uploadImageToStorage(nbiClearanceURL, 'nbiclearances', user.uid);
        const govtIdUrl = await uploadImageToStorage(govtIDURL, 'govtids', user.uid);
        const proofOfIncomeUrl = await uploadImageToStorage(proofOfIncomeURL, 'proofofincome', user.uid);

        // Create a user document
        const userDocument = {
            accountId,
            firstName,
            middleName,
            lastName,
            birthday,
            age,
            gender,
            education,
            civilStatus,
            homeAddress,
            region,
            city,
            barangay,
            phoneNo,
            profession,
            salary,
            email,
            profilePicture: profilePicUrl,
            barangayClearance: barangayClearanceUrl,
            nbiClearance: nbiClearanceUrl,
            govtID: govtIdUrl,
            proofOfIncome: proofOfIncomeUrl,
            userPin,
            userLoginTime,
            role: 'Tenant',
            roleStatus: 'Under-review',
            rating: '0',
            latitude: '0',
            longitude: '0',
            accountStatus: 'Under-review',
            createdAt: new Date(),
        };

        // Save the user document using the user's UID as the document ID
        await setDoc(doc(db, 'users', user.uid), userDocument);

        await sendEmailVerification(user);

        // Store the user token securely
        const token = await user.getIdToken();
        await SecureStore.setItemAsync('token', token);

        // Optionally, store the email in SecureStore
        await SecureStore.setItemAsync('email', email);

        // Update the state
        setUser(user);
        createWallet(user.uid);
        setIsAuthenticated(true);
        //console.log('Registration successful');

        // Navigate to user routes after successful registration
        //router.replace('/success');
        }
    } catch (error) {
        const firebaseError = error as { code: string; message: string };
        Alert.alert('Login failed', firebaseError.message || 'An error occurred during register');
    }
    };

    const setPin = async(pin: string) => {
        const tenantId = await SecureStore.getItemAsync('uid');
        if (pin && tenantId) {
            const userRef = doc(db, 'users', tenantId); // Reference to the user's document
            
            await updateDoc(userRef, {
              userPin: pin
            });
            
            console.log('No Pin');
            sendMessage('rc5QuV3An1XD5WMoaoRzwIZPK842', user.uid, 'Hello Juan! Welcome to UPA Support. How can we assist you today? We`re here to help with any questions or issues you may have!');
        
            console.log(`Pin has been set.`);
        } else {
        console.log('Tenant ID is missing.');
        }
    }

    const createWallet = async (tenantId: string) => {
        // create wallet db here

        if(tenantId){

            const setWalletData = {
                walletId: tenantId, 
                balance: 0,
            };

            await setDoc(doc(db, 'wallets', tenantId), setWalletData);
        }
    }

    const withdrawWallet = async (tenantId: string, value: string) => {
        if(tenantId){
            try{

            }catch(error){

            }
        }
    }

    const topUpWallet = async (uid: string, value: string) => {
        if (uid && value) {
            try {
                console.log('TenantId : ', uid, 'TopUp value : ', value);
    
                // Get wallet data using the tenantId
                const walletRef = doc(db, 'wallets', uid);
                const walletSnap = await getDoc(walletRef);
    
                if (walletSnap.exists()) {
                    const walletData = walletSnap.data();
                    const currentBalance = walletData.balance || 0;
    
                    // Parse balance and value to integers
                    const updatedBalance = parseInt(currentBalance) + parseInt(value);
    
                    // Set the updated balance back into the database
                    await setDoc(walletRef, { ...walletData, balance: updatedBalance });
    
                    console.log(`Wallet updated: ${uid} has new balance of ${updatedBalance}`);
                } else {
                    // Handle if wallet does not exist for the tenant
                    console.error(`No wallet found for tenantId: ${uid}`);
                }
            } catch (error) {
                console.error('Error topping up wallet:', error);
            }
        }
    }

    const addWalletTransaction = async (uid: string, transactionType: string, paymentTransactionId: string, date: string, value: string, status: string) => {
        if(uid && transactionType && date && value){
            try{
                console.log('Transaction type : ', transactionType);
                console.log('Date : ', date);
                console.log('Value: ', value);

                const setWalletTransactionData = {
                    uid: uid,
                    transactionId: await generateAccountId(),
                    transactionType: transactionType,
                    paymentTransactionId: paymentTransactionId,
                    date: date,
                    value: value,
                    status,
                }

                await setDoc(doc(db, 'walletTransactions', uid, 'walletId', setWalletTransactionData.transactionId), setWalletTransactionData);
            } catch(error){

            }
        }
    }

    const upgradeRole = async (tenantId: string) => {
        // This is where the tenant becomes the owner
        if (tenantId) {
          const userRef = doc(db, 'users', tenantId); // Reference to the user's document
          
          // Update the user's role to 'owner'
          await updateDoc(userRef, {
            role: 'Owner'
          });
      
          console.log(`Role for tenant ${tenantId} upgraded to owner.`);
        } else {
          console.log('Tenant ID is missing.');
        }
      };

    const editUser = async(uid: string, phoneNo: string, profession: string, salary: string, email: string, profilePictureUrl: string) => {
        console.log('UID:', uid);
        console.log('Phone Number:', phoneNo);
        console.log('Profession: ', profession);
        console.log('Salary:', salary);
        console.log('Email:', email);
        console.log('Profile Picture URL:', profilePictureUrl);

        const uploadImageToStorage = async (uri: string, folderName: string, uid: string) => {
            if (!uri) return ''; // Skip upload if no URI
            try {
            //const sanitizedEmail = email.toLowerCase();
            const fileName = `${uid}-${folderName}`;
            const storageRef = ref(storage, `${folderName}/${fileName}`);
            const response = await fetch(uri);
            const blob = await response.blob();
            await uploadBytes(storageRef, blob);
            return fileName;
            } catch (error) {
            console.error("Error uploading image:", error);
            throw error;
            }
        };

        const profilePicUrl = await uploadImageToStorage(profilePictureUrl, 'profilepictures', uid);


        try {
            // Reference to the user's document in Firestore
            const userDocRef = doc(db, 'users', uid);
    
            // Update the user data without the email
            await updateDoc(userDocRef, {
                phoneNo: phoneNo,
                profession: profession,
                salary: salary,
                profilePicture: profilePicUrl
            });
    
            console.log('User data updated successfully');
        } catch (error) {
            console.error('Error updating user data: ', error);
        }


    }


/*
    const removeUser = async (email: string, password: string, tenantId: string, ) => {
        try {
          // 1. Delete user from Firebase Authentication
          const user = auth.currentUser;
          
          if (user) {
            await deleteUser(user);
          }

          // add logic if the user is existing in propertyTransactions and rentTransactions
      
          /*
          // 2. Delete Firestore documents
          // Delete user data in various Firestore collections
          const collectionsToDelete = ['users', 'wallets', 'walletTransactions', 'properties', 'favorites', 'transactions'];
      
          for (const collectionName of collectionsToDelete) {
            const q = query(collection(db, collectionName), where("tenantId", "==", tenantId));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(async (docSnapshot) => {
              await deleteDoc(docSnapshot.ref);
            });
          }
          // Check first if there is an existing transaction where uid = tenantId or ownerId
          // Delete property-specific data
          const propertiesCollection = collection(db, `properties/${tenantId}/propertyId`);
          const propertiesSnapshot = await getDocs(propertiesCollection);
          propertiesSnapshot.forEach(async (propertyDoc) => {
            await deleteDoc(propertyDoc.ref);
          });
          // Dont this yet
          // 3. Delete user files from Firebase Storage
          const filesToDelete = [
            `profilepictures/${email}-profilepictures`,
            `barangayclearances/${email}-barangayclearances`,
            `govtids/${email}-govtids`,
            `nbiclearances/${email}-nbiclearances`,
            `proofofincome/${email}-proofofincome`
          ];
      
          for (const filePath of filesToDelete) {
            const fileRef = ref(storage, filePath);
            await deleteObject(fileRef);
          }
      
          // Delete all images under properties/{tenantId}/propertyId/{propertyId} from Firebase Storage
          const propertyImagesRef = ref(storage, `properties/${tenantId}/propertyId/`);
          const listResponse = await listAll(propertyImagesRef);
          listResponse.items.forEach(async (itemRef) => {
            await deleteObject(itemRef);
          });
      
          console.log(`User ${tenantId} and all associated data have been deleted.`); 
        } catch (error) {
          console.error("Error deleting user and associated data:", error);
        }
      };*/

      const removeUser = async (email: string, password: string, tenantId: string) => {
        try {
            // Check if the user has existing transactions in both collections or if wallet balance is 0
            const hasActiveTransactions = await checkUserInTransactions("rentTransactions", tenantId) &&
                                        await checkUserInTransactions("propertyTransactions", tenantId) &&
                                        await checkWalletBalance(tenantId);
    
            if (hasActiveTransactions) {
                console.log("User has active transactions and cannot be deleted.");
                return; // Exit the function without deleting the user
            }
    
            // 1. Delete user from Firebase Authentication
            const user = auth.currentUser;
            if (user) {
                await deleteUser(user);
                console.log("User deleted from Firebase Authentication.");
            }
            await SecureStore.deleteItemAsync('email');
            await SecureStore.deleteItemAsync('password');
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };
    
    // Helper function to check for the user's existence in a collection
    const checkUserInTransactions = async (collectionName: string, tenantId: string) => {
        try {
            const collectionRef = collection(db, collectionName);
            const tenantQuery = query(collectionRef, where("tenantId", "==", tenantId));
            const ownerQuery = query(collectionRef, where("ownerId", "==", tenantId));
    
            const tenantSnapshot = await getDocs(tenantQuery);
            const ownerSnapshot = await getDocs(ownerQuery);
    
            return !tenantSnapshot.empty || !ownerSnapshot.empty; // Returns true if transactions exist for tenantId or ownerId
        } catch (error) {
            console.error(`Error checking transactions in ${collectionName}:`, error);
            return false;
        }
    };
    
    // Helper function to check wallet balance (assuming "wallets" is a collection with a balance field)
    const checkWalletBalance = async (tenantId: string) => {
        try {
            const walletRef = collection(db, 'wallets');
            const walletQuery = query(walletRef, where('tenantId', '==', tenantId));
            const walletSnapshot = await getDocs(walletQuery);
    
            if (!walletSnapshot.empty) {
                const walletDoc = walletSnapshot.docs[0];
                const balance = walletDoc.data().balance || 0; // Assuming the balance field exists
                return balance === 0; // Returns true if balance is 0
            }
            return false;
        } catch (error) {
            console.error("Error checking wallet balance:", error);
            return false;
        }
    };
    


    const resetPassword = async (email: string) => {
        if (email) {
            try {
                // Attempt to send a password reset email
                await sendPasswordResetEmail(auth, email);
    
                // If successful, delete the stored password
                await SecureStore.deleteItemAsync('password');
            } catch (error) {
                // Handle errors (e.g., invalid email)
                Alert.alert('Error', 'Failed to send password reset email. Please try again.');
            }
        } else {
            Alert.alert('Error', 'Please enter a valid email.');
        }
    };

    const generateTransactionID = () => {
        const now = new Date();
        const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // Format YYYYMMDD
        const randomNumbers = Math.floor(1000 + Math.random() * 9000); // Generate 4 random digits
        return `${date}${randomNumbers}`; // Format: YYYYMMDDXXXX
    };

    const addProperty = async () => {
        try {
            // Retrieve property details from SecureStore
            const uid = await SecureStore.getItemAsync('uid');
            if (!uid) {
                Alert.alert("Error", "User ID is missing!");
                return;
            }
            upgradeRole(uid); // change it once there is a modal in lease my property
    
            // Count the number of properties in the database
            const propertiesSnapshot = await getDocs(collection(db, 'properties', uid, 'propertyId')); // Adjust the path if necessary
            const propertyId = await generateTransactionID();
            //console.log(propertyId);
            const propertyName = await SecureStore.getItemAsync('propertyName');
            const propertyType = await SecureStore.getItemAsync('propertyType');
            const noOfBedrooms = await SecureStore.getItemAsync('noOfBedrooms');
            const noOfBathrooms = await SecureStore.getItemAsync('noOfBathrooms');
            const noOfTenants = await SecureStore.getItemAsync('noOfTenants');
            const furnishing = await SecureStore.getItemAsync('furnishing');
            const imagesValue = await SecureStore.getItemAsync('images'); // Assuming this is a JSON string
            const images = imagesValue ? JSON.parse(imagesValue) : []; // Parse the JSON string into an array
            const propertyHomeAddress = await SecureStore.getItemAsync('propertyHomeAddress');
            const propertyRegion = await SecureStore.getItemAsync('propertyRegion');
            const propertyCity = await SecureStore.getItemAsync('propertyCity');
            const propertyBarangay = await SecureStore.getItemAsync('propertyBarangay');
            const propertyZipCode = await SecureStore.getItemAsync('propertyZipCode');
            const propertyLatitude = await SecureStore.getItemAsync('propertyLatitude');
            const propertyLongitude = await SecureStore.getItemAsync('propertyLongitude');
            const propertyMonthlyRent = await SecureStore.getItemAsync('propertyMonthlyRent');
            const propertyLeaseDuration = await SecureStore.getItemAsync('propertyLeaseDuration');
            const propertySecurityDepositMonth = await SecureStore.getItemAsync('propertySecurityDepositMonth');
            const propertySecurityDepositAmount = await SecureStore.getItemAsync('propertySecurityDepositAmount');
            const propertyAdvancePaymentAmount = await SecureStore.getItemAsync('propertyAdvancePaymentAmount');
            //const propertyWaterFee = await SecureStore.getItemAsync('propertyWaterFee') || '';
            //const propertyElectricFee = await SecureStore.getItemAsync('propertyElectricFee') || '';
            //const propertyGasFee = await SecureStore.getItemAsync('propertyGasFee') || '';
            //const propertyInternetFee = await SecureStore.getItemAsync('propertyInternetFee') || '';
            const propertyPetPolicy = await SecureStore.getItemAsync('propertyPetPolicy');
            const propertyHouseRules = await SecureStore.getItemAsync('propertyHouseRules');
            
    
            // Check for missing fields
            if (!propertyName || !propertyType || !noOfBedrooms || !noOfBathrooms ||
                !noOfTenants || !furnishing || !images || !propertyHomeAddress || !propertyRegion ||
                !propertyCity || !propertyBarangay || !propertyZipCode || !propertyLatitude ||
                !propertyLongitude || !propertyMonthlyRent || !propertyLeaseDuration ||
                !propertySecurityDepositMonth || !propertySecurityDepositAmount || 
                !propertyAdvancePaymentAmount || !propertyPetPolicy || !propertyHouseRules) {
                
                Alert.alert("Error", "Missing Field!");
                return;
            }
    
            const uploadImageToStorage = async (uri: string, fileName: string, propertyId: string) => {
                try {
                    // Define the path with folders
                    const storageRef = ref(storage, `properties/${propertyId}/images/${fileName}`);
                    
                    // Fetch the image and convert it to a blob
                    const response = await fetch(uri);
                    const blob = await response.blob();
                    
                    // Upload the file to the specified path in Firebase Storage
                    await uploadBytes(storageRef, blob);
                    return fileName;
                } catch (error) {
                    console.error("Error uploading image:", error);
                    throw error;
                }
            };
            
            // Upload property images
            const uploadedImageUrls = [];
            for (const image of images) {
                const imageUrl = await uploadImageToStorage(image.uri, image.fileName, propertyId);
                uploadedImageUrls.push(imageUrl);
            }
    
            // Create property document
            const propertyDocument = {
                propertyId,
                propertyName,
                propertyType,
                noOfBedrooms,
                noOfBathrooms,
                noOfTenants,
                furnishing,
                images: uploadedImageUrls, // Store uploaded image URLs
                propertyHomeAddress,
                propertyRegion,
                propertyCity,
                propertyBarangay,
                propertyZipCode,
                propertyLatitude,
                propertyLongitude,
                propertyMonthlyRent,
                propertyLeaseDuration,
                propertySecurityDepositMonth,
                propertySecurityDepositAmount,
                propertyAdvancePaymentAmount,
                //propertyWaterFee,
                //propertyElectricFee,
                //propertyGasFee,
                //propertyInternetFee,
                propertyPetPolicy,
                propertyHouseRules,
                status: 'Available',
                createdAt: new Date(),
            };

            /*const propertyStatuses = {
                tenantId: tenantId,
                status: 'Available'
            }*/
    
            // Save property document to Firestore under the user's UID
            await setDoc(doc(db, 'properties', uid, 'propertyId', propertyId), propertyDocument);

            // Save status of property
            //await setDoc(doc(db, 'transaction', propertyId, 'status', ownerId), propertyStatuses);
    
            //console.log('Property added successfully');
    
            // Navigate to property dashboard or success page
            router.replace('../PropertyDashboard');
        } catch (error) {
            console.error("Error adding property:", error);
        }
    };
    
    

    const editProperty = async() => {
        
    }

    const deleteProperty = async() => {

    }

    const rentProperty = async () => {
        try {
            // Retrieve necessary data from SecureStore
            const ownerId = await SecureStore.getItemAsync('userId') || '';
            const propertyId = await SecureStore.getItemAsync('propertyId') || '';
            const tenantId = await SecureStore.getItemAsync('uid') || '';
            const moveInDateString = await SecureStore.getItemAsync('moveInDate') || 'No Date';
            console.log('MoveInDateString:', moveInDateString);
    
            let formattedMoveInDate = 'No Date';
            if (moveInDateString !== 'No Date') {
                // Trim the string to check for extra spaces
                const trimmedMoveInDateString = moveInDateString.trim();
    
                // Convert to YYYY-MM-DD format for reliable parsing
                const dateParts = trimmedMoveInDateString.split(' ');
    
                // Define the month map with a specific type
                const monthMap: { [key: string]: string } = {
                    January: '01', February: '02', March: '03',
                    April: '04', May: '05', June: '06',
                    July: '07', August: '08', September: '09',
                    October: '10', November: '11', December: '12'
                };
    
                // Use a type assertion to inform TypeScript that dateParts[0] is a month name
                const month = monthMap[dateParts[0] as keyof typeof monthMap]; // Get the month number
                const day = dateParts[1].replace(',', ''); // Remove the comma
                const year = dateParts[2];
    
                // Formulate the new date string
                const formattedDateString = `${year}-${month}-${day}`; // e.g., '2024-10-31'
                const moveInDate = new Date(formattedDateString);
                console.log('Parsed MoveInDate:', moveInDate);
    
                // Check if the date is valid
                if (!isNaN(moveInDate.getTime())) { // Valid date check
                    console.log('MoveInDate is valid:', moveInDate);
                    
                    // Format to MM/DD/YYYY
                    const formattedMonth = String(moveInDate.getMonth() + 1).padStart(2, '0'); // getMonth() is zero-based
                    const formattedDay = String(moveInDate.getDate()).padStart(2, '0');
                    const formattedYear = moveInDate.getFullYear();
    
                    formattedMoveInDate = `${formattedMonth}/${formattedDay}/${formattedYear}`;
                    console.log('FormattedMoveInDate:', formattedMoveInDate);
                } else {
                    console.error('Invalid date format:', trimmedMoveInDateString);
                }
            } else {
                console.log('No Move-In Date available.');
            }
    
            // Proceed with creating the transaction in Firestore
            try {
                // Generate a unique transactionId (can use UUID or Firestore auto-ID)
                const transactionId = `${ownerId}-${propertyId}-${tenantId}`;
            
                // Create the transaction document in Firestore
                const transactionRef = doc(db, 'propertyTransactions', transactionId);
                
                await setDoc(transactionRef, {
                    transactionId,
                    tenantId,
                    ownerId,
                    propertyId,
                    rentAmount: null,
                    moveInDate: formattedMoveInDate,
                    rentalStartDate: 'no date', // Set the current date as rental start date
                    rentalEndDate: 'no date', // Can be filled later if necessary
                    status: 'In-review',
                    paymentStatus: 'pending',
                    createdAt: new Date(),
                    updatedAt: null,
                });
    
                console.log('Transaction created successfully.');
            } catch (error) {
                console.error('Error creating transaction:', error);
            }
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };
    

    const withdrawRent = async(transactionId : string) => {
        try {
            if (transactionId) {
                // Delete the document with the specified transaction ID
                await deleteDoc(doc(db, 'propertyTransactions', transactionId));
                //console.log(`Transaction ${transactionId} deleted successfully.`);
            } else {
                console.error('Transaction ID not found');
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    }

    const payRent = async(transactionId: string, ownerId: string, tenantId: string, payment: string, leaseStart: string, leaseEnd: string) => {
        const tenantWalletRef = await getDoc(doc(db, 'wallets', tenantId));
        const ownerWalletRef = await getDoc(doc(db, 'wallets', ownerId));
        
        if(tenantWalletRef.exists() && ownerWalletRef.exists()){
            const tenantData = tenantWalletRef.data();
            const ownerData = ownerWalletRef.data();
            if(tenantData && ownerData && transactionId){
                const newTenantBalance = tenantData.balance - parseInt(payment);
                const newOwnerBalance = ownerData.balance + parseInt(payment);
                if(tenantId && payment){
                    const rentRef = await getDoc(doc(db, 'rentTransactions', transactionId));
                    if(rentRef.exists()){
                        const data = rentRef.data();
                        if(data){
                            const paymentDuration = parseInt(data.paymentDuration) - 1;
                            await updateDoc(doc(db, 'rentTransactions', transactionId), {paymentDuration: paymentDuration.toString()});
                            await updateDoc(doc(db, 'propertyTransactions', transactionId), {paymentStatus: 'ongoing', rentalStartDate: leaseStart, rentalEndDate: leaseEnd});
                        }
                    }
                    const setTenantWalletData = {
                        balance: newTenantBalance,
                    };
                    const setOwnerWalletData = {
                        balance: newOwnerBalance,
                    };
                    await updateDoc(doc(db, 'wallets', tenantId), setTenantWalletData);
                    await updateDoc(doc(db, 'wallets', ownerId), setOwnerWalletData);
                    console.log('Rent Paid');
                }
            }
        }
    }
      

    //later 
    const approveTenant = async (
        transactionId: string,
        ownerId: string,
        propertyId: string,
        tenantId: string,
        ownerFullName: string,
        ownerFullAddress: string,
        ownerContact: string,
        ownerEmail: string,
        tenantFullName: string,
        tenantFullAddress: string,
        tenantContact: string,
        tenantEmail: string,
        propertyName: string,
        propertyType: string,
        propertyAddress: string,
        propertyLeaseStart: string,
        propertyLeaseEnd: string,
        propertyLeaseDuration: string,
        propertyRentAmount: string,
        propertyRentDueDay: string,
        propertySecurityDepositAmount: string,
        propertySecurityDepositRefundPeriod: string,
        propertyAdvancePaymentAmount: string,
        propertyHouseRules: string,
        propertyTerminationPeriod: string
      ) => {
        try {
          // Approve the transaction by updating its status in 'propertyTransactions'
          if (transactionId) {
            await updateDoc(doc(db, 'propertyTransactions', transactionId), { rentalStartDate: propertyLeaseStart, rentalEndDate: propertyLeaseEnd, status: 'Waiting Signature & Payment' });
            await updateDoc(doc(db, 'properties', ownerId, 'propertyId', propertyId), { status: 'Rented' });
      
            // Add the contract details into a new collection named 'contracts' with the transactionId as the document ID
            await setDoc(doc(db, 'contracts', transactionId), {
              transactionId,
              ownerId,
              propertyId,
              tenantId,
              ownerFullName,
              ownerFullAddress,
              ownerContact,
              ownerEmail,
              tenantFullName,
              tenantFullAddress,
              tenantContact,
              tenantEmail,
              propertyName,
              propertyType,
              propertyAddress,
              propertyLeaseStart,
              propertyLeaseEnd,
              propertyLeaseDuration,
              propertyRentAmount,
              propertyRentDueDay,
              propertySecurityDepositAmount,
              propertySecurityDepositRefundPeriod,
              propertyAdvancePaymentAmount,
              propertyHouseRules,
              propertyTerminationPeriod,
              status: 'Pending',  // Optionally, add a status for the contract
              createdAt: new Date()  // Add a timestamp for when the contract was created
            });

            if(propertyLeaseDuration === 'Long-term (1 year)'){
                const paymentDuration = '12';
                await setDoc(doc(db, 'rentTransactions', transactionId), {
                    transactionId,
                    ownerId,
                    propertyId,
                    tenantId,
                    propertyLeaseStart,
                    propertyLeaseEnd,
                    propertyLeaseDuration,
                    propertyRentAmount,
                    propertyRentDueDay,
                    propertySecurityDepositAmount,
                    propertySecurityDepositRefundPeriod,
                    propertyAdvancePaymentAmount,
                    paymentDuration: paymentDuration,
                    status: 'Rented'
                });
            } else{
                const paymentDuration = '6';
                await setDoc(doc(db, 'rentTransactions', transactionId), {
                    transactionId,
                    ownerId,
                    propertyId,
                    tenantId,
                    propertyLeaseStart,
                    propertyLeaseEnd,
                    propertyLeaseDuration,
                    propertyRentAmount,
                    propertyRentDueDay,
                    propertySecurityDepositAmount,
                    propertySecurityDepositRefundPeriod,
                    propertyAdvancePaymentAmount,
                    paymentDuration: paymentDuration,
                    status: 'Rented'
                });
            }
      
            console.log(`Transaction ${transactionId} approved successfully and contract created.`);
          } else {
            console.error('Transaction ID not found');
          }
        } catch (error) {
          console.error('Error: ', error);
        }
      };
      

    const rejectTenant = async(transactionId: string) => {
        try {
            if (transactionId) {
                // Delete the document with the specified transaction ID
                await deleteDoc(doc(db, 'propertyTransactions', transactionId));
                //console.log(`Transaction ${transactionId} deleted successfully.`);
            } else {
                console.error('Transaction ID not found');
            }
        } catch (error) {
            console.error('Error: ', error);
        }
    };

    const acceptContract = async(transactionId: string) => {
        //update the contract status into active
    }

    const rejectContract = async(transactionId: string) => {
        ////update the contract status into rejected
    }

    const addFavorite = async (ownerId: string, propertyId: string) => {
        try {
            //console.log(ownerId, propertyId);
            const tenantId = await SecureStore.getItemAsync('uid') || '';
            
            // Create a unique favorite ID
            //const favoriteId = `${tenantId}-${propertyId}-${ownerId}`;
            const favoriteDocument = {
                ownerId,
                propertyId,
                tenantId,
            };
    
            // Create a reference to the favorite document
            const favoriteRef = doc(db, 'favorites', tenantId, 'owner', ownerId);
    
            // Check if the property is already a favorite
            const docSnap = await getDoc(favoriteRef);
            if (docSnap.exists()) {
                removeFavorite(ownerId, propertyId) // Exit if already a favorite
                return;
            }
    
            // Add the favorite document
            await setDoc(favoriteRef, favoriteDocument);
            //console.log('Property added to favorites');
        } catch (error) {
            console.error('Failed to add to favorites:', error); // Log the error for debugging
        }
    };

    const removeFavorite = async (ownerId: string, propertyId: string) => {
        try {
            const tenantId = await SecureStore.getItemAsync('uid') || '';
            //console.log(tenantId);
            
            // Reference the collection where the favorite properties are stored
            const favoritesRef = collection(db, 'favorites', tenantId, 'owner');
            const q = query(favoritesRef, where("propertyId", "==", propertyId), where("ownerId", "==", ownerId));
            
            // Get the documents that match the query
            const querySnapshot = await getDocs(q);
            
            // Loop through the matching documents and delete each one
            querySnapshot.forEach(async (docSnapshot) => {
                await deleteDoc(docSnapshot.ref);
                //console.log('Property removed from favorites');
            });
        } catch (error) {
            console.error('Failed to remove from favorites:', error);
        }
    };

    const reportProperty = async (ownerId: string, propertyId: string, tenantId: string, reportPropertyStep1: string, reportPropertyStep2: string, reportPropertyStep3: string) => {
        try {
            const reportPropertyData = {
                ownerId,
                propertyId,
                tenantId,
                reportPropertyStep1,
                reportPropertyStep2,
                reportPropertyStep3,
                createdAt: new Date()
            }

            if(reportPropertyData){
                await setDoc(doc(db, 'propertyReports', `${ownerId}-${propertyId}-${tenantId}`), reportPropertyData)
                console.log('Report property successful');
            }else{
                console.log('Report property failed');
            }
        } catch (error) {
            
        }
    }

    const reportProfile = async (ownerId: string, tenantId: string, reportPropertyStep1: string, reportPropertyStep2: string) => {
        try {
            const reportProfileData = {
                ownerId,
                tenantId,
                reportPropertyStep1,
                reportPropertyStep2,
                createdAt: new Date()
            }

            if(reportProfileData){
                await setDoc(doc(db, 'userReports', ownerId, 'userIds', tenantId), reportProfileData)
                console.log('Report profile successful');
            }else{
                console.log('Report profile failed');
            }
        } catch (error) {
            
        }
    }

    const reportIssue = async (fullName: string, accountId: string, issue: string, issueId: string, description: string) => {
        try {
            const reportIssueData = {
                fullName,
                accountId,
                issue,
                issueId,
                description
            }

            if(reportIssueData){
                await setDoc(doc(db, 'issueReports', accountId), reportIssueData)
                console.log('Report issue successful');
            }
        } catch (error) {
            console.log('Report issue failed');
        }
    }

    const maintenanceRequest = async (
        tenantId: string,
        ownerId: string,
        propertyId: string,
        fullName: string,
        time: string,
        issueType: string,
        imagesValue: string,
        description: string
    ) => {
        // Parse images from JSON string
        const images = imagesValue ? JSON.parse(imagesValue) : [];
    
        // Check if all required fields are filled
        if (!tenantId || !ownerId || !propertyId || !fullName || !time || !issueType || !description || images.length === 0) {
            Alert.alert('Error', 'Please input all fields!');
            return; // Exit function if fields are missing
        }

        if (!Array.isArray(images)) {
            console.error("Expected an array of images, but got:", images);
            return;
          }

        console.log(tenantId, ownerId, propertyId, fullName, time, issueType, images, description);
    
        // Image upload function
        const uploadImageToStorage = async (uri: string, fileName: string, tenantId: string) => {
            try {
                const response = await fetch(uri);
                console.log('Image response status:', response.status);
                if (!response.ok) {
                    throw new Error('Failed to fetch image');
                }
                const blob = await response.blob();
        
                const storageRef = ref(storage, `maintenances/${tenantId}/images/${fileName}`);
                await uploadBytes(storageRef, blob);
                return fileName;
            } catch (error) {
                console.error("Error uploading image:", error, fileName);
                throw error;
            }
        };
        
    
        // Array to store uploaded image URLs
        const uploadedImageUrls = [];
    
        // Upload images sequentially to catch errors for each one
        for (const image of images) {
            try {
                console.log(image.file);
                const imageUrl = await uploadImageToStorage(image.uri, image.fileName, tenantId);
                uploadedImageUrls.push(imageUrl);
            } catch (error) {
                Alert.alert("Error", `Failed to upload image: ${image.fileName}`);
                console.error("Image upload error:", error);
                return; // Exit if an image upload fails
            }
        }
    
        const transactionId = generateTransactionID();

        // Create maintenance document
        const maintenanceDocument = {
            transactionId: transactionId,
            tenantId,
            propertyId,
            ownerId,
            fullName,
            time,
            issueType,
            images: uploadedImageUrls, // Store uploaded image URLs
            description,
            status: 'Pending',
            submittedAt: new Date(),
            approvedAt: null,
            progressAt: null,
            completedAt: null,
        };
    
        // Save to Firestore
        try {
            await setDoc(doc(db, 'maintenances', tenantId, 'maintenanceId', transactionId), maintenanceDocument);
            Alert.alert('Success', 'Maintenance request submitted successfully');
        } catch (error) {
            console.error("Error saving maintenance document:", error);
            Alert.alert('Error', 'Failed to submit maintenance request');
        }
    
        // Log values for debugging
        console.log(tenantId, fullName, time, issueType, images, description);
    };

    const withdrawMaintenance = async (uid: string, maintenanceId: string) => {
        try { 
            await deleteDoc(doc(db, 'maintenances', uid, 'maintenanceId', maintenanceId));
            Alert.alert('Success', 'Maintenance request withdrawn successfully.')
        } catch (error) {
            Alert.alert('Error', 'Error withdrawing maintenance request.')
        }
    }

    const updateMaintenance = async (uid: string, maintenanceId: string, timeType: string, time: Date, status: string) => {
        try {
            const preferredTime = await SecureStore.getItemAsync('prefTime');
            
            const maintenanceRef = doc(db, 'maintenances', uid, 'maintenanceId', maintenanceId);
            
            if (timeType === 'approvedAt') {
                await updateDoc(maintenanceRef, {
                    [timeType]: time,
                    preferredTime: preferredTime,
                    status: status,
                });
            } else {
                await updateDoc(maintenanceRef, {
                    [timeType]: time,
                    status: status,
                });
            }
        } catch (error) {
            Alert.alert('Error', 'Error updating maintenance request.');
        }
    };
    

    const sendMessage = async (userId1: string, userId2: string, text: string) => {
        try {
            const message = {
                messageId: await generateAccountId(),
                userId1,
                userId2,
                text,
                createdAt: new Date(),
                status: 'Unread',
            }

            if(message){
                await setDoc(doc(db, 'messages', message.messageId), message)
                console.log('Message sent')
            }
        } catch (error) {
            
        }
    }

    // // will pass from message upa
    // const messageFromUser = {
    //     messageId: await generateAccountId(),
    //     userId1: userId2, //upa admin id
    //     userId2: 'rc5QuV3An1XD5WMoaoRzwIZPK842',
    //     text: `\bREPORT AN ISSUE\nReport ID: \nFull Name: \nAccount No.: \nCategory: \nApplication ID: \nDescription: `,
    //     createdAt: new Date()
    // }

    // if(messageFromUser){
    //     await setDoc(doc(db, 'messages', messageFromUser.messageId), messageFromUser)
    //     console.log('Message sent')
    // }
    

    // Function to mark onboarding as completed
    const completeOnboarding = () => {
        setOnboardingCompleted(true);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, onboardingCompleted, login, register, logout, setPin, editUser, removeUser, 
            withdrawWallet, topUpWallet, addWalletTransaction, upgradeRole, resetPassword, addProperty, editProperty, deleteProperty, 
            completeOnboarding, rentProperty, withdrawRent, payRent, approveTenant, rejectTenant, addFavorite, removeFavorite, 
            reportProperty, reportProfile, reportIssue, maintenanceRequest, withdrawMaintenance, updateMaintenance, 
            sendMessage }}>
            {children}
            <ErrorModal visible={modalVisible} message={modalMessage} onClose={closeModal} />
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const value = useContext(AuthContext);

    if (!value) {
        throw new Error("useAuth must be wrapped inside AuthContextProvider");
    }
    return value;
};
