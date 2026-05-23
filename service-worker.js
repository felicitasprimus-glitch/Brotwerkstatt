// Selbstzerstoerender Service Worker fuer "Sauer macht krustig - Brot-Werkstatt"
//
// Zweck: Alte, zwischengespeicherte Versionen der App bei allen Nutzer:innen
// automatisch aufloesen. Sobald der Browser diesen Worker laedt, leert er alle
// Caches, meldet sich selbst ab und laedt die offenen Fenster neu - danach
// kommt immer die aktuelle Version frisch vom Server. Niemand muss neu
// installieren oder den Cache von Hand leeren.

self.addEventListener('install', () => {
  // Sofort uebernehmen, nicht auf "warten" gehen.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // 1) Alle vorhandenen Caches loeschen
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    } catch (e) { /* ignorieren */ }

    // 2) Diesen Service Worker abmelden
    try {
      await self.registration.unregister();
    } catch (e) { /* ignorieren */ }

    // 3) Offene Fenster neu laden -> sie holen sich die frische Version vom Netz
    try {
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.navigate(client.url).catch(() => {});
      });
    } catch (e) { /* ignorieren */ }
  })());
});

// Bewusst KEIN fetch-Handler: Anfragen gehen direkt ans Netz (immer aktuell).
