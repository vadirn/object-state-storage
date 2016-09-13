const isObject = item => typeof item === 'object' && item !== null && !Array.isArray(item);

// clones arrays and everything else
const clone = (item) => JSON.parse(JSON.stringify(item));

const merge = (to, from) => {
  const result = clone(to);
  const changes = clone(from);

  Object.keys(changes).forEach((key) => {
    const value = changes[key];

    if (isObject(value) && isObject(result[key])) {
      // go deeper if both sides are objects
      result[key] = merge(result[key], changes[key]);
    } else {
      // can set value of the result
      result[key] = changes[key];
    }
  });

  return result;
};

module.exports = {
  merge,
  clone,
};
