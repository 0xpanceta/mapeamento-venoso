// ===================================================================
//  SERVICE WORKER — funcionamento offline
//  Depois da 1a visita (online), o programa abre mesmo sem internet.
//  Estrategia:
//   - Navegacao (o HTML): rede primeiro, cai para o cache se offline.
//     Assim, quando ha internet, a clinica sempre pega a versao mais nova.
//   - Demais arquivos (Modelo.png, icone, manifest): cache primeiro,
//     atualizando em segundo plano quando houver rede.
//  Ao publicar uma alteracao, aumente o numero da VERSAO abaixo para
//  que os navegadores substituam o cache antigo.
// ===================================================================
const VERSAO = "v1";
const CACHE = "mapeamento-venoso-" + VERSAO;
const ESSENCIAIS = [
  "./",
  "./index.html",
  "./Modelo.png",
  "./manifest.webmanifest",
  "./icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ESSENCIAIS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((nomes) => Promise.all(
        nomes.filter((n) => n !== CACHE).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  // Navegacao (abrir/recarregar a pagina): rede primeiro.
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((resp) => {
          const copia = resp.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copia));
          return resp;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Demais arquivos: cache primeiro, com atualizacao em segundo plano.
  e.respondWith(
    caches.match(req).then((emCache) => {
      const daRede = fetch(req)
        .then((resp) => {
          if (resp && resp.ok) {
            const copia = resp.clone();
            caches.open(CACHE).then((c) => c.put(req, copia));
          }
          return resp;
        })
        .catch(() => emCache);
      return emCache || daRede;
    })
  );
});
