/**
 * Convert Firebase error codes to French error messages
 */
export function getFirebaseErrorMessage(errorCode: string): string {
  const errorMessages: { [key: string]: string } = {
    // Auth errors
    'auth/invalid-email': 'Email invalide',
    'auth/user-disabled': 'Compte utilisateur désactivé',
    'auth/user-not-found': 'Utilisateur non trouvé',
    'auth/wrong-password': 'Mot de passe incorrect',
    'auth/email-already-in-use': 'Email déjà utilisé',
    'auth/weak-password': 'Mot de passe trop faible (min. 6 caractères)',
    'auth/operation-not-allowed': 'Opération non autorisée',
    'auth/account-exists-with-different-credential': 'Un compte existe avec un identifiant différent',
    'auth/invalid-credential': 'Identifiant invalide',
    'auth/popup-closed-by-user': 'Popup fermée par l\'utilisateur',
    'auth/popup-blocked': 'Popup bloquée par le navigateur',
    'auth/too-many-requests': 'Trop de tentatives. Essayez plus tard',
    'auth/network-request-failed': 'Erreur réseau',

    // Firestore errors
    'permission-denied': 'Accès refusé',
    'not-found': 'Document non trouvé',
    'already-exists': 'Document déjà existant',
    'failed-precondition': 'Condition préalable non remplie',
    'aborted': 'Opération annulée',
    'out-of-range': 'Valeur hors limites',
    'unavailable': 'Service indisponible',
    'internal': 'Erreur interne du serveur',
    'data-loss': 'Perte de données',
    'unauthenticated': 'Non authentifié',
  };

  return errorMessages[errorCode] || 'Une erreur est survenue';
}
