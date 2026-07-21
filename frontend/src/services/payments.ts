import api from './api';

export interface StkPushResponse {
  payment_id: string;
  merchant_request_id: string;
  message: string;
}

export interface PaymentStatus {
  payment_id: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled';
  tier_unlocked: string | null;
  provider_ref: string | null;
  amount_kes: number;
}

export const paymentsService = {
  async mpesaStkPush(phone: string, tier: string): Promise<StkPushResponse> {
    const { data } = await api.post('/payments/mpesa/stk-push', { phone, tier });
    return data;
  },

  async donate(phone: string, amount: number, name: string): Promise<StkPushResponse> {
    const { data } = await api.post('/payments/mpesa/donate', { phone, amount, name });
    return data;
  },

  async getStatus(paymentId: string): Promise<PaymentStatus> {
    const { data } = await api.get(`/payments/status/${paymentId}`);
    return data;
  },

  async getHistory() {
    const { data } = await api.get('/payments/history');
    return data;
  },
};
