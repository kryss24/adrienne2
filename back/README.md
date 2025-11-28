# Notes API - Complete

## Démarrage rapide

1. Copier `.env.example` en `.env` et remplir les valeurs (MAIL_USER, MAIL_PASS, JWT_SECRET...).
2. Installer dépendances:
   ```bash
   npm install
   ```
3. Appliquer migrations (créera `database.sqlite`):
   ```bash
   npm run migrate
   ```
   ou les migrations sont lancées automatiquement si la DB n'existe pas.
4. Démarrer:
   ```bash
   npm start
   ```

## Endpoints principaux
- Auth: `/api/auth` (`/register`, `/login`, `/reset-password`, `/me`)
- Requests: `/api/requests` (création avec uploads, gestion status...)
- Notifications: `/api/notifications`
- Classes: `/api/classes`
- Users (superadmin): `/api/users`
- Stats: `/api/stats`

## Notes
- Uploads sauvegardés dans `./uploads/requests/`.
- Reset-password envoie un lien contenant un JWT (1h).
- Sécurité basique: bcrypt, JWT, helmet, rate-limit, file validation.

