
self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data.json();
  } catch (e) {
    return;
  }

  const payload = data.data || data;

  self.registration.showNotification(payload.title || "Agenda", {
    body: payload.body || "",
    icon: "/icon-192.png"
  });
});
