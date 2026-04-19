# Shared API Contracts - All Team Members
**Source:** `lib/types/api.ts`  
**Date:** April 16, 2026  
**For:** All 10 Team Members to reference

---

## 📋 MEMBER 10 - External Integrations API Contracts

### ✅ OTP Integration

#### **OTPRequest** - Send OTP
```typescript
export interface OTPRequest {
  phone: string  // E.164 format, e.g., "+919876543210"
}
```

#### **OTPResponse** - OTP Sent Response
```typescript
export interface OTPResponse {
  status: 'sent' | 'error'
  message: string
}
```

#### **VerifyOTPRequest** - Verify OTP Code
```typescript
export interface VerifyOTPRequest {
  phone: string    // E.164 format, e.g., "+919876543210"
  code: string     // 6-digit OTP code
}
```

#### **VerifyOTPResponse** - OTP Verification Result
```typescript
export interface VerifyOTPResponse {
  status: 'verified' | 'invalid'
  token?: string   // Auth token if verified
}
```

**Example Usage:**
```typescript
import { otpModule } from '@/lib/modules/integrations'

// Generate OTP
const sendResult = await otpModule.generateOTP('+919876543210')
// Returns: { status: 'sent', message: 'OTP sent successfully' }

// Verify OTP
const verifyResult = await otpModule.verifyOTP('+919876543210', '123456')
// Returns: { status: 'verified', token: 'auth_token_...' }
```

---

### ✅ WhatsApp Integration

#### **WhatsAppRequest** - Send WhatsApp Message
```typescript
export interface WhatsAppRequest {
  message: string    // Message content (max 4096 chars)
  recipient: string  // E.164 format, e.g., "+919876543210"
}
```

#### **WhatsAppResponse** - Message Sent Response
```typescript
export interface WhatsAppResponse {
  status: 'sent' | 'error'
  messageId?: string  // Unique message ID for tracking
}
```

**Extended WhatsApp Method Signature:**
```typescript
async sendMessage(
  recipient: string,                    // "+919876543210"
  message: string,                      // Message content
  messageType?: 'notification' | 'alert' | 'confirmation',
  agentLocation?: { lat: number; lng: number }
): Promise<WhatsAppSendResponse>
```

**Example Usage:**
```typescript
import { whatsappModule } from '@/lib/modules/integrations'

// Send simple message
const response = await whatsappModule.sendMessage(
  '+919876543210',
  'Your delivery is on the way'
)
// Returns: { status: 'sent', messageId: 'msg_...' }

// Send with location
const withLocation = await whatsappModule.sendMessage(
  '+919876543210',
  'Agent arriving in 5 minutes',
  'notification',
  { lat: 28.7041, lng: 77.1025 }
)

// Track message status
const status = await whatsappModule.getMessageStatus(response.messageId)
// Returns: { deliveryStatus: 'delivered', readStatus: 'read' }

// Bulk messages
const bulk = await whatsappModule.sendBulkMessages(
  ['+919876543210', '+919876543211'],
  'Delivery notification',
  'notification'
)
```

---

### ✅ Payment Integration

#### **PaymentRequest** - Create Payment Order
```typescript
export interface PaymentRequest {
  deliveryId: string  // Linked delivery ID
  amount: number      // Amount in paise (for INR) or smallest unit
  method: string      // 'card' | 'upi' | 'net_banking' | 'wallet'
}
```

#### **PaymentResponse** - Order Created Response
```typescript
export interface PaymentResponse {
  id: string          // Order ID
  transactionId: string
  status: 'success' | 'failed'
}
```

#### **UPIPaymentRequest** - Process UPI Payment
```typescript
export interface UPIPaymentRequest {
  orderId: string    // Order ID from PaymentRequest
  upiId: string      // E.g., "user@okhdfcbank" or "user@upi"
  amount: number     // Amount in smallest currency unit
  deliveryId: string // Linked delivery ID
}
```

#### **UPIPaymentResponse** - UPI Payment Result
```typescript
export interface UPIPaymentResponse {
  status: 'success' | 'pending' | 'failed'
  transactionId: string
  upiId: string
  amount: number
  message?: string
}
```

#### **PaymentVerifyRequest** - Verify Payment
```typescript
export interface PaymentVerifyRequest {
  orderId: string    // Order ID
  paymentId: string  // Payment ID from gateway
  signature: string  // HMAC-SHA256 signature
  amount?: number    // Optional amount verification
}
```

#### **PaymentVerifyResponse** - Payment Verification Result
```typescript
export interface PaymentVerifyResponse {
  verified: boolean
  status: 'success' | 'failed' | 'error'
  transactionId?: string
  message?: string
}
```

