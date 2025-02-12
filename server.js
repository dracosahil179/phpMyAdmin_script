const USERS_KEYS = require("./relation_key/users");
const KYC_KEYS = require("./relation_key/kyc");
const KYC_DOCUMENTS_KEYS = require("./relation_key/kyc_documents");
const _2FA_SETTINGS_KEYS = require("./relation_key/2fa_settings");
const DELETED_ACCOUNTS_KEYS = require("./relation_key/deleted_accounts");
const FILES_KEYS = require("./relation_key/files");
const REFERRAL_CODES_KEYS = require("./relation_key/referral_codes");
const REFERRAL_TREE_KEYS = require("./relation_key/referral_tree");
const USERS_STATUS_HISTORY_KEYS = require("./relation_key/users_status_history");
const USER_DELIVERY_ADDRESS_KEYS = require("./relation_key/user_delivery_address");
const ALLOWED_IP_ADDRESS_KEYS = require("./relation_key/allowed_ip_addresses");
const { QueryTypes } = require("sequelize");
require("dotenv").config();
const { db1, db2 } = require("./db");
const KEYS_VALUE = {
  users: USERS_KEYS.KEYS,
  kyc: KYC_KEYS.KEYS,
  kyc_documents: KYC_DOCUMENTS_KEYS.KEYS,
  _2FA_SETTINGS: _2FA_SETTINGS_KEYS.KEYS,
  deleted_accounts: DELETED_ACCOUNTS_KEYS.KEYS,
  files: FILES_KEYS.KEYS,
  referral_codes: REFERRAL_CODES_KEYS.KEYS,
  referral_tree: REFERRAL_TREE_KEYS.KEYS,
  users_status_history: USERS_STATUS_HISTORY_KEYS.KEYS,
  user_delivery_address: USER_DELIVERY_ADDRESS_KEYS.KEYS,
  allowed_ip_addresses: ALLOWED_IP_ADDRESS_KEYS.KEYS,
};

const migrateData = async () => {
  try {
    const { response = "", keyValue = "" } = await queryRelatedDb();
    console.log("response :::: ", response);
    console.log("keyValue :::: ", keyValue);
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
              "2fa_settings_id",
              "files_id",
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

async function queryRelatedDb() {
  const tableName = process.env.TABLE_NAME;
  const queryMap = {
    users: `SELECT * FROM users as u JOIN identities as i ON i.users_id = u.users_id`,
    kyc: `SELECT * FROM kyc`,
    kyc_documents: `SELECT * FROM kyc_documents as kd JOIN kyc as k ON k.kyc_id = kd.kyc_id`,
    "2fa_settings": `SELECT * FROM 2fa_settings`,
    files: `SELECT * FROM files`,
    referral_codes: `SELECT * FROM referral_codes`,
    referral_tree: `SELECT * FROM referral_tree`,
    users_status_history: `SELECT * FROM users_status_history`,
    user_delivery_address: `SELECT * FROM user_delivery_address`,
    allowed_ip_addresses: `SELECT * FROM allowed_ip_addresses`,
  };

  if (!queryMap[tableName]) {
    throw new Error(`Unsupported table name: ${tableName}`);
  }

  const response = await db1.query(queryMap[tableName], {
    type: QueryTypes.SELECT,
    raw: true,
  });

  console.log("Fetched Data:", response);
  console.log("KEY Mappings:", KEYS_VALUE[tableName]);

  return { response, keyValue: KEYS_VALUE[tableName] };
}

async function insertData(data, KEYS_VALUE, tableName) {
  try {
    console.log("KEYS_VALUE ::: ", data);
    for (const item of data) {
      const columns = Object.keys(KEYS_VALUE).join(", ");
      // const values = Object.keys(KEYS_VALUE).map((key) => {
      //   console.log({
      //     key,
      //     val: item[KEYS_VALUE[key]] || item[KEYS_VALUE[key]],
      //     KEYS: KEYS_VALUE[key],
      //     KEYS_GET: item[key],
      //   });
      //   return item[KEYS_VALUE[key]] || item[key] || null;
      // });
      const values = Object.keys(KEYS_VALUE).map(
        (key) => item[KEYS_VALUE[key]] || item[key] || null
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
