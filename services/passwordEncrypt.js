const bcrypt = require("bcrypt");
let salt = undefined;

const getEncryptedPassword = async (password) => {
  return new Promise(async (res) => {
    if (salt === undefined) salt = await bcrypt.genSalt(10);
    res(await bcrypt.hash(password, salt));
  });
};

module.exports = { getEncryptedPassword };
