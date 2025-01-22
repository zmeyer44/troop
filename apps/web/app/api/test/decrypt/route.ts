import "@/polyfill";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { Participant, SingleSigner, Aggregator, Point, G, Q } from "frost-ts";
import { assert } from "console";
import {
  getEventHash,
  verifyEvent,
  getPublicKey,
  generateSecretKey,
} from "nostr-tools";
import * as crypto from "crypto";
// import * as secp from "@noble/secp256k1";
import { getSharedSecret } from "@noble/secp256k1";

async function handler(req: Request) {
  const p1 = new Participant(1, 2, 3);
  //   const p2 = new Participant(2, 2, 3);
  //   const p3 = new Participant(3, 2, 3);
  console.log("Initial", p1);

  p1.initKeygen();
  const singlePubkey = p1.derivePublicKey([]);
  p1.generateShares();
  console.log("P1 shares", p1.shares);
  const rootKey = p1.coefficients![0];
  const pubkey = G.multiply(rootKey);
  const bunkerKey = p1.coefficients![0] + p1.coefficients![1] * 1n;
  const clientKey = p1.coefficients![0] + p1.coefficients![1] * 2n;
  const extraKey = p1.coefficients![0] + p1.coefficients![1] * 3n;
  const extraPubkey = G.multiply(
    p1.coefficients![0] + p1.coefficients![1] * 3n,
  );

  const message = "Hello world";
  const encryptedMessage = encryptMessage(
    message,
    extraKey.toString(16),
    pubkey.xonlySerialize().toString("hex"),
  );
  console.log("Encrypted message", encryptedMessage);
  const [ciphertext, ivBase64] = encryptedMessage.split("?iv=") as [
    string,
    string,
  ];
  const iv = Buffer.from(ivBase64, "base64");
  // const hash = crypto.createHash("sha256").update(ciphertext).digest();
  // const encryptedPoint = Point.xonlyDeserialize(hash);

  // const p1PartialDecryption = encryptedPoint
  //   .multiply(bunkerKey)
  //   .xonlySerialize();
  // const p2PartialDecryption = encryptedPoint
  //   .multiply(clientKey)
  //   .xonlySerialize();

  // const partialDecryptions = [p1PartialDecryption, p2PartialDecryption];
  // console.log("partialDecryptions", partialDecryptions);

  // const decryptedPoint = partialDecryptions.reduce(
  //   (acc, curr) => acc.add(Point.xonlyDeserialize(curr)),
  //   new Point(null, null),
  // );
  // console.log("decryptedPoint", decryptedPoint);
  const sharedPoint = extraPubkey.multiply(rootKey);
  console.log("sharedPoint", sharedPoint);
  const sharedPointAlt = singlePubkey.multiply(extraKey);
  console.log("sharedPointAlt", sharedPointAlt);
  const sharedPointFrost = getSharedSecretPoint([
    [getPartialSecret(bunkerKey, 1, [1, 2], extraPubkey), 1],
    [getPartialSecret(clientKey, 2, [1, 2], extraPubkey), 2],
  ]);
  console.log("sharedPointFrost", sharedPointFrost);

  const sharedSecret = crypto
    .createHash("sha256")
    .update(sharedPoint.xonlySerialize())
    .digest();
  console.log("sharedSecret", sharedSecret);
  const decryptedMessage = decryptWithSharedSecret(
    ciphertext,
    iv,
    sharedSecret,
  );

  return NextResponse.json({
    message,
    encryptedMessage,
    decryptedMessage,
  });
}
export { handler as GET };

function isValidHex(str: string): boolean {
  return /^[0-9A-Fa-f]+$/.test(str);
}

function getPartialSecret(
  sk: bigint,
  index: number,
  participants: number[],
  senderPubkey: Point,
) {
  const v = lagrangeCoefficient(participants, sk, index);
  return senderPubkey.multiply(sk).multiply(v);
}

