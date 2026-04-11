const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.notificarNuevaTarea = onDocumentCreated("tareas/{tareaId}", async (event) => {


    const ahora = Date.now();

// tiempo de la tarea
const tiempoTarea = tarea.timestamp;

// minutos antes → milisegundos
const avisoMs = (tarea.aviso || 0) * 60 * 1000;

// cuándo avisar
const tiempoNotificacion = tiempoTarea - avisoMs;

// si aún no toca → no enviar
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

  const payload = {
    notification: {
      title: "📅 Nueva tarea",
      body: tarea.texto
    }
  };

  await admin.messaging().sendToDevice(tokens, payload);

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

    if (ahora >= tiempoNotificacion) {

      const payload = {
        notification: {
          title: "⏰ Recordatorio",
          body: tarea.texto
        }
      };

      await admin.messaging().sendToDevice(tokens, payload);

      // marcar como notificada
      await admin.firestore().collection("tareas").doc(doc.id).update({
        notified: true
      });

      console.log("Notificada:", tarea.texto);
    }
  }
});