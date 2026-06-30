<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Règles base de données — NE JAMAIS ENFREINDRE

**INTERDIT sans accord explicite de l'utilisateur :**
- Lancer `npx tsx prisma/seed.ts` — ce script efface toutes les données utilisateur (logs, séries, séances)
- Lancer `prisma db push` — peut supprimer des colonnes silencieusement
- Toute commande `deleteMany()` / `DROP TABLE` / `truncate` sur la DB de prod

**Pour tout changement de schéma Prisma :**
1. Créer une migration : `npx prisma migrate dev --name description`
2. Vérifier qu'elle ne supprime aucune colonne avec des données
3. Demander confirmation à l'utilisateur avant d'appliquer en prod

**La DB contient des données réelles de Tristan — chaque séance loggée est irremplaçable.**
