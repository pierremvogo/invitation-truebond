# TRUEBOND — Page web d'invitation

Interface statique responsive, sans framework ni dépendance CDN.

## À faire AVANT de déployer

1. `apiBaseUrl` est configuré sur `https://trubond-backend.onrender.com/api` dans `config.js`. Vérifier que le backend est bien accessible publiquement.
2. Les routes sont celles du code NestJS/Flutter fourni : `GET /api/invitations/resolve?token=...` et `POST /api/invitations/submit-answer` avec `{token, phone}`. Le résultat est contrôlé avec `testId`, `result`, `isCorrect`, `status`.
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

## Vérifications avant publication
- L’API et CORS n’ont pas été testés en direct ; effectuer un essai avec une invitation Sandbox valide.
- Ne pas exposer le token dans des captures, journaux, ou outils d’analyse.
- Le formulaire web actuel accepte les numéros camerounais +237 uniquement ; le formulaire Flutter permet plusieurs pays.
- Le format canonique généré par `buildInvitationUrl` est `/?token=TOKEN`.
- Vérifier la cohérence de `status` et `result` dans le service (actuellement SUCCESS/FAILURE).
