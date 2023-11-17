const userMap = new Map();

const setUser = function (id, user) {
  userMap.set(id, user);
};

const getUser = function (id) {
  return userMap.get(id);
};

const deleteUser = function (id) {
  userMap.delete(id);
};

module.exports = {
  setUser,
  getUser,
  deleteUser
};
