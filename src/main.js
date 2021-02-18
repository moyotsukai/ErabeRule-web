// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'

Vue.config.productionTip = false


import firebase from 'firebase'

var firebaseConfig = {
    apiKey: "AIzaSyCpGpFoqXPWS6V3yG1GLMLRbuvyf14vwWQ",
    authDomain: "startfirebase-35cbd.firebaseapp.com",
    databaseURL: "https://startfirebase-35cbd.firebaseio.com",
    projectId: "startfirebase-35cbd",
    storageBucket: "startfirebase-35cbd.appspot.com",
    messagingSenderId: "57225796888",
    appId: "1:57225796888:web:0c53fe2f52b263116bd26d",
    measurementId: "G-6G76HSQ6G2"
};
firebase.initializeApp(firebaseConfig);

firebase.auth().signInAnonymously()
    .then(() => {
        // Signed in..
        console.log(user.uid);
    })
    .catch((error) => {
        var errorCode = error.code;
        var errorMessage = error.message;
        // ...
    });

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    components: {
        App
    },
    template: '<App/>'
})
