import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1. Global replacements for "%" in App.tsx
content = content.replace("3% de cashback", "Cashback exclusif sur chaque dépense")
content = content.replace("Recevez 3% de cashback", "Gagnez du cashback à chaque visite")
content = content.replace("Cashback 3%", "💰 Cashback IBC — Sur chaque dépense")
content = content.replace("retirez 3% de cashback", "Recevez votre cashback après chaque visite")

# 2. MemberDashboardView corrections
# Replace the Solde Card block
old_solde_card = """        {/* Solde Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-dark to-green-darker p-8 border border-gold/30 shadow-premium relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-x-8 -translate-y-8" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-4">Solde Cashback</p>
          <div className="flex items-end justify-between">
            <h2 className="text-4xl font-serif text-white">{user.balance.toLocaleString()} <span className="text-xl text-gold">FCFA</span></h2>
            <button className="btn-gold !px-6 !py-2 text-[10px]">Retirer</button>
          </div>
        </motion.div>"""

new_solde_card = """        {/* Solde Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-dark to-green-darker p-8 border border-gold/30 shadow-premium relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 rounded-full -translate-x-8 -translate-y-8" />
          
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-2 h-2 rounded-full ${user.tier === 'gold' ? 'bg-yellow-400' : user.tier === 'silver' ? 'bg-gray-300' : 'bg-orange-400'}`}></div>
            <span className="font-medium tracking-widest text-xs uppercase text-gold">Niveau {user.tier}</span>
          </div>
          <p className="text-[9px] text-white/50 italic mb-4">Votre cashback augmente avec votre niveau</p>
          
          <p className="text-[10px] uppercase tracking-[0.4em] text-gold font-bold mb-2">Mon Compte Cashback IBC</p>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-4xl font-serif text-white">{user.balance.toLocaleString()} <span className="text-xl text-gold">FCFA</span></h2>
          </div>
          <p className="text-[10px] leading-relaxed text-white/70 italic border-t border-gold/20 pt-4 mt-2">
            Votre cashback est crédité automatiquement après chaque visite validée par l'établissement. Présentez votre QR Code en caisse.
          </p>
        </motion.div>"""

content = content.replace(old_solde_card, new_solde_card)

# Fix transaction list formatting
old_tx_format = """<div className="text-gold font-serif">+{tx.cashback.toLocaleString()} <span className="text-[9px]">FCFA</span></div>"""
new_tx_format = """<div className="text-gold font-serif">+{tx.cashback.toLocaleString()} <span className="text-[9px]">FCFA</span></div>"""
# The old format already used FCFA, let's just make sure it says "+X FCFA cashback reçu" if required, 
# though the UI has a nice right column format. Let's update it to be very explicit.

content = content.replace(
  """<div className="text-gold font-serif">+{tx.cashback.toLocaleString()} <span className="text-[9px]">FCFA</span></div>""",
  """<div className="text-gold font-serif">+{tx.cashback.toLocaleString()} <span className="text-[9px]">FCFA</span></div>\n                  <div className="text-[8px] text-gold/60">cashback reçu</div>"""
)

# 3. Comment ça marche section correction in HomeView
# Replace "Payez via votre portefeuille IBC" with "Consommez et réglez sur place comme d'habitude"
content = content.replace("Payez via votre portefeuille IBC", "Consommez et réglez sur place comme d'habitude")

# Also just sweep for "Portefeuille", "Mobile Money", "Recharger", etc.
content = content.replace("Portefeuille", "Compte Cashback")
content = content.replace("Recharger", "Consulter")
content = content.replace("Effectuer un paiement", "Valider une visite")

with open('src/App.tsx', 'w') as f:
    f.write(content)

print("App.tsx refactored for Member dashboard updates.")
