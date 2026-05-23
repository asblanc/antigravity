# Import des membres depuis Excel vers Firestore

Deux méthodes sont disponibles pour importer les membres :

1. **Script CLI** : `scripts/import_members.mjs` (Node.js)
2. **Interface navigateur** : accès via `/admin-import` dans l'application

Les deux utilisent le même moteur de détection de colonnes par nom d'en-tête (casse, accents, espaces ignorés).

## 1. Script CLI

### Prérequis

1. **Node.js** ≥ 18
2. **Clé de compte de service Firebase** : le fichier `service-account-key.json` à la racine du projet

### Installation

```bash
npm install xlsx firebase-admin dotenv
```

### Utilisation

```bash
node scripts/import_members.mjs "<chemin-vers-le-fichier.xlsx>"
```

### Exemple

```bash
node scripts/import_members.mjs "/Users/info/Downloads/Membre du Club.xlsx"
```

## 2. Interface navigateur

L'import est accessible depuis le dashboard admin via l'URL `/admin-import`.

1. Connectez-vous en tant qu'admin
2. Cliquez sur la zone d'upload pour sélectionner un fichier `.xlsx`
3. Le fichier est lu côté navigateur et envoyé à Firestore via le SDK Firebase
4. Un rapport complet s'affiche : feuilles traitées, colonnes reconnues/ignorées, lignes importées/ignorées

## Détection des colonnes (intelligente et tolérante)

Les colonnes sont détectées par leur **nom d'en-tête**, pas par leur position.  
La normalisation supprime : accents, ponctuation, espaces multiples, différences de casse.

### Exemples de correspondances

| Champ cible | En-têtes acceptés |
|---|---|
| `cardNumber` | `Carte N°`, `Carte`, `Numero Carte`, `N° Carte`, `Card Number` |
| `lastName` | `Nom`, `Last Name`, `Surname`, `Family Name` |
| `firstName` | `Prenoms`, `Prenom`, `First Name`, `Given Name` |
| `phone` | `Mobil`, `Mobile`, `Telephone`, `Phone`, `Portable` |
| `whatsapp` | `WhatsApp`, `Whats App`, `Whats` |
| `email` | `Email`, `E mail`, `Mail`, `Courriel` |
| `company` | `Compagnie`, `Company`, `Societe`, `Entreprise`, `Structure` |
| `joinDate` | `Date d adhesion`, `Date adhesion`, `Date d'inscription`, `Join Date` |
| `expireDate` | `Date d expiration`, `Date expiration`, `Expiration`, `Expire Date` |
| `points` | `Nbre de points`, `Points`, `Nombre points`, `Nb points`, `Total points` |

### Comportement

- **Champs obligatoires** : au moins `Carte N°` **ou** `Email` **+** `Nom` **ou** `Prénom`
- **Colonnes inconnues** : ignorées avec un avertissement, l'import continue
- **Colonnes optionnelles absentes** : avertissement affiché (ex: "Nbre de points" → points à 0)
- **Feuilles détectées** : `Bronze` → `bronze`, `Argent` → `silver`, `Or` → `gold` (normalisé)

## Document Firestore créé

Collection : **`members`**

Document ID : `member-{cardNumber}` ou `member-{email}` ou `member-{tier}-{nom}-{prenom}`

| Champ | Source |
|---|---|
| `cardNumber` | Colonne détectée comme numéro de carte |
| `firstName` | Colonne détectée comme prénom |
| `lastName` | Colonne détectée comme nom |
| `name` | Concaténation Prénom + Nom |
| `phone` | Colonne détectée comme téléphone |
| `whatsapp` | Colonne détectée comme WhatsApp |
| `email` | Colonne détectée comme email |
| `company` | Colonne détectée comme compagnie |
| `tier` | Déduit du nom de la feuille (`bronze`, `silver`, `gold`) |
| `points` | Colonne détectée comme points |
| `joinDate` | Colonne détectée comme date d'adhésion |
| `expireDate` | Colonne détectée comme date d'expiration |
| `role` | Toujours `"member"` |
| `active` | Toujours `true` |
| `importedAt` | Timestamp de l'import |

## Rapport d'import

À la fin de l'import (CLI ou navigateur), un rapport détaillé est affiché :

- ✅ Liste des feuilles traitées
- ✅ Colonnes reconnues et ignorées
- ✅ Nombre de membres importés par feuille
- ✅ Nombre de lignes ignorées (vides ou sans champs obligatoires)

## Notes

- Les lignes vides ou sans carte/nom sont automatiquement ignorées.
- Les dates sont gérées en format Excel (nombre sériel) ou en texte (français/numérique).
- Le script utilise `merge: true` : si un document existe déjà avec le même `uid`, seuls les champs fournis sont mis à jour.
- Aucun compte Firebase Auth n'est créé (seul le document Firestore est écrit).
- Le fichier `service-account-key.json` ne doit **pas** être commité (dans `.gitignore`).