// PortOne SDK 타입 정의
interface PortOneCustomer {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
}

interface PortOneWindowType {
  pc?: 'IFRAME' | 'POPUP' | 'REDIRECT';
  mobile?: 'IFRAME' | 'POPUP' | 'REDIRECT';
}

interface PortOnePaymentRequest {
  storeId: string;
  channelKey: string;
  paymentId: string;
  orderName: string;
  totalAmount: number;
  currency: 'CURRENCY_KRW' | 'CURRENCY_USD';
  payMethod: 'CARD' | 'TRANSFER' | 'EASY_PAY' | 'VIRTUAL_ACCOUNT';
  customer?: PortOneCustomer;
  windowType?: PortOneWindowType;
  redirectUrl?: string;
}

interface PortOnePaymentResponse {
  code?: string;
  message?: string;
  paymentId?: string;
  transactionType?: string;
}

interface PortOneSDK {
  requestPayment(options: PortOnePaymentRequest): Promise<PortOnePaymentResponse>;
}

declare const PortOne: PortOneSDK;
