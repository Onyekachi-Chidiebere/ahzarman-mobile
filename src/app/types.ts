export type AppScreen =
  | 'onboarding'
  | 'sign_up'
  | 'sign_in'
  | 'home'
  | 'services'
  | 'rewards'
  | 'profile'
  | 'history'
  | 'notifications'
  | 'notifications_from_profile'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'elec_success'
  | 'tv'
  | 'giftcards'
  | 'flights'
  | 'betting'
  | 'esim'
  | 'success_simple'
  | 'share_points'
  | 'redeem_points'
  | 'refer'
  | 'contact_us'
  | 'payment_settings'
  | 'beneficiaries'
  | 'personal_info'
  | 'security'
  | 'terms';

export type DataPlan = {
  id: string;
  size: string;
  price: number;
  validity: string;
  pts: number;
  tag?: string;
};

export type DataTab = 'hot' | 'daily' | 'weekly' | 'monthly';

export type DataState = {
  tab: DataTab;
  network: string;
  plan: DataPlan | null;
  phone: string;
};

export type Beneficiary = {
  id: number;
  name: string;
  phone: string;
  network: string;
};

export type Tx = {
  id: string;
  type:
    | 'airtime'
    | 'data'
    | 'electricity'
    | 'tv'
    | 'giftcard'
    | 'flights'
    | 'betting'
    | 'esim'
    | 'refund'
    | 'points';
  title: string;
  subtitle?: string;
  amount: string;
  date?: string;
  pts?: string;
  status?: 'Successful' | 'Pending' | 'Failed';
};

