importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "TU_API_KEY",
  authDomain: "TU_AUTH_DOMAIN",
  projectId: "TU_PROJECT_ID",
  messagingSenderId: "TU_SENDER_ID",
  appId: "TU_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  const data = payload.data;

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "icon-192.png"
  });
});
self.addEventListener("push", function (event) {
  const data = event.data.json();

  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/icon-192.png"
  });
});