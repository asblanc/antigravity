// Mock API Service for IVOIRE BUSINESS CLUB (IBC)
// This service simulates Firebase Auth and Firestore behavior

export interface Member {
  uid: string;
  name: string;
  email: string;
  whatsapp?: string;
  photoURL?: string;
  paymentMethod?: string;
  tier: 'bronze' | 'silver' | 'gold';
  balance: number;
  totalSpent: number;
  visitsThisMonth: number;
  qrCode: string;
  role?: 'member' | 'partner' | 'admin';
  memberCode?: string;
  provider?: string;
  phone?: string;
  company?: string;
  points?: number;
  active?: boolean;
}

export interface Transaction {
  id: string;
  partnerName: string;
  date: string;
  amount: number;
  cashback: number;
  status: 'confirmed' | 'pending';
}

export interface Offer {
  id: string;
  partnerName: string;
  description: string;
  imageUrl: string;
}

class MockApiService {
  // Simulate Auth
  async login(email: string): Promise<Member> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const member: Member = {
          uid: 'mem_123',
          name: 'M. Kouassi',
          email: email,
          whatsapp: '+225 07000000',
          tier: 'silver',
          balance: 45000,
          totalSpent: 1250000,
          visitsThisMonth: 14,
          qrCode: `IBC-MEMBER-KOUASSI-SILVER`
        };
        resolve(member);
      }, 1000);
    });
  }

  async register(data: any): Promise<Member> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const member: Member = {
          uid: 'mem_' + Math.random().toString(36).substr(2, 9),
          name: data.name,
          email: data.email,
          whatsapp: data.whatsapp,
          tier: data.plan || 'silver',
          balance: 0,
          totalSpent: 0,
          visitsThisMonth: 0,
          qrCode: `IBC-MEMBER-${data.name.toUpperCase().replace(/\s/g, '-')}-${data.plan.toUpperCase()}`
        };
        resolve(member);
      }, 1500);
    });
  }

  // Simulate Firestore
  async getTransactions(): Promise<Transaction[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'tx_1', partnerName: 'Sofitel Abidjan', date: 'Hier, 19:45', amount: 24500, cashback: 3500, status: 'confirmed' },
          { id: 'tx_2', partnerName: 'Pullman Hélios', date: '22 Oct. 2023', amount: 115000, cashback: 1200, status: 'confirmed' },
          { id: 'tx_3', partnerName: 'Noom Hotel', date: '20 Oct. 2023', amount: 8000, cashback: 2800, status: 'confirmed' }
        ]);
      }, 800);
    });
  }

  async getOffers(): Promise<Offer[]> {
    return [
      { id: 'off_1', partnerName: 'Hôtel Tiama', description: '-20% sur les suites Junior', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=200' },
      { id: 'off_2', partnerName: 'Le Grand Large', description: 'Dégustation privée offerte', imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=200' },
      { id: 'off_3', partnerName: 'Sofitel', description: 'Accès Spa VIP illimité', imageUrl: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&q=80&w=200' }
    ];
  }

  // Simulate QR Validation
  async validatePass(qrContent: string): Promise<any> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (qrContent.startsWith('IBC-MEMBER')) {
          const parts = qrContent.split('-');
          resolve({
            name: parts[2] || 'Membre IBC',
            tier: parts[3] || 'Bronze',
            valid: true
          });
        } else {
          reject('Code invalide');
        }
      }, 2000);
    });
  }
}

export const mockApi = new MockApiService();
