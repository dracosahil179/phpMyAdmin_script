const USERS_KEYS = require("./relation_key/users");
const KYC_KEYS = require("./relation_key/kyc");
const KYC_DOCUMENTS_KEYS = require("./relation_key/kyc_documents");
const { QueryTypes } = require("sequelize");
require("dotenv").config();
const { db1, db2 } = require("./db");
const KEYS_VALUE = {
  users: USERS_KEYS.KEYS,
  kyc: KYC_KEYS.KEYS,
  kyc_documents: KYC_DOCUMENTS_KEYS.KEYS,
};

const migrateData = async () => {
  try {
    let [response, keyValue] = ["", ""];
    if (process.env.TABLE_NAME == "users") {
      // Fetch Data from OldTable
      response = await db1.query(
        `SELECT * FROM users as u JOIN identities as i ON i.users_id = u.users_id`,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      console.log("Fetched Data:", response);
      console.log("KEY Mappings:", KEYS_VALUE.users);

      keyValue = KEYS_VALUE.users;
    }
    if (process.env.TABLE_NAME == "kyc") {
      // Fetch Data from PostgreSQL
      response = await db1.query(`SELECT * FROM kyc`, {
        type: QueryTypes.SELECT,
        raw: true,
      });

      console.log("Fetched Data:", response);
      console.log("KEY Mappings:", KEYS_VALUE.kyc);
      keyValue = KEYS_VALUE.kyc;
    }
    if (process.env.TABLE_NAME == "kyc_documents") {
      // Fetch Data from PostgreSQL
      response = await db1.query(
        `SELECT * FROM kyc_documents as kd JOIN kyc as k ON k.kyc_id = kd.kyc_id`,
        {
          type: QueryTypes.SELECT,
          raw: true,
        }
      );

      console.log("Fetched Data:", response);
      console.log("KEY Mappings:", KEYS_VALUE.kyc_documents);
      keyValue = KEYS_VALUE.kyc_documents;
    }

    if (response && keyValue && process.env.TABLE_NAME) {
      // Map keys using KEYS_VALUE
      const mappedArray = response.map((item) => {
        let newObj = {};
        Object.keys(keyValue).forEach((newKey) => {
          const oldKey = keyValue[newKey];
          console.log("oldKey :: ", oldKey);
          if (
            [
              "kyc_id",
              "users_id",
              "user_id",
              // "passport_doc_id",
              // "selfie_id",
              // "financial_doc_id",
              // "letter_from_user_id",
            ].includes(oldKey)
          )
            newObj[oldKey] = Buffer.from(item[oldKey], "hex");
          else newObj[newKey] = item[oldKey] == 0 ? "0" : item[oldKey] || null;
        });
        console.log("newObj ::: ", newObj);
        return newObj;
      });

      console.log("Mapped Data:", mappedArray);

      if (mappedArray.length) {
        await insertData(mappedArray, keyValue, process.env.TABLE_NAME);
      }
    }
  } catch (err) {
    console.error("Error during migration:", err);
  }
};

async function insertData(data, KEYS_VALUE, tableName) {
  try {
    for (const item of data) {
      // if (tableName == "users") {
      //   // Check if email already exists
      //   const email = item[KEYS_VALUE.email]; // Assuming KEYS_VALUE has email mapped
      //   const checkEmailQuery = `SELECT 1 FROM ${tableName} WHERE email = ? LIMIT 1`;

      //   const [existingEmail] = await db2.query(checkEmailQuery, {
      //     replacements: [email],
      //     type: QueryTypes.SELECT,
      //   });

      //   if (existingEmail) {
      //     console.log(`Email ${email} already exists, skipping insert.`);
      //     continue; // Skip insertion if email already exists
      //   }

      //   // Prepare columns, values, and placeholders
      //   const columns = Object.keys(KEYS_VALUE).join(", ");
      //   const values = Object.keys(KEYS_VALUE).map(
      //     (key) => item[KEYS_VALUE[key]] // Correct mapping
      //   );
      //   const placeholders = values.map(() => "?").join(", ");

      //   const sql = `INSERT INTO users (${columns}) VALUES (${placeholders})`;
      //   console.log("sql :::: ", sql);

      //   // Insert the data
      //   await db2.query(sql, { replacements: values, type: QueryTypes.INSERT });
      //   console.log(`Inserted user with email: ${email}`);
      // } else {
      const columns = Object.keys(KEYS_VALUE).join(", ");
      const values = Object.keys(KEYS_VALUE).map(
        // (key) => item[KEYS_VALUE[key]] // Correct mapping
        (key) => {
          console.log({ key, val: item[KEYS_VALUE[key]] });
          return item[KEYS_VALUE[key]] || null;
        }
      );
      const placeholders = values.map(() => "?").join(", ");
      console.log("placeHolders :::: ", values);

      const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
      console.log("sql :::: ", sql);
      // await db2.execute(sql, values);
      await db2.query(sql, { replacements: values, type: QueryTypes.INSERT });
      // }
    }
    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

migrateData();
