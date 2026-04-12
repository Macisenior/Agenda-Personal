self.addEventListener("push", function (event) {
  let data = {};

  try {
    data = event.data.json();
  } catch (e) {
    console.log("Error parseando push", e);
    return;
  }

  console.log("Push recibido:", data);

  // 🔥 CLAVE: Firebase mete data dentro de data
  const payload = data.data || data;

  self.registration.showNotification(payload.title || "Agenda", {
    body: payload.body || "Nueva notificación",
    icon: "/icon-192.png"
  });
});