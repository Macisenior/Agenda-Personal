const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarNuevaTarea = onDocumentCreated("tareas/{tareaId}", async (event) => {

  const tarea = event.data.data(); // 🔥 FALTABA ESTO

  const ahora = Date.now();

  const tiempoTarea = tarea.timestamp;
  const avisoMs = (tarea.aviso || 0) * 60 * 1000;
  const tiempoNotificacion = tiempoTarea - avisoMs;

  if (ahora < tiempoNotificacion) {
    console.log("Aún no es momento de notificar");
    return;
  }

  const tokensSnapshot = await admin.firestore().collection("tokens").get();

  const tokens = [];
  tokensSnapshot.forEach(doc => {
    tokens.push(doc.data().token);
  });

  if (tokens.length === 0) {
    console.log("No hay tokens");
    return;
  }

  await admin.messaging().sendEachForMulticast({
  tokens: tokens,
  notification: {
    title: "⏰ Recordatorio",
    body: tarea.texto
  },
  data: {
    title: "⏰ Recordatorio",
    body: tarea.texto
  }
});

  console.log("Notificación enviada");
});
const { onSchedule } = require("firebase-functions/v2/scheduler");

exports.notificacionesProgramadas = onSchedule("* * * * *", async () => {

  const ahora = Date.now();

  const snapshot = await admin.firestore().collection("tareas").get();

  const tokensSnapshot = await admin.firestore().collection("tokens").get();

  const tokens = [];
  tokensSnapshot.forEach(doc => {
    tokens.push(doc.data().token);
  });

  if (tokens.length === 0) return;

  for (const doc of snapshot.docs) {
    const tarea = doc.data();

    if (!tarea.timestamp || tarea.notified) continue;

    const avisoMs = (tarea.aviso || 0) * 60 * 1000;
    const tiempoNotificacion = tarea.timestamp - avisoMs;

   const margen = 2 * 60 * 1000; // 2 minutos
console.log("------");
console.log("Tarea:", tarea.texto);
console.log("Timestamp:", tarea.timestamp);
console.log("Aviso:", tarea.aviso);
console.log("Ahora:", ahora);
console.log("TiempoNotificacion:", tiempoNotificacion);
console.log("Diferencia:", ahora - tiempoNotificacion);
if (
  ahora >= tiempoNotificacion &&
  ahora <= tiempoNotificacion + margen &&
  !tarea.notified
) { 

 await admin.messaging().sendEachForMulticast({
  tokens: tokens,
  data: {
    title: "⏰ Recordatorio",
    body: tarea.texto
  }  
});
      
      // marcar como notificada
      await admin.firestore().collection("tareas").doc(doc.id).update({
        notified: true
      });

      console.log("Notificada:", tarea.texto);
    }
  }
});