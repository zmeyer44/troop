import { P, Q, G_x, G_y } from "./constants";

export class Point {
  x: bigint | null;
  y: bigint | null;

  constructor(x: bigint | null = null, y: bigint | null = null) {
    this.x = x;
    this.y = y;
  }

  static sec_deserialize(hex_public_key: string): Point {
    try {
      const hex_bytes = Buffer.from(hex_public_key, "hex");
      if (hex_bytes.length !== 33) {
        throw new Error(
          "Input must be exactly 33 bytes long for SEC 1 compressed format.",
        );
      }
      const is_even = hex_bytes[0] === 0x02;
      const x_bytes = hex_bytes.slice(1);
      const x = BigInt(`0x${x_bytes.toString("hex")}`);
      const y_squared = (x ** 3n + 7n) % P;
      let y = this.modPow(y_squared, (P + 1n) / 4n, P);

      if (y % 2n === 0n) {
        y = is_even ? y : (P - y) % P;
      } else {
        y = is_even ? (P - y) % P : y;
      }

      return new Point(x, y);
    } catch (e) {
      throw new Error(
        "Invalid hex input or unable to compute point from x-coordinate.",
      );
    }
  }

  sec_serialize(): Buffer {
    if (this.x === null || this.y === null) {
      throw new Error("Cannot serialize the point at infinity.");
    }

    const prefix =
      this.y % 2n === 0n ? Buffer.from([0x02]) : Buffer.from([0x03]);
    const x_bytes = Buffer.alloc(32);
    x_bytes.writeBigUInt64BE(this.x >> 64n, 0);
    x_bytes.writeBigUInt64BE(this.x & ((1n << 64n) - 1n), 8);
    return Buffer.concat([prefix, x_bytes]);
  }

  static xonly_deserialize(hex_public_key: string): Point {
    try {
      const hex_bytes = Buffer.from(hex_public_key, "hex");
      if (hex_bytes.length !== 32) {
        throw new Error(
          "Input must be exactly 32 bytes long for x-only format.",
        );
      }
      const x = BigInt(`0x${hex_bytes.toString("hex")}`);
      const y_squared = (x ** 3n + 7n) % P;
      let y = this.modPow(y_squared, (P + 1n) / 4n, P);

      if (y % 2n !== 0n) {
        y = (P - y) % P;
      }

      return new Point(x, y);
    } catch (e) {
      throw new Error(
        "Invalid hex input or unable to compute point from x-coordinate.",
      );
    }
  }

  xonly_serialize(): Buffer {
    if (this.x === null) {
      throw new Error("The x-coordinate is not finite.");
    }

    const x_bytes = Buffer.alloc(32);
    x_bytes.writeBigUInt64BE(this.x >> 64n, 0);
    x_bytes.writeBigUInt64BE(this.x & ((1n << 64n) - 1n), 8);
    return x_bytes;
  }

  is_zero(): boolean {
    return this.x === null || this.y === null;
  }

  equals(other: Point): boolean {
    return this.x === other.x && this.y === other.y;
  }

  negate(): Point {
    if (this.x === null || this.y === null) {
      return this;
    }
    return new Point(this.x, P - this.y);
  }

  private _dbl(): Point {
    if (this.x === null || this.y === null || this.y === 0n) {
      return new Point();
    }

    const x = this.x;
    const y = this.y;
    const s = (3n * x * x * Point.modInverse(2n * y, P)) % P;
    const sum_x = (s * s - 2n * x) % P;
    const sum_y = (s * (x - sum_x) - y) % P;

    return new Point(sum_x, sum_y);
  }

  add(other: Point): Point {
    if (this.equals(other)) {
      return this._dbl();
    }
    if (this.is_zero()) {
      return other;
    }
    if (other.is_zero()) {
      return this;
    }
    if (this.x === other.x && this.y !== other.y) {
      return new Point();
    }

    const s =
      ((other.y! - this.y!) * Point.modInverse(other.x! - this.x!, P)) % P;
    const sum_x = (s * s - this.x! - other.x!) % P;
    const sum_y = (s * (this.x! - sum_x) - this.y!) % P;

    return new Point(sum_x, sum_y);
  }

  subtract(other: Point): Point {
    return this.add(other.negate());
  }

  multiply(scalar: bigint): Point {
    scalar = scalar % Q;
    let p: Point = this;
    let r = new Point();
    let i = 1n;

    while (i <= scalar) {
      if (i & scalar) {
        r = r.add(p);
      }
      p = p._dbl();
      i <<= 1n;
    }

    return r;
  }

  toString(): string {
    if (this.is_zero()) {
      return "0";
    }
    return `X: 0x${this.x!.toString(16)}\nY: 0x${this.y!.toString(16)}`;
  }

  static modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    while (exponent > 0n) {
      if (exponent % 2n === 1n) {
        result = (result * base) % modulus;
      }
      exponent = exponent >> 1n;
      base = (base * base) % modulus;
    }
    return result;
  }

  static modInverse(a: bigint, m: bigint): bigint {
    let [old_r, r] = [a, m];
    let [old_s, s] = [1n, 0n];
    let [old_t, t] = [0n, 1n];

    while (r !== 0n) {
      const quotient = old_r / r;
      [old_r, r] = [r, old_r - quotient * r];
      [old_s, s] = [s, old_s - quotient * s];
      [old_t, t] = [t, old_t - quotient * t];
    }

    if (old_r > 1n) {
      throw new Error("Modular inverse does not exist");
    }

    if (old_s < 0n) {
      old_s += m;
    }

    return old_s;
  }
}

export const G: Point = new Point(G_x, G_y);
