const fs = require("fs");
let path = "src/components/SMMOperationsSection.tsx";
let c = fs.readFileSync(path, "utf8");
let index = c.indexOf("const INITIAL_TRANSACTIONS: SMMTransaction[] = [");
if (index > -1) {
  let end = c.indexOf("];\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 3);
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully INITIAL_TRANSACTIONS");
  }
}
let index2 = c.indexOf("const SERVICES_DATA: SMMService[] = [");
if (index2 > -1) {
  let end2 = c.indexOf("];\n", index2);
  if (end2 > -1) {
    let toReplace = c.substring(index2, end2 + 3);
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully SERVICES_DATA");
  }
}
