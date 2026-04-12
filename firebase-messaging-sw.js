importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
   apiKey: "AIzaSyAQzsTZxkHS5P5N1iqWBVVmrMbNMPQb2QQ",
  authDomain: "agenda--app-c0220.firebaseapp.com",
  projectId: "agenda--app-c0220",
  storageBucket: "agenda--app-c0220.firebasestorage.app",
  messagingSenderId: "1057225751235",
  appId: "1:1057225751235:web:d4243cc400c593b6504076"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log("Mensaje recibido en background:", payload);

  const data = payload.data;

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon-192.png"
  });
});