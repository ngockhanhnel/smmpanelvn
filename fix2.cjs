const fs = require("fs");

let path = "src/components/AdminOrderManagement.tsx";
let c = fs.readFileSync(path, "utf8");
let index = c.indexOf("const INITIAL_ADMIN_ORDERS: SMMOrderRecord[] = [");
if (index > -1) {
  let end = c.indexOf("];\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 3);
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully AdminOrderManagement");
  }
}

path = "src/components/AdminServiceManagement.tsx";
c = fs.readFileSync(path, "utf8");
index = c.indexOf("const INITIAL_SERVICES: SMMService[] = [");
if (index > -1) {
  let end = c.indexOf("];\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 3);
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully AdminServiceManagement");
  }
}

path = "src/components/AdminPaymentManagement.tsx";
c = fs.readFileSync(path, "utf8");
index = c.indexOf("const [transactions, setTransactions] = useState<Transaction[]>([");
if (index > -1) {
  let end = c.indexOf("]);\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 4); // ]);\n
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully AdminPaymentManagement");
  }
}

path = "src/components/AdminUserManagement.tsx";
c = fs.readFileSync(path, "utf8");
index = c.indexOf("const INITIAL_USERS: UserRecord[] = [");
if (index > -1) {
  let end = c.indexOf("];\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 3);
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully AdminUserManagement");
  }
}

path = "src/components/AdminProviderManagement.tsx";
c = fs.readFileSync(path, "utf8");
index = c.indexOf("const INITIAL_PROVIDERS: SMMProvider[] = [");
if (index > -1) {
  let end = c.indexOf("];\n", index);
  if (end > -1) {
    let toReplace = c.substring(index, end + 3);
    c = c.replace(toReplace, "");
    fs.writeFileSync(path, c);
    console.log("Replaced successfully AdminProviderManagement");
  }
}
