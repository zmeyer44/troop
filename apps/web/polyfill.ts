// @ts-ignore
BigInt.prototype["toJSON"] = function () {
  return Number(this);
};
