importScripts(
  "https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyC3hOXv8j35pLWPrPOKwPO9nnP6TNVGi7g",
  authDomain: "deligo-a196c.firebaseapp.com",
  projectId: "deligo-a196c",
  storageBucket: "deligo-a196c.firebasestorage.app",
  messagingSenderId: "256376229566",
  appId: "1:256376229566:web:7f0226f21eba0ec99118ef",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message:",
    payload
  );

  const notificationTitle = payload.notification?.title || "New Message";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new message",
    icon: payload.notification?.icon || "/favicon.ico",
    badge: "/badge.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
