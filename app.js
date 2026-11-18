'use strict';
(() => {
  const $ = id => document.getElementById(id);
  $('year').textContent = new Date().getFullYear();
  const screens = ['loading','formScreen','resultScreen','errorScreen','uncertainScreen'];
  const show = id => screens.forEach(s => $(s).classList.toggle('hidden', s !== id));
  const params = new URLSearchParams(location.search);
  const routeMatch = location.pathname.match(/^\/(?:i|test-recipient)\/([A-Za-z0-9_-]{43})\/?$/);
  const token = routeMatch?.[1] || params.get('token');
  const validToken = typeof token === 'string' && /^[A-Za-z0-9_-]{43}$/.test(token);
  const apiBase = (window.TRUEBOND_CONFIG?.apiBaseUrl || '').replace(/\/$/, '');
  // Ces chemins sont des contrats PROPOSÉS : confirmer les routes réelles NestJS avant déploiement.
  const resolvePath = t => `/public/invitations/${encodeURIComponent(t)}`;
  const answerPath = t => `/public/invitations/${encodeURIComponent(t)}/answer`;
  let submitted = false;
  const fail = (title, detail, retry = true) => { $('errorTitle').textContent = title; $('errorText').textContent = detail; $('retryBtn').classList.toggle('hidden', !retry); show('errorScreen'); };
  const request = async (path, options = {}) => {
    const response = await fetch(apiBase + path, { ...options, cache:'no-store', credentials:'omit', referrerPolicy:'no-referrer', headers:{ 'Accept':'application/json', ...(options.body ? {'Content-Type':'application/json'} : {}) } });
    let data = null; try { data = await response.json(); } catch (_) { /* non JSON */ }
    if (!response.ok) { const e = new Error('API request failed'); e.status = response.status; throw e; }
    if (!data || typeof data !== 'object') throw new Error('Invalid API response');
    return data;
  };
  const load = async () => {
    show('loading');
    if (!validToken) return fail('Lien incomplet ou invalide', 'Demandez un nouveau lien à la personne qui vous a invité.', false);
    if (!apiBase || !/^https:\/\//.test(apiBase)) return fail('Service en cours de configuration', 'La connexion sécurisée au service TRUEBOND doit être configurée avant la mise en ligne.', false);
    try {
      const data = await request(resolvePath(token));
      // Format attendu : { rewardXaf: number }. Ne jamais exposer les numéros attendus.
      if (!Number.isSafeInteger(data.rewardXaf) || data.rewardXaf < 0) throw new Error('Invalid reward');
      $('reward').textContent = new Intl.NumberFormat('fr-CM').format(data.rewardXaf) + ' FCFA';
      show('formScreen');
    } catch (e) {
      if ([400,403,404,410].includes(e.status)) fail('Invitation invalide ou expirée', 'Ce lien n’est plus accessible. Contactez la personne qui vous a invité.', false);
      else if (e.status === 409) fail('Test déjà terminé', 'Cette invitation ne peut plus recevoir de réponse.', false);
      else fail('Vérification impossible', 'Nous ne parvenons pas à vérifier votre invitation. Vérifiez votre connexion et réessayez.');
    }
  };
  $('retryBtn').addEventListener('click', load);
  $('answerForm').addEventListener('submit', async e => {
    e.preventDefault(); if (submitted) return;
    const national = $('phone').value.replace(/[\s().-]/g, '');
    const msg = $('formMessage'); msg.classList.add('hidden');
    if (!/^6\d{8}$/.test(national)) { msg.textContent = 'Saisissez un numéro camerounais valide à 9 chiffres commençant par 6.'; msg.classList.remove('hidden'); return; }
    const btn = $('submitBtn'); btn.disabled = true; btn.textContent = 'Vérification en cours…';
    try {
      const data = await request(answerPath(token), {method:'POST', body:JSON.stringify({phone:'+237'+national})});
      if (typeof data.isCorrect !== 'boolean') throw new Error('Uncertain server response');
      submitted = true;
      $('resultIcon').textContent = data.isCorrect ? '✓' : '×';
      $('resultIcon').classList.toggle('error', !data.isCorrect);
      $('resultTitle').textContent = data.isCorrect ? 'Bonne réponse !' : 'Réponse incorrecte';
      $('resultText').textContent = data.isCorrect ? 'Votre réponse a été validée avec succès.' : 'Le numéro saisi ne correspond à aucun des numéros attendus.';
      show('resultScreen');
    } catch (err) {
      if ([400,403,404,410,409,429].includes(err.status)) {
        const messages = {400:'Le numéro ou le lien est invalide.',403:'Cette invitation n’est plus accessible.',404:'Cette invitation est invalide.',410:'Cette invitation a expiré.',409:'Ce test ne peut plus recevoir de réponse.',429:'Trop de tentatives. Veuillez patienter.'};
        msg.textContent = messages[err.status]; msg.classList.remove('hidden');
        btn.disabled = err.status === 409 || err.status === 410;
      } else { submitted = true; show('uncertainScreen'); }
    } finally { btn.textContent = 'Valider ma réponse →'; if (!submitted && !btn.disabled) btn.disabled = false; }
  });
  load();
})();
