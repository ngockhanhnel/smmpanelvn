const fs = require("fs");
let path = "src/components/AdminCouponManagement.tsx";
let c = fs.readFileSync(path, "utf8");

// Change declaration to `useState<Coupon[]>([]);` and add `useEffect` to fetch from Firebase
c = c.replace(
  /const \[coupons, setCoupons\] = useState<Coupon\[\]>\(\[[\s\S]*?\]\);/m,
  `const [coupons, setCoupons] = useState<Coupon[]>([]);
  const { useEffect } = require('react'); // Added through import manually later`
);

let importLine = c.match(/import \{ useState, useMemo \}/);
if (importLine) {
  c = c.replace(/import \{ useState, useMemo \}/, "import { useState, useMemo, useEffect }");
}

let afterCouponsDec = `
  useEffect(() => {
    const importFirebase = async () => {
      const { db } = await import('../firebase');
      const { collection, onSnapshot } = await import('firebase/firestore');
      
      const unsub = onSnapshot(collection(db, 'coupons'), (snap) => {
        const list: Coupon[] = [];
        snap.forEach(doc => {
          const d = doc.data();
          list.push({
            id: doc.id,
            code: d.code || '',
            type: d.type || 'Percentage',
            value: d.value || 0,
            uses: d.uses || 0,
            maxUses: d.maxUses !== undefined ? d.maxUses : null,
            validUntil: d.validUntil || '2026-12-31',
            status: d.status || 'Active',
            appliesTo: d.appliesTo || 'All',
            minDeposit: d.minDeposit || 0,
            oneUsePerUser: !!d.oneUsePerUser
          });
        });
        setCoupons(list);
      });
      return unsub;
    };
    
    let unsubscribe: any = null;
    importFirebase().then(unsub => { unsubscribe = unsub; });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);
`;

c = c.replace(/const { useEffect } = require\('react'\);[^\n]*/, afterCouponsDec);

fs.writeFileSync(path, c);
console.log("Replaced successfully AdminCouponManagement coupons");
