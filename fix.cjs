const fs = require("fs");
let c = fs.readFileSync("src/components/OrderHistorySection.tsx", "utf8");
let index = c.indexOf("const INITIAL_MOCK_ORDERS");
if (index > -1) {
  let end = c.indexOf("];\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 3);
    c = c.replace(toReplace, "");
    c = c.replace(/1284 \+ \(list\.length - INITIAL_MOCK_ORDERS\.length\)/g, "list.length");
    c = c.replace(/1156 \+ list\.filter\(o => o\.status === '"'"'Completed'"'"'\)\.length - INITIAL_MOCK_ORDERS\.filter\(o => o\.status === '"'"'Completed'"'"'\)\.length/g, "list.filter(o => o.status === 'Completed').length");
    c = c.replace(/23 \+ list\.filter\(o => o\.status === '"'"'In Progress'"'"' \|\| o\.status === '"'"'Partial'"'"'\)\.length - INITIAL_MOCK_ORDERS\.filter\(o => o\.status === '"'"'In Progress'"'"' \|\| o\.status === '"'"'Partial'"'"'\)\.length/g, "list.filter(o => o.status === 'In Progress' || o.status === 'Partial').length");
    c = c.replace(/12 \+ list\.filter\(o => o\.status === '"'"'Pending'"'"'\)\.length - INITIAL_MOCK_ORDERS\.filter\(o => o\.status === '"'"'Pending'"'"'\)\.length/g, "list.filter(o => o.status === 'Pending').length");
    c = c.replace(/93 \+ list\.filter\(o => o\.status === '"'"'Cancelled'"'"' \|\| o\.status === '"'"'Refunded'"'"'\)\.length - INITIAL_MOCK_ORDERS\.filter\(o => o\.status === '"'"'Cancelled'"'"' \|\| o\.status === '"'"'Refunded'"'"'\)\.length/g, "list.filter(o => o.status === 'Cancelled' || o.status === 'Refunded').length");
    fs.writeFileSync("src/components/OrderHistorySection.tsx", c);
    console.log("Replaced successfully");
  } else { console.log("end not found"); }
} else { console.log("index not found"); }

let c2 = fs.readFileSync("src/components/SMMSupportAndSettingsSection.tsx", "utf8");
let idx2 = c2.indexOf("const INITIAL_TICKETS: SMMTicket[] = [");
if (idx2 > -1) {
  let end2 = c2.indexOf("  // ==========================================", idx2);
  if (end2 > -1) {
    let toRep2 = c2.substring(idx2, end2);
    c2 = c2.replace(toRep2, "");
    fs.writeFileSync("src/components/SMMSupportAndSettingsSection.tsx", c2);
    console.log("Replaced successfully for SMM");
  }
}
