export interface PaymentProviderConfig {
  provider: string;
  encryptedApiKey: string;
  encryptedSecret: string;
  sandbox: boolean;
  webhookSecret?: string;
}

export interface ShippingProviderConfig {
  provider: string;
  encryptedApiKey: string;
  encryptedSecret?: string;
}

export interface EmailProviderConfig {
  provider: string;
  encryptedApiKey: string;
  fromAddress: string;
  fromName: string;
}
