# BlackBox Mobile Addon (demo)

This is a minimal React Native / Expo scaffold for the BlackBox CRM mobile addon.

Run locally (with Expo CLI installed):

```powershell
Set-Location 'C:\BMH\SW\BMHBlackBoxCRM\mobile-addon'
npm install
npm start
```

Notes:
- Uses an in-memory offline cache for demo purposes. Replace with `AsyncStorage` or filesystem for production.
- Map and scanning are placeholders; can be extended with Mapbox/Leaflet and camera/QR scanning.
