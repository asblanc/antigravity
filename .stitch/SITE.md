# Site Vision: IVOIRE BUSINESS CLUB (IBC)

## 1. Overview
IBC is a premium platform for discovering tourist and leisure experiences in Côte d'Ivoire. It operates on a "Consume Local, Win Cashback" model where members pay 500 FCFA/month and receive 3% cashback on every expenditure at partner establishments.

**Stitch Project ID:** 12821775708247337648

## 2. Core Business Rules
- **Revenue Split:** 90% Partner / 7% Platform / 3% Member Cashback.
- **Transaction Flow:** Member visits partner → Consumes → Partner scans Member QR Code → Transaction split triggered.
- **Subscription:** 500 FCFA/month, BRONZE status by default.
- **IDs:** Member (IBC-XXXXXX), Partner (IBC-P-XXXXXX).

## 3. Tech Stack
- Frontend: React + TS + Vite + Tailwind
- Animations: Framer Motion
- Backend: Firebase (Auth/Firestore/Storage)
- Tools: lucide-react, qrcode.react, react-hot-toast

## 4. Sitemap (Roadmap)
- [ ] Home Page (`index.html`) - Public landing page
- [ ] Member Registration (`member-registration`) - 3-step signup
- [ ] Partner Registration (`partner-registration`) - B2B onboarding
- [ ] Login (`login`) - Unified login
- [ ] Member Dashboard (`member-dashboard`) - QR, Wallet, Stats, Experiences
- [ ] Partner Dashboard (`partner-dashboard`) - Scanner, Revenue, Services CRUD
- [ ] Admin Dashboard (`admin-dashboard`) - Users, Transactions, Revenue split
- [ ] Offers View (`offers`) - Partner service catalog

## 5. Roadmap & Tasks
1. [ ] Create Home Page (Hero, How it Works, Partners, Catalog, Loyalty, Footer)
2. [ ] Implement Firebase Auth & Firestore setup
3. [ ] Build Registration flows (Member/Partner)
4. [ ] Build Dashboards

## 6. Creative Freedom & Notes
- Use high-quality imagery of Abidjan, Assinie, and premium hotels.
- Emphasize the "Gold" and "Dark Green" contrast for a luxury feel.
- Ensure the QR code is central to the mobile dashboard experience.
