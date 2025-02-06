const KEYS = {
  user_id: "users_id",
  email: "email", // identities
  password_digest: "password_digest", // identities
  salt: "salt", // identities
  is_email_verified: "is_email_verified", // identities
  is_social_user: "is_social_user",
  social_id: "social_id", // identities
  social_media: "social_media",
  is_beta_user: "is_beta_user",
  account_type: "account_type",
  activated_at: "activated_at",
  suspended_at: "suspended_at",
  registered_by: "registered_by",
  status: "status",
  created_at: "created_at",
  updated_at: "updated_at",
  // last_login_at: "last_login_at",
  // is_social_password:
};

module.exports = { KEYS };
