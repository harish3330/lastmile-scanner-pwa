import {
  ScanRequest,
  ScanResponse,
  DetectRequest,
  DetectResponse,
  LocationRequest,
  LocationResponse,
  DeliveryRequest,
  DeliveryResponse,
  PaymentRequest,
  PaymentResponse,
} from './types/api'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class APIClient {
  private baseUrl: string

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (body) {
      options.body = JSON.stringify(body)
    }

    const response = await fetch(url, options)

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `API Error: ${response.status}`)
    }

    return response.json()
  }

  // Scan API
  async scan(request: ScanRequest): Promise<ScanResponse> {
    return this.request('/api/scan', 'POST', request)
  }

  // Detection API
  async detect(request: DetectRequest): Promise<DetectResponse> {
    return this.request('/api/detect', 'POST', request)
  }

  // Location API
  async trackLocation(request: LocationRequest): Promise<LocationResponse> {
    return this.request('/api/location', 'POST', request)
  }

  // Delivery API
  async updateDelivery(request: DeliveryRequest): Promise<DeliveryResponse> {
    return this.request('/api/delivery', 'POST', request)
  }

  // Payment API
  async verifyPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return this.request('/api/payment/verify', 'POST', request)
  }

  // Sync API
  async syncEvents(events: any[]): Promise<any> {
    return this.request('/api/sync', 'POST', { events })
  }

  // OTP API
  async sendOTP(phone: string): Promise<any> {
    return this.request('/api/integrations/otp/send', 'POST', { phone })
  }

  async verifyOTP(phone: string, code: string): Promise<any> {
    return this.request('/api/integrations/otp/verify', 'POST', { phone, code })
  }

  // WhatsApp API
  async sendWhatsApp(recipient: string, message: string): Promise<any> {
    return this.request('/api/integrations/whatsapp/send', 'POST', {
      recipient,
      message,
    })
  }
}

export const apiClient = new APIClient()
