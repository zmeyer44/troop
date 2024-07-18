import "@/polyfill";
import { NextResponse } from "next/server";
import { prisma } from "@repo/database";
import { Participant, Aggregator, Point, G, Q } from "@repo/frost";
import { assert } from "console";

function mod(a: bigint, b: bigint): bigint {
  return ((a % b) + b) % b;
}
async function handler(req: Request) {
  // const session = await getSession();
  // if (!session?.user.id) {
  //   return new Response("Unauthorized", {
  //     status: 401,
  //   });
  // }
  console.log("TEst");

  const MessageToSign = "Hello World";

  const p1 = new Participant(1, 2, 3);
  const p2 = new Participant(2, 2, 3);
  const p3 = new Participant(3, 2, 3);
  // const p1 = new Participant(
  //   1,
  //   2,
  //   3,
  //   [
  //     10697727843008682695422963490409958575050938957311179952184549442907515966269n,
  //     883797129545160410719089483591327594593584582247025905938327641805509370774n,
  //   ],
  //   97900010219306304154988356708595297282222264743905442429891344217536824623913n,
  // );
  // const p2 = new Participant(
  //   2,
  //   2,
  //   3,
  //   [
  //     95925016053766414002488057463055430107590601453972505341596117275675548595597n,
  //     48129082246332732847028200104262947424954370337171362951251668239659694915511n,
  //   ],
  //   16774664440251969519223619637761940485260101451193910101064600218437533828132n,
  // );
  // const p3 = new Participant(
  //   3,
  //   2,
  //   3,
  //   [
  //     20802756546990554864145026256621489632364627779397153647899795091886774305027n,
  //     29999675428724291302690818801642947152711505673942591839165075243313550132773n,
  //   ],
  //   64860417878658902467898379959793130239586353086079128348876910579388754260602n,
  // );

  // Round 1.1, 1.2, 1.3, and 1.4
  p1.init_keygen();
  p2.init_keygen();
  p3.init_keygen();

  // Round 2.1
  p1.generate_shares();
  p2.generate_shares();
  p3.generate_shares();
  console.log("P1 shares", p1.shares);
  console.log("P2 shares", p2.shares);
  console.log("P3 shares", p3.shares);
  // Round 2.3
  p1.aggregate_shares([p2.shares![p1.index - 1], p3.shares![p1.index - 1]]);
  console.log("Calling aggregate_shares", [
    p1.shares![p2.index - 1],
    p3.shares![p2.index - 1],
  ]);
  p2.aggregate_shares([p1.shares![p2.index - 1], p3.shares![p2.index - 1]]);
  p3.aggregate_shares([p1.shares![p3.index - 1], p2.shares![p3.index - 1]]);

  // Round 2.4
  p1.derive_public_key([
    p2.coefficient_commitments![0],
    p3.coefficient_commitments![0],
  ]);
  p2.derive_public_key([
    p1.coefficient_commitments![0],
    p3.coefficient_commitments![0],
  ]);
  p3.derive_public_key([
    p1.coefficient_commitments![0],
    p2.coefficient_commitments![0],
  ]);

  const pk1 = p1.public_key!;

  const pk2 = p2.public_key!;
  const pk3 = p3.public_key!;
  console.log("Public Keys:", {
    pk1: { x: pk1.x!.toString(), y: pk1.y!.toString() },
    pk2: { x: pk2.x!.toString(), y: pk2.y!.toString() },
    pk3: { x: pk3.x!.toString(), y: pk3.y!.toString() },
  });
  assert(pk1.equals(pk2));
  assert(pk1.equals(pk3));

  p1.derive_group_commitments([
    p2.coefficient_commitments!,
    p3.coefficient_commitments!,
  ]);
  p2.derive_group_commitments([
    p1.coefficient_commitments!,
    p3.coefficient_commitments!,
  ]);
  p3.derive_group_commitments([
    p1.coefficient_commitments!,
    p2.coefficient_commitments!,
  ]);
  const group_commitments1 = p1.group_commitments;
  const group_commitments2 = p2.group_commitments;
  const group_commitments3 = p3.group_commitments;

  const proofOfKnowledge =
    p1.verify_proof_of_knowledge(
      p2.proof_of_knowledge!,
      p2.coefficient_commitments![0],
      2,
    ) &&
    p1.verify_proof_of_knowledge(
      p3.proof_of_knowledge!,
      p3.coefficient_commitments![0],
      3,
    ) &&
    p2.verify_proof_of_knowledge(
      p1.proof_of_knowledge!,
      p1.coefficient_commitments![0],
      1,
    ) &&
    p2.verify_proof_of_knowledge(
      p3.proof_of_knowledge!,
      p3.coefficient_commitments![0],
      3,
    ) &&
    p3.verify_proof_of_knowledge(
      p1.proof_of_knowledge!,
      p1.coefficient_commitments![0],
      1,
    ) &&
    p3.verify_proof_of_knowledge(
      p2.proof_of_knowledge!,
      p2.coefficient_commitments![0],
      2,
    );
  const verifyShare =
    p1.verify_share(p2.shares![p1.index - 1], p2.coefficient_commitments!, 2) &&
    p1.verify_share(p3.shares![p1.index - 1], p3.coefficient_commitments!, 2) &&
    p2.verify_share(p1.shares![p2.index - 1], p1.coefficient_commitments!, 2) &&
    p2.verify_share(p3.shares![p2.index - 1], p3.coefficient_commitments!, 2) &&
    p3.verify_share(p1.shares![p3.index - 1], p1.coefficient_commitments!, 2) &&
    p3.verify_share(p2.shares![p3.index - 1], p2.coefficient_commitments!, 2);

  // Reconstruct secret
  const l1_2 = p1._lagrange_coefficient([2]);
  const l2_1 = p2._lagrange_coefficient([1]);

  const secret_l1_2_l2_1 =
    (p1.aggregate_share! * l1_2 + p2.aggregate_share! * l2_1) % Q;

  const l1_3 = p1._lagrange_coefficient([3]);
  const l3_1 = p3._lagrange_coefficient([1]);

  const secret_l1_3_l3_1 =
    (p1.aggregate_share! * l1_3 + p3.aggregate_share! * l3_1) % Q;

  const l2_3 = p2._lagrange_coefficient([3]);
  const l3_2 = p3._lagrange_coefficient([2]);

  const secret_l2_3_l3_2 =
    (p2.aggregate_share! * l2_3 + p3.aggregate_share! * l3_2) % Q;

  const l1 = p1._lagrange_coefficient([2, 3]);
  const l2 = p2._lagrange_coefficient([1, 3]);
  const l3 = p3._lagrange_coefficient([1, 2]);
  const secret_l1_l2_l3 =
    (p1.aggregate_share! * l1 +
      p2.aggregate_share! * l2 +
      p3.aggregate_share! * l3) %
    Q;

  const reconstructSecret =
    G.multiply(secret_l1_2_l2_1).x === pk1.x &&
    G.multiply(secret_l1_2_l2_1).y === pk1.y &&
    G.multiply(secret_l1_3_l3_1).x === pk1.x &&
    G.multiply(secret_l1_3_l3_1).y === pk1.y &&
    G.multiply(secret_l2_3_l3_2).x === pk1.x &&
    G.multiply(secret_l2_3_l3_2).y === pk1.y &&
    G.multiply(secret_l1_l2_l3).x === pk1.x &&
    G.multiply(secret_l1_l2_l3).y === pk1.y;

  // Test Sign
  const pk = p1.public_key!;

  // NonceGen
  p1.generate_nonce_pair();
  p2.generate_nonce_pair();
  p3.generate_nonce_pair();
  const msg = Buffer.from("Test");
  const participant_indexes = [1, 2];
  console.log("INPUTS", [p1.nonce_commitment_pair!, p2.nonce_commitment_pair!]);
  const agg = new Aggregator(
    pk,
    msg,
    [p1.nonce_commitment_pair!, p2.nonce_commitment_pair!],
    participant_indexes,
  );

  const [message, nonce_commitment_pairs] = agg.signing_inputs();
  console.log("Signing message:", message.toString("hex"));
  console.log(
    "Nonce commitment pairs:",
    nonce_commitment_pairs.map((pair) => pair.map((p) => p.toString())),
  );
  const s1 = p1.sign(message, nonce_commitment_pairs, participant_indexes);
  const s2 = p2.sign(message, nonce_commitment_pairs, participant_indexes);
  console.log("s1:", s1.toString());
  console.log("s2:", s2.toString());
  // σ = (R, z)
  const sig = agg.signature([s1, s2]);
  console.log("Full signature (hex):", sig.toString("hex"));
  // Assuming sig is a hex string of length 128 (64 bytes)
  const nonce_commitment = Point.xonly_deserialize(sig.slice(0, 32));
  console.log("Deserialized nonce commitment:", nonce_commitment.toString());
  const z = BigInt(`0x${sig.slice(32).toString("hex")}`);
  console.log("Parsed z:", z.toString());

  // verify
  // c = H_2(R, Y, m)
  const challenge_hash = Aggregator.challenge_hash(nonce_commitment, pk, msg);
  console.log("Challenge hash:", challenge_hash.toString());

  // Negate Y if Y.y is odd
  let pk_to_use = pk;
  if (pk.y! % 2n !== 0n) {
    pk_to_use = pk.negate();
  }
  console.log("Public key used for verification:", pk_to_use.toString());

  // R ≟ g^z * Y^-c
  const left_side = nonce_commitment;
  const right_side = G.multiply(z).add(pk_to_use.multiply(Q - challenge_hash));
  console.log("Left side:", left_side.toString());
  console.log("Right side:", right_side.toString());
  const normalized_left = left_side.normalize();
  const normalized_right = right_side.normalize();

  console.log(
    "Normalized Left: X:",
    normalized_left.x?.toString(16).padStart(64, "0"),
  );
  console.log(
    "Normalized Left: Y:",
    normalized_left.y?.toString(16).padStart(64, "0"),
  );
  console.log(
    "Normalized Right: X:",
    normalized_right.x?.toString(16).padStart(64, "0"),
  );
  console.log(
    "Normalized Right: Y:",
    normalized_right.y?.toString(16).padStart(64, "0"),
  );

  const points_are_equal = normalized_left.equals(normalized_right);
  console.log("Points are equal:", points_are_equal);

  return NextResponse.json({
    proofOfKnowledge,
    verifyShare,
    reconstructSecret,
    match: left_side.x === right_side.x && left_side.y === right_side.y,
  });
}

export { handler as GET };
