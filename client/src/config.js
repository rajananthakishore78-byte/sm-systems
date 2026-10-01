import { useEffect, useState } from 'react';
export const rupee = n => '₹' + Number(n).toLocaleString('en-IN');

// Fallbacks used until the admin saves "Website settings"
export const DEFAULTS = { shop_name: 'Your CCTV Showroom', tagline: 'Cameras, recorders and installation for homes and shops.',
  phone: '+91 90000 00000', whatsapp: '919000000000', email: '', address: 'Your street, Chennai',
  hours: 'Mon-Sat 10:00 AM - 8:00 PM', instagram: '', facebook: '', youtube: '', maps_url: '', logo_url: '' };

export const FIELDS = [['shop_name', 'Shop name'], ['tagline', 'Tagline'], ['phone', 'Phone number'],
  ['whatsapp', 'WhatsApp number (digits only, with country code)'], ['email', 'Email'], ['address', 'Address'],
  ['hours', 'Opening hours'], ['instagram', 'Instagram link'], ['facebook', 'Facebook link'],
  ['youtube', 'YouTube link'], ['maps_url', 'Google Maps link']];

export function useSettings() {
  const [s, set] = useState(DEFAULTS);
  useEffect(() => { fetch('/api/settings').then(r => r.json()).then(d => set({ ...DEFAULTS, ...d })).catch(() => {}); }, []);
  return [s, set];
}

// Sliding cards on the home page. Edit the text freely.
export const SLIDES = [
  { icon: '📷', title: 'Dome Cameras', text: 'Discreet indoor cameras for homes and offices.', cat: 'Dome' },
  { icon: '🎥', title: 'Bullet Cameras', text: 'Weatherproof outdoor cameras with night vision.', cat: 'Bullet' },
  { icon: '📼', title: 'DVR & NVR Recorders', text: 'Record and replay from 4 to 32 cameras.', cat: 'Recorders' },
  { icon: '💽', title: 'Surveillance Hard Disks', text: 'Built for 24x7 recording.' },
  { icon: '📡', title: 'WiFi & PT Cameras', text: 'Watch live on your phone from anywhere.', cat: 'Wireless' },
  { icon: '🔌', title: 'SMPS & Power Supplies', text: 'Stable power for every camera.' },
  { icon: '🧵', title: 'Cables & Connectors', text: 'CCTV cables, BNC, DC pins and more.' },
  { icon: '🛠️', title: 'Installation & Service', text: 'Fitting, setup and after-sales support.' },
];

// Strip above the footer. Edit to match what your shop really offers.
export const PERKS = [['Genuine products', 'Branded cameras and recorders'], ['Expert installation', 'Neat wiring and proper setup'],
  ['After-sales support', 'Help when you need it'], ['Free enquiry', 'Ask us on call or WhatsApp']];
