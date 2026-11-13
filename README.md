# Nommy's Bites — Web Frontend

The official web application for **Nommy's Bites**, a Nigerian small chops, snacks, and celebration gift boxes brand in Benin City.

## Features

- **Menu & Packages Catalog**: Browse curated small chops boxes, pastries, drinks, and snacks.
- **Custom Box Builder**: Build custom small chops boxes with live item count and real-time pricing.
- **Surprise Gift Boxes**: Send surprise boxes with personalized handwritten cards, delivery scheduling, and recipient details.
- **Interactive Delivery Location Map**: Leaflet-powered Benin City GPS pin drop and address search with automatic distance-based delivery fee calculations.
- **Secure Paystack Checkout**: Online payment via card, bank transfer, and USSD.
- **Passwordless Authentication & OTP**: Fast, secure verification code login.
- **Customer Account Portal**: Saved delivery address / GPS coordinates management and itemized order history with direct WhatsApp receipts.
- **Floating Shopping Bag & WhatsApp Support**: Persistent cart modals and instant customer service access.

## Tech Stack

- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Maps & Geolocation**: Leaflet & OpenStreetMap
- **Payments**: Paystack Inline JS SDK
- **Styling**: Modern Vanilla CSS with CSS Variables & Responsive Layouts
- **Linting & Code Quality**: Oxlint

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/nommysbites/nommysbites-web-frontend.git
cd nommysbites-web-frontend

# Install dependencies
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env` and provide your Paystack public key:
```bash
cp .env.example .env
```
Inside `.env`:
```env
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### 4. Running the Development Server
```bash
npm run dev
```

### 5. Production Build & Linting
```bash
# Run Oxlint
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```
