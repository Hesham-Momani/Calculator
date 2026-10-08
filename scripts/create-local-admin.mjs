import { randomBytes, pbkdf2Sync } from "node:crypto";
import { writeFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
const rl=createInterface({input:process.stdin,output:process.stdout});
try {
 const password=await rl.question("Initial sysadmin password (input is visible): ");
 if(password.length<6)throw new Error("Use at least 6 characters.");
 const salt=randomBytes(32).toString("hex");
 const hash=pbkdf2Sync(password,salt,100000,32,"sha256").toString("hex");
 writeFileSync(".dev.vars",`SYSADMIN_ACCOUNT_EMAIL="sysadmin@example.test"\nSYSADMIN_INITIAL_HASH="${hash}"\nSYSADMIN_INITIAL_SALT="${salt}"\n`,{flag:"wx",mode:0o600});
 console.log("Created local .dev.vars. This file is excluded from Git. Never upload it.");
} finally {rl.close();}
