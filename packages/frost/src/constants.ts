//  The prime modulus of the field
const P = BigInt(2 ** 256 - 2 ** 32 - 977);

// The order of the curve
const Q =
  BigInt(0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141);

// X-coordinate of the generator point G
const G_x =
  BigInt(0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798);

// Y-coordinate of the generator point G
const G_y =
  BigInt(0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8);

export { P, Q, G_x, G_y };