function lagrangeCoefficient(
  participantIndexes: number[],
  x: bigint = 0n,
  participantIndex: number,
): bigint {
  if (new Set(participantIndexes).size !== participantIndexes.length) {
    throw new Error("Participant indexes must be unique.");
  }

  let numerator = 1n;
  let denominator = 1n;
  for (const index of participantIndexes) {
    if (index === participantIndex) {
      continue;
    }
    numerator = numerator * (x - BigInt(index));
    denominator = denominator * BigInt(participantIndex - index);
  }
  return (numerator * pow(denominator, Q - 2n, Q)) % Q;
}
function pow(base: bigint, exponent: bigint, modulus: bigint): bigint {
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
function decryptWithSharedSecret(
  ciphertext: string,
  iv: Buffer,
  sharedSecret: Buffer,
): string {
  const decipher = crypto.createDecipheriv("aes-256-cbc", sharedSecret, iv);
  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function encryptMessage(
  message: string,
  myPrivateKey: string,
  theirPubkey: string,
) {
  console.log("myPrivateKey:", myPrivateKey);
  console.log("theirPubkey:", theirPubkey);
  try {
    if (!isValidHex(myPrivateKey) || !isValidHex(theirPubkey)) {
      throw new Error("Invalid hex string in key");
    }

    const privateKeyBuffer = Buffer.from(myPrivateKey, "hex");
    const publicKeyBuffer = Buffer.from("02" + theirPubkey, "hex");

    console.log("privateKeyBuffer:", privateKeyBuffer.toString("hex"));
    console.log("publicKeyBuffer:", publicKeyBuffer.toString("hex"));

    let sharedPoint = getSharedSecret(privateKeyBuffer, publicKeyBuffer);
    console.log("Shared point:", sharedPoint.toString());

    let sharedX = sharedPoint.slice(1, 33);
    console.log("Shared X:", sharedX);
    let iv = crypto.randomFillSync(new Uint8Array(16));
    var cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(sharedX), iv);
    let encryptedMessage = cipher.update(message, "utf8", "base64");
    encryptedMessage += cipher.final("base64");
    let ivBase64 = Buffer.from(iv.buffer).toString("base64");

    return encryptedMessage + "?iv=" + ivBase64;
  } catch (e) {
    console.error(e);
    throw new Error("Unable to encrypt");
  }
}
// Function to decrypt a hashed message using a passphrase
// Function to decrypt a hashed message using a passphrase
export function decryptMessage(encryptedMessage: string, password: string) {
  try {
    const buffer = create32ByteBuffer(password);
    // Extract IV from the received message
    const [message, ivBase64] = encryptedMessage.split("?iv=");
    if (!message || !ivBase64) {
      return;
    }

    const iv = Buffer.from(ivBase64, "base64");
    const encryptedText = Buffer.from(message, "base64");
    const decipher = crypto.createDecipheriv("aes-256-cbc", buffer, iv);
    const decrypted = decipher.update(encryptedText);
    return Buffer.concat([decrypted, decipher.final()]).toString();
  } catch (e) {
    console.error("Error decrypting", e);
  }
}

function create32ByteBuffer(inputString: string) {
  const hash = crypto.createHash("sha256").update(inputString).digest("hex");
  const buffer = Buffer.from(hash, "hex");
  return buffer;
}

export function generateRandomString() {
  return crypto.randomBytes(32).toString("hex");
}

function getSharedSecretPoint(partialPoints: [Point, number][]) {
  const sumOfPartialPoints = partialPoints.reduce(
    (acc, curr) => acc.add(curr[0]),
    new Point(null, null),
  );
  return sumOfPartialPoints;
  const sumOfIndexes = partialPoints.reduce((acc, curr) => acc + curr[1], 0);
  const [point, index] = partialPoints[0]!;
  const computedPoint = point
    .multiply(BigInt(threshold))
    .subtract(sumOfPartialPoints);
  const multiplicationFactor = index / (sumOfIndexes - threshold * index);
  const sharedSecretPoint = point.add(
    computedPoint.multiply(BigInt(multiplicationFactor)),
  );
  return sharedSecretPoint;
}
