const bcrypt = require("bcrypt");
let salt = undefined;

const getEncryptedPassword = async (password) => {
  return new Promise(async (res, rej) => {
    if (salt === undefined) salt = await bcrypt.genSalt(10);
    if (!password) rej("password is not provided");
    else res(await bcrypt.hash(password, salt));
  });
};

module.exports = { getEncryptedPassword };
