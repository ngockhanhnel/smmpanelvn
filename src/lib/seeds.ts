import { db } from '../firebase';
import { collection, getDocs, doc, writeBatch, setDoc } from 'firebase/firestore';

const DEFAULT_SERVICES = [
  {
    id: "inst-fol-1",
    name: "Instagram Followers — Real & Active (Gradual Delivery)",
    category: "Instagram",
    type: "default",
    description: "High quality real-looking accounts. Gradual and organic delivery. Perfectly safe for brand pages.",
    rate: 1.20,
    minOrder: 100,
    maxOrder: 100000,
    providerId: "prov-1",
    providerServiceId: "api-101",
    refill: true,
    refillDays: 30,
    status: "active",
    avgSpeed: "5,000/day"
  },
  {
    id: "inst-lik-2",
    name: "Instagram Likes — High Quality Instant [No Drop]",
    category: "Instagram",
    type: "default",
    description: "Instant reaction delivery. Stable accounts. Boosts immediate Instagram algorithm recommendations.",
    rate: 0.45,
    minOrder: 50,
    maxOrder: 50000,
    providerId: "prov-1",
    providerServiceId: "api-102",
    refill: true,
    refillDays: 90,
    status: "active",
    avgSpeed: "Instant"
  },
  {
    id: "tok-vw-1",
    name: "TikTok Viral Video Views - Max Speed",
    category: "TikTok",
    type: "default",
    description: "Extremely cheap views. Max speed delivery. Boosts immediate viral trends.",
    rate: 0.10,
    minOrder: 500,
    maxOrder: 500000,
    providerId: "prov-2",
    providerServiceId: "tok-201",
    refill: false,
    refillDays: 0,
    status: "active",
    avgSpeed: "100,000/hr"
  },
  {
    id: "yt-wh-1",
    name: "YouTube Watch Hours Pack [Mone_Ready Org]",
    category: "YouTube",
    type: "default",
    description: "Real-time viewer watch retention. Handled via target partner network. Meets monet_pack standards.",
    rate: 22.40,
    minOrder: 100,
    maxOrder: 10000,
    providerId: "prov-2",
    providerServiceId: "yt-301",
    refill: true,
    refillDays: 30,
    status: "active",
    avgSpeed: "300 hours/day"
  },
  {
    id: "tg-grp-1",
    name: "Telegram Premium Group Members",
    category: "Telegram",
    type: "default",
    description: "High retention authentic group members with unique accounts. Zero drop guarantee.",
    rate: 2.50,
    minOrder: 100,
    maxOrder: 20000,
    providerId: "prov-1",
    providerServiceId: "tg-401",
    refill: true,
    refillDays: 30,
    status: "active",
    avgSpeed: "2,000/day"
  }
];

const DEFAULT_PROVIDERS = [
  {
    id: "prov-1",
    name: "SMM Global Reseller Gateway Ltd",
    apiUrl: "https://api.smm-reseller-gateway.com/v2",
    apiKey: "ak_live_7g98y4u2r9gh8h2g7d632h4fhv9342g",
    balance: 4280.45,
    status: "active"
  },
  {
    id: "prov-2",
    name: "ViraLMedia API Hub Inc",
    apiUrl: "https://viralmediaapihub.com/api/v1",
    apiKey: "ak_live_09yg2u3gh9r23hg8f12f83fh8h9g3h2f",
    balance: 1450.00,
    status: "active"
  }
];

const DEFAULT_COUPONS = [
  {
    id: "coupon-1",
    code: "WELCOME10",
    type: "fixed",
    value: 10.00,
    maxUses: 100,
    usedCount: 15,
    expiresAt: "2028-12-31T23:59:59Z",
    status: "active"
  },
  {
    id: "coupon-2",
    code: "PROSMM20",
    type: "percent",
    value: 20,
    maxUses: 50,
    usedCount: 5,
    expiresAt: "2028-12-31T23:59:59Z",
    status: "active"
  }
];

const DEFAULT_SETTINGS = [
  { key: "platform_name", value: "ProSMM Panel" },
  { key: "min_deposit", value: "5" },
  { key: "announcement_text", value: "🚀 Welcome back! Instagram likes and TikTok views have been updated with up to 10M/day instant processing speed!" }
];

export async function seedDatabaseIfEmpty() {
  try {
    // 1. Seed Services
    const serviceCol = collection(db, 'services');
    const serviceSnap = await getDocs(serviceCol);
    if (serviceSnap.empty) {
      console.log("Seeding services to Firestore...");
      const batch = writeBatch(db);
      DEFAULT_SERVICES.forEach((service) => {
        const docRef = doc(serviceCol, service.id);
        batch.set(docRef, service);
      });
      await batch.commit();
    }

    // 2. Seed Providers
    const providerCol = collection(db, 'providers');
    const providerSnap = await getDocs(providerCol);
    if (providerSnap.empty) {
      console.log("Seeding providers to Firestore...");
      const batch = writeBatch(db);
      DEFAULT_PROVIDERS.forEach((prov) => {
        const docRef = doc(providerCol, prov.id);
        batch.set(docRef, prov);
      });
      await batch.commit();
    }

    // 3. Seed Coupons
    const couponCol = collection(db, 'coupons');
    const couponSnap = await getDocs(couponCol);
    if (couponSnap.empty) {
      console.log("Seeding coupons to Firestore...");
      const batch = writeBatch(db);
      DEFAULT_COUPONS.forEach((coup) => {
        const docRef = doc(couponCol, coup.id);
        batch.set(docRef, coup);
      });
      await batch.commit();
    }

    // 4. Seed Settings
    const settingsCol = collection(db, 'settings');
    const settingsSnap = await getDocs(settingsCol);
    if (settingsSnap.empty) {
      console.log("Seeding settings to Firestore...");
      for (const setting of DEFAULT_SETTINGS) {
        const docRef = doc(settingsCol, setting.key);
        await setDoc(docRef, { value: setting.value });
      }
    }
    console.log("Firestore Seeding verification successfully completed.");
  } catch (error) {
    console.error("Firestore database seeding failed", error);
  }
}
