# OSS B2B - Spécifications d'Agrégation des Services Externes

Ce document détaille l'architecture d'agrégation des services tiers indispensables pour la plateforme **OSS B2B**. Conformément aux directives d'ingénierie, aucune intégration fictive n'est simulée ; seules les architectures réelles, leurs autorisations et leurs protocoles sont définis.

---

## 1. Module de Paiement Mobile Money & Bancaire

### A. MTN Mobile Money (Open API v1/v2)
- **Rôle** : Encaissement des abonnements (Currently 35k/125k, Professionnel 75k/215k) et règlements inter-entreprises.
- **Protocole** : REST JSON + OAuth 2.0 (Basic Auth pour Token, Bearer pour transactions).
- **Flux technique** :
  1. `POST /collection/v1_0/requesttopay` (Initie le push USSD sur le téléphone du client).
  2. `GET /collection/v1_0/requesttopay/{referenceId}` (Sonde le statut : PENDING, SUCCESSFUL, FAILED).
  3. Webhook de callback asynchrone sécurisé par signature HMAC.
- **Autorisations & Identifiants indispensables** :
  - `MTN_MOMO_SUBSCRIPTION_KEY` (Clé d'abonnement au portail développeur MTN).
  - `MTN_MOMO_API_USER_ID` (UUID v4 généré pour l'accès marchand).
  - `MTN_MOMO_API_KEY` (Clé secrète de production).
  - `MTN_MOMO_TARGET_ENV` (`sandbox` en recette, `production` en direct).

### B. Airtel Money B2B & Merchant API
- **Rôle** : Encaissement et versement direct vers les comptes professionnels Airtel.
- **Protocole** : JSON REST avec en-têtes sécurisés (PIN chiffré RSA).
- **Flux technique** :
  1. `POST /auth/oauth2/token` (Obtention du jeton d'accès temporaire).
  2. `POST /merchant/v1/payments/` (Paiement marchand avec référence commande).
- **Autorisations & Identifiants indispensables** :
  - `AIRTEL_CLIENT_ID`
  - `AIRTEL_CLIENT_SECRET`
  - `AIRTEL_PUBLIC_KEY` (Certificat X.509 pour le chiffrement des payloads financiers).

---

## 2. Module de Communication & Alertes (WhatsApp & SMS)

### A. Meta WhatsApp Cloud API (Graph API v21.0+)
- **Rôle** : Envoi automatisé des convocations d'équipes, confirmations de missions et alertes de plannings.
- **Protocole** : HTTPS REST via l'infrastructure officielle Meta.
- **Flux technique** :
  - `POST https://graph.facebook.com/v21.0/{PHONE_NUMBER_ID}/messages`
  - Utilisation de modèles de messages approuvés (*Templates*) : confirmation d'inscription, rappel d'échéance.
- **Autorisations & Identifiants indispensables** :
  - Compte Meta Business Manager vérifié.
  - Numéro de téléphone d'entreprise officiel dédié (en cours de configuration par le propriétaire).
  - `WHATSAPP_PHONE_NUMBER_ID`
  - `WHATSAPP_ACCESS_TOKEN` (Jeton système permanent).
  - `WHATSAPP_WEBHOOK_VERIFY_TOKEN` (Pour la réception des messages et accusés de lecture).

### B. Passerelle SMS Professionnelle (Infobip / Africa's Talking)
- **Rôle** : Notification de secours lorsque la connexion Internet ou WhatsApp n'est pas disponible pour les agents de terrain.
- **Autorisations indispensables** :
  - Homologation d'un **Sender ID** alphanumérique (ex: `OSSB2B`).
  - Clé d'API partenaire.

---

## 3. Sécurité des Secrets & Conformité

1. **Variables d'environnement** : Tous les secrets sont injectés via `.env` en local et via le coffre-fort de variables de l'hébergeur en production (aucun secret en clair dans Git).
2. **Idempotence** : Chaque transaction de paiement ou envoi de notification porte un UUID unique (`X-Idempotency-Key`) pour éviter les doubles débits.
3. **Journalisation d'audit** : Toutes les interactions financières et administratives sont consignées dans la table `audit_logs`.
