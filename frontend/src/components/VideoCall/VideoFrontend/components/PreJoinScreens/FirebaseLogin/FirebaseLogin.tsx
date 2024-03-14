import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore/lite';
import { getAnalytics } from "firebase/analytics";
import { GoogleAuthProvider, getAuth, signInWithRedirect, getRedirectResult } from "firebase/auth";
import { firebaseConfig } from './config';
   
  // Initialize Firebase
   
const app = initializeApp(firebaseConfig);
   
const analytics = getAnalytics(app);

const provider = new GoogleAuthProvider();


const auth = getAuth();
signInWithRedirect(auth, provider);
/*
getRedirectResult(auth)
    .then((result) => {
        // This gives you a Google Access Token. You can use it to access Google APIs.
        const credential = GoogleAuthProvider.credentialFromResult(result as any);
        const token = credential?.accessToken;

        // The signed-in user info.
        const user = result?.user;
        // IdP data available using getAdditionalUserInfo(result)
        // ...
    }).catch((error) => {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.customData.email;
    // The AuthCredential type that was used.
    const credential = GoogleAuthProvider.credentialFromError(error);
    // ...
  });
*/

// Result from Redirect auth flow.
getRedirectResult(auth)
  .then(function (result) {
    if (!result) return;
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential) {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const token = credential?.accessToken;
      //oauthToken.textContent = token ?? '';
    } else {
      //oauthToken.textContent = 'null';
    }
    // The signed-in user info.
    const user = result.user;
  })
  .catch(function (error) {
    // Handle Errors here.
    const errorCode = error.code;
    const errorMessage = error.message;
    // The email of the user's account used.
    const email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    const credential = error.credential;
    if (errorCode === 'auth/account-exists-with-different-credential') {
      alert(
        'You have already signed up with a different auth provider for that email.',
      );
      // If you are using multiple auth providers on your app you should handle linking
      // the user's accounts here.
    } else {
      console.error(error);
    }
  });

  export default function FirebaseLogin() {
    return (
      <div>
        <h1>Sign in with Google</h1>
        <button onClick={() => signInWithRedirect(auth, provider)}>Sign in with Google</button>

      </div>
    );
  }