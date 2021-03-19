import * as firebase from 'firebase';

require('@firebase/firestore')

var firebaseConfig = {
    apiKey: "AIzaSyChOdG08MphTot3uE8BPozRtYVuaBCuheI",
    authDomain: "wily-a3d86.firebaseapp.com",
    projectId: "wily-a3d86",
    storageBucket: "wily-a3d86.appspot.com",
    messagingSenderId: "368510296179",
    appId: "1:368510296179:web:e43b8cd439c7a943de0a06"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore()