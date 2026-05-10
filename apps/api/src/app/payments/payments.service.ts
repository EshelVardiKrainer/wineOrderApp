import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(private readonly config: ConfigService) {
    const mode = config.get<string>('PAYPAL_MODE', 'sandbox');
    this.baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
    this.clientId = config.get<string>('PAYPAL_CLIENT_ID', '');
    this.clientSecret = config.get<string>('PAYPAL_CLIENT_SECRET', '');
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(
      `${this.clientId}:${this.clientSecret}`,
    ).toString('base64');

    const res = await fetch(`${this.baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!res.ok) {
      throw new InternalServerErrorException('Failed to authenticate with PayPal');
    }

    const data = (await res.json()) as { access_token: string };
    return data.access_token;
  }

  async createOrder(body: {
    amount: { value: string; currency_code: string };
    description?: string;
    items?: Array<{
      name: string;
      quantity: string;
      unit_amount: { value: string; currency_code: string };
    }>;
  }): Promise<{ orderId: string; success: boolean }> {
    const token = await this.getAccessToken();

    const payload: Record<string, unknown> = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: body.description,
          amount: {
            currency_code: body.amount.currency_code,
            value: body.amount.value,
            ...(body.items?.length
              ? {
                  breakdown: {
                    item_total: {
                      currency_code: body.amount.currency_code,
                      value: body.amount.value,
                    },
                  },
                }
              : {}),
          },
          ...(body.items?.length ? { items: body.items } : {}),
        },
      ],
    };

    const res = await fetch(`${this.baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new InternalServerErrorException(`PayPal create order failed: ${err}`);
    }

    const data = (await res.json()) as { id: string };
    return { orderId: data.id, success: true };
  }

  async captureOrder(orderId: string): Promise<{
    success: boolean;
    captureId: string;
    status: string;
    amount: string;
  }> {
    const token = await this.getAccessToken();

    const res = await fetch(
      `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!res.ok) {
      const err = await res.text();
      throw new InternalServerErrorException(`PayPal capture failed: ${err}`);
    }

    const data = (await res.json()) as {
      status: string;
      purchase_units: Array<{
        payments: {
          captures: Array<{ id: string; amount: { value: string } }>;
        };
      }>;
    };

    const capture = data.purchase_units[0]?.payments?.captures?.[0];
    return {
      success: true,
      captureId: capture?.id ?? '',
      status: data.status,
      amount: capture?.amount?.value ?? '0',
    };
  }
}