**Example Usage:**
```typescript
import { paymentModule } from '@/lib/modules/integrations'

// Create order
const order = await paymentModule.createOrder(
  50000,           // ₹500 (50000 paise)
  'delivery-123',
  'upi'
)
// Returns: { orderId: 'order_...', amount: 50000, status: 'created' }

// Process UPI payment
const upiPay = await paymentModule.processUPIPayment(
  order.orderId,
  'user@okhdfcbank'
)
// Returns: { status: 'success', transactionId: 'upi_txn_...', amount: 50000 }

// Verify payment
const verify = await paymentModule.verifyPayment(
  order.orderId,
  'pay_ABC123',
  'signature_hash_here'
)
// Returns: { verified: true, status: 'success', transactionId: 'pay_ABC123' }

// Process refund (if needed)
const refund = await paymentModule.processRefund(order.orderId, 25000)
// Returns: { status: 'success', refundId: 'refund_...', refundAmount: 25000 }

// Get payment status
const status = await paymentModule.getPaymentStatus(order.orderId)
// Returns: { paymentStatus: 'captured', orderId: '...', amount: 50000 }

// Get payment history for delivery
const history = await paymentModule.getPaymentHistory('delivery-123')
// Returns: Array of payment records
```

---

## 🔗 Other Team Members - Shared Interfaces

### **ScanRequest/ScanResponse**
```typescript
export interface ScanRequest {
  agentId: string
  qrCode: string
  timestamp: number
  location?: { lat: number; lng: number }
}

export interface ScanResponse {
  id: string
  parcelId?: string
  status: 'success' | 'error'
  message: string
}
```

### **LocationRequest/Response**
```typescript
export interface LocationRequest {
  agentId: string
  lat: number
  lng: number
  accuracy: number
}

export interface LocationResponse {
  id: string
  status: 'logged' | 'error'
}
```

### **DeliveryRequest/Response**
```typescript
export interface DeliveryRequest {
  scanId: string
  deliveryStatus: string
}

export interface DeliveryResponse {
  id: string
  status: 'success' | 'error'
}
```

### **DetectRequest/Response**
```typescript
export interface DetectRequest {
  image: string
  confidence?: number
}

export interface DetectResponse {
  detections: Array<{
    label: string
    confidence: number
    bbox: [number, number, number, number]
  }>
}
```

### **SyncRequest/Response**
```typescript
export interface SyncRequest {
  events: any[]
}

export interface SyncResponse {
  synced: number
  failed: number
  status: 'success' | 'partial' | 'error'
}
```

---

## 📦 Import Statements for Team

### Member 10 - External Integrations
```typescript
import { 
  otpModule, 
  whatsappModule, 
  paymentModule 
} from '@/lib/modules/integrations'

import type {
  OTPRequest,
  OTPResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  WhatsAppRequest,
  WhatsAppResponse,
  PaymentRequest,
  PaymentResponse,
  UPIPaymentRequest,
  UPIPaymentResponse,
  PaymentVerifyRequest,
  PaymentVerifyResponse
} from '@/lib/types/api'
```

### All Other Members (Shared Types)
```typescript
import type {
  ScanRequest,
  ScanResponse,
  LocationRequest,
  LocationResponse,
  DeliveryRequest,
  DeliveryResponse,
  DetectRequest,
  DetectResponse,
  SyncRequest,
  SyncResponse,
  PaymentRequest,
  PaymentResponse
} from '@/lib/types/api'
```

---

## 🎯 Integration Points by Member

| Member | Module | API Endpoints | Interfaces |
|--------|--------|---------------|-----------|
| #1 | Scanning | `/api/scan` | ScanRequest, ScanResponse |
| #2 | Location Tracking | `/api/location` | LocationRequest, LocationResponse |
| #3 | Geo-fencing | `/api/geofence` | GeoZone, GeofenceAlert |
| #4 | Delivery Status | `/api/delivery` | DeliveryRequest, DeliveryResponse |
| #5 | Image Detection | `/api/detect` | DetectRequest, DetectResponse |
| #6 | Sync Engine | `/api/sync` | SyncRequest, SyncResponse |
| #7 | Offline Storage | `IndexedDB` | Storage APIs |
| #8 | Authentication | `/api/auth` | Auth types |
| #9 | Analytics | `/api/analytics` | Analytics types |
| **#10** | **External Integrations** | `/api/integrations/otp`, `/api/integrations/whatsapp`, `/api/integrations/payment` | **OTPRequest/Response**, **WhatsAppRequest/Response**, **PaymentRequest/Response**, **UPIPaymentRequest/Response**, **PaymentVerifyRequest/Response** |

---

## 🔐 Environment Variables Used

### OTP & WhatsApp (MSG91)
```
MSG91_AUTH_KEY=509112AjMV1hy6ZDJk69e08315P1
```

### Payment (Razorpay)
```
RAZORPAY_KEY_ID=rzp_test_Se3R0tL3Q82SWj
RAZORPAY_KEY_SECRET=VfVE4osL3cyIy29QhHhnuWPK
```

---

## ✅ Ready to Use

All interfaces are **stable**, **tested**, and **ready for integration** across all 10 team members' modules.

**Status:** Production-ready with comprehensive test coverage ✅
