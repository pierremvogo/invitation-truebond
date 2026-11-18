# TRUEBOND — Page web d'invitation

Interface statique responsive, sans framework ni dépendance CDN.

## À faire AVANT de déployer

1. Renseigner `apiBaseUrl` dans `config.js` (URL HTTPS publique de NestJS, préfixe `/api` inclus).
2. Les chemins `GET /public/invitations/:token` et `POST /public/invitations/:token/answer` dans `app.js` sont **proposés**, non vérifiés. Les remplacer par les routes réelles de `invitation_repository.dart` / du backend. Vérifier aussi les formes JSON `{rewardXaf}` et `{isCorrect}`.
3. Configurer CORS du backend pour `https://invitation-truebond.onrender.com` (méthodes GET/POST, Content-Type, sans credentials si API token-based). Ne jamais placer de secret serveur dans les fichiers statiques.
4. Vérifier le package Android et la signature SHA256 dans `.well-known/assetlinks.json` (actuellement valeurs héritées du ZIP). Configurer Android intent filters et éventuellement Apple AASA. Tester sur un appareil réel.
5. Le serveur statique doit servir `/.well-known/assetlinks.json` avec HTTP 200, `application/json`, sans redirection. Tester les rewrites `_redirects` sur l'hébergeur Render utilisé.
6. Valider le format du token (43 caractères) avec le backend ; l'URL proposée est `/i/TOKEN`, mais `?token=TOKEN` et `/test-recipient/TOKEN` sont également acceptées.
7. La validation du numéro côté web est limitée au Cameroun (+237) ; étendre le sélecteur de pays si le produit doit accepter d'autres pays, en gardant la validation serveur comme autorité.
8. Vérifier les statuts API (400,403,404,409,410,429) et tester les interruptions réseau. En cas de réponse incertaine, l'interface bloque toute nouvelle soumission.

## Fichiers
- `index.html` : interface visuelle
- `app.js` : récupération de l'invitation et soumission
- `config.js` : configuration publique de l'API
- `_redirects` : routes SPA pour hébergement statique compatible
- `.well-known/assetlinks.json` : association Android existante (à vérifier)

Ne pas considérer ce ZIP comme intégré fonctionnellement au backend tant que les routes et les réponses n'ont pas été vérifiées.
