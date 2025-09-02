# Google Maps Integration Setup Guide

## Overview
The customer signup page now includes Google Maps integration for location selection. Users can either:
1. Use traditional dropdown menus for District/Province selection
2. Use an interactive Google Map to pinpoint their exact location

## Features Implemented

### 1. LocationPicker Component
- **Location**: `/src/components/LocationPicker.tsx`
- **Features**:
  - Interactive Google Map with dark theme
  - Click to select location
  - "Use Current Location" button for GPS location
  - Reverse geocoding to get address from coordinates
  - Real-time address display
  - Automatic district/province detection

### 2. Updated Customer Signup Form
- **Location**: `/src/app/customer/page_new.tsx`
- **Features**:
  - Toggle between map and dropdown selection
  - Responsive design (grid layout for larger screens)
  - Form validation for both location methods
  - Stores latitude, longitude, and full address

### 3. Database Schema Updates
- **Customer Model**: Added optional fields:
  - `latitude: Number` - GPS latitude coordinate
  - `longitude: Number` - GPS longitude coordinate  
  - `address: String` - Full formatted address from Google Maps

### 4. API Updates
- **Registration API**: Now accepts and stores location data
- **Backward Compatible**: Still works with traditional district/province only

## Setup Instructions

### 1. Get Google Maps API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the following APIs:
   - Google Maps JavaScript API
   - Geocoding API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security

### 2. Configure Environment Variables
1. Create `.env.local` file in the project root
2. Add your API key:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### 3. Install Dependencies
Dependencies are already installed:
- `@react-google-maps/api` - React wrapper for Google Maps
- `@types/google.maps` - TypeScript definitions

## Usage

### For Users:
1. **Traditional Method**: Select district and province from dropdowns
2. **Map Method**: 
   - Click "Use Map" button
   - Click anywhere on the map to select location
   - Use "Use Current Location" for GPS positioning
   - Address is automatically filled

### For Developers:
```tsx
import LocationPicker from '@/components/LocationPicker';

<LocationPicker
  onLocationSelect={(location) => {
    console.log('Selected:', location);
    // location contains: lat, lng, address, district?, province?
  }}
  initialLocation={{ lat: 6.9271, lng: 79.8612 }} // Optional
  className="w-full" // Optional styling
/>
```

## API Response Format

When a user registers with map selection, the customer object includes:
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "district": "Colombo",
  "province": "Western",
  "latitude": 6.9271,
  "longitude": 79.8612,
  "address": "123 Galle Road, Colombo 03, Sri Lanka",
  "priceAlerts": [],
  "createdAt": "2025-09-02T..."
}
```

## Security Considerations

1. **API Key Restriction**: Restrict your Google Maps API key to your domain
2. **Rate Limiting**: Google Maps has usage limits - monitor usage in Google Cloud Console
3. **Data Validation**: Server-side validation ensures location data is optional and properly formatted

## Future Enhancements

1. **Geofencing**: Use location data for targeted price alerts
2. **Delivery Zones**: Calculate delivery availability based on coordinates
3. **Local Market Integration**: Show nearby markets and sellers
4. **Analytics**: Track user distribution by location for business insights

## Troubleshooting

### Common Issues:
1. **Map not loading**: Check API key and enabled APIs
2. **Geocoding failed**: Ensure Geocoding API is enabled
3. **Location not detected**: Check browser permissions for location access

### Error Handling:
- Component shows loading state while map loads
- Fallback to dropdown if Google Maps fails
- User-friendly error messages for API failures
