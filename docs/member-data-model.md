# Modèle de données — Membre (Firestore)

Collection Firestore : **`members`**

## Document : `{uid}`

Le `uid` est généré à partir du numéro de carte si disponible (`member-{cardNumber}`), sinon à partir du niveau + nom.

| Champ | Type | Description | Exemple |
|---|---|---|---|
| `cardNumber` | `string \| null` | Numéro de carte IBC | `"112501"` |
| `firstName` | `string \| null` | Prénom(s) | `"Kouassi"` |
| `lastName` | `string \| null` | Nom de famille | `"Yao"` |
| `name` | `string` | Nom complet (concaténation) | `"Kouassi Yao"` |
| `phone` | `string \| null` | Numéro mobile | `"+225 07 00 00 00 00"` |
| `whatsapp` | `string \| null` | Numéro WhatsApp | `"+225 07 00 00 00 00"` |
| `email` | `string \| null` | Adresse e-mail | `"kouassi@exemple.ci"` |
| `company` | `string \| null` | Compagnie / société | `"Air Côte d'Ivoire"` |
| `tier` | `string` | Niveau du membre | `"bronze"`, `"silver"`, `"gold"` |
| `points` | `number` | Nombre de points de fidélité | `1500` |
| `joinDate` | `Timestamp \| null` | Date d'adhésion | `2026-01-15` |
| `expireDate` | `Timestamp \| null` | Date d'expiration de la carte | `2027-01-15` |
| `balance` | `number` | Solde de cashback disponible (FCFA) | `0` |
| `totalSpent` | `number` | Total dépensé chez les partenaires (FCFA) | `0` |
| `visitsThisMonth` | `number` | Nombre de visites ce mois-ci | `0` |
| `role` | `string` | Rôle dans l'application | `"member"` |
| `active` | `boolean` | Statut actif du membre | `true` |
| `importedAt` | `Timestamp` | Date d'import dans Firestore | `2026-05-23` |

## Champs optionnels (ajoutés après inscription Firebase Auth)

| Champ | Type | Description |
|---|---|---|
| `uid` | `string` | UID Firebase Auth (lorsqu'un compte Auth est créé) |
| `photoURL` | `string \| null` | URL de la photo de profil |
| `paymentMethod` | `string` | Méthode de paiement (`orange`, `wave`, `moov`, `mtn`) |
| `qrCode` | `string` | QR Code payload pour le pass membre |
| `memberCode` | `string` | Code membre lisible (`IBC00042`) |
| `createdAt` | `Timestamp` | Date de création du compte Firebase Auth |
| `whatsapp` | `string` | Surcharge WhatsApp après inscription |

## Niveaux (tier)

| Valeur | Signification | Feuille Excel |
|---|---|---|
| `bronze` | Membre Bronze (Discovery Member) | Bronze |
| `silver` | Membre Argent (Privilege Member) | Argent |
| `gold` | Membre Or (Prestige Member) | Or |

## Index recommandés

Ajoutez ces index composites dans `firestore.indexes.json` si vous requêtez fréquemment :

```json
{
  "indexes": [
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tier", "order": "ASCENDING" },
        { "fieldPath": "name", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "members",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "active", "order": "ASCENDING" },
        { "fieldPath": "tier", "order": "ASCENDING" }
      ]
    }
  ]
}