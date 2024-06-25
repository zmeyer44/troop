global.crypto = require("crypto");
import NDK, {
  NDKEvent,
  NDKNostrRpc,
  NDKKind,
  NDKUser,
  NDKPrivateKeySigner,
  NDKRpcRequest,
} from "@nostr-dev-kit/ndk";
import Fastify, { type FastifyInstance } from "fastify";
import FastifyFormBody from "@fastify/formbody";
import FastifyView from "@fastify/view";
import Handlebars from "handlebars";
import createDebug from "debug";
import { getTag, decryptData, encryptData } from "@repo/utils";
import { z } from "zod";
import ping from "./functions/ping";
import { nip19 } from "nostr-tools";
import { prisma } from "@repo/database";

export const RequestEventSchema = z.object({
  id: z.string(),
  method: z.string(),
  params: z.string().array(),
});

const debug = createDebug("nsecbunker:admin");
const allowNewKeys = true;
export interface DomainConfig {
  nip05: string;
  nip89?: {
    profile: Record<string, string>;
    operator?: string;
    relays: string[];
  };
  defaultProfile?: Record<string, string>;
}
export type Config = {
  nostr: {
    relays: string[];
  };
  authPort?: number;
  database?: string;
  logs: string;
  keys: Record<string, any>;
  baseUrl?: string;
  verbose: boolean;
  domains?: Record<string, DomainConfig>;
};
export const config = {
  nostr: {
    relays: ["wss://relay.damus.io", "wss://relay.nsecbunker.com"],
  },
  authPort: (process.env.PORT && parseInt(process.env.PORT)) || 8081,
  baseUrl: "https://troop.pub",
  logs: "./nsecbunker.log",
  keys: {},
  verbose: false,
};
export class Bunker {
  private config: Config;
  private ndk: NDK;
  private signerUser?: NDKUser;
  private keys: string[];
  public fastify: FastifyInstance;
  readonly rpc: NDKNostrRpc;

  constructor(config: Config) {
    this.config = config;
    this.keys = [];
    this.fastify = Fastify({ logger: true });
    this.fastify.register(FastifyFormBody);
    this.ndk = new NDK({
      explicitRelayUrls: config.nostr.relays,
      signer: new NDKPrivateKeySigner(process.env.BUNKER_PRIVATE_KEY),
    });

    this.ndk.signer?.user().then((user: NDKUser) => {
      this.ndk.activeUser = user;
      this.signerUser = user;
      this.connect();
    });

    this.ndk.pool.on("relay:connect", (r) =>
      console.log(`✅ Connected to ${r.url}`),
    );
    this.ndk.pool.on("notice", (n, r) => {
      console.log(`👀 Notice from ${r}`, n);
    });

    this.ndk.pool.on("relay:disconnect", (r) => {
      console.log(`🚫 Disconnected from ${r.url}`);
    });

    this.rpc = new NDKNostrRpc(this.ndk, this.ndk.signer!, debug);
  }

  private async connect() {
    console.log("Connect called");
    this.ndk.pool.on("relay:connect", () => console.log("✅ nsecBunker ready"));
    this.ndk.pool.on("relay:disconnect", () => console.log("❌ disconnected"));
    await this.startKeys();

    this.ndk
      .connect(5000)
      .then(() => {
        // listen to keys being managed
        this.rpc
          .subscribe({
            kinds: [NDKKind.NostrConnect],
            ["#p"]: [this.signerUser!.pubkey, ...this.keys],
          })
          .then((sub) => sub.on("event", (req) => this.handleEvent(req)));
        console.log(
          "✅ nsecBunker listening for ",
          this.keys.map((k) => k),
          this.signerUser!.pubkey,
        );
        this.rpc.on("request", (req) => this.handleRequest(req));
        // this.rpc.on("event", (req) => this.handleRequest(req));
      })
      .then(() => console.log("Subbed"))
      .catch((err) => {
        console.log("❌ admin connection failed");
        console.log(err);
      });
  }

  async addSubscription(pubkey: string) {
    console.log("addSubscription called", pubkey);
    this.ndk
      .connect(5000)
      .then(() => {
        // connect for whitelisted admins
        this.rpc
          .subscribe({
            kinds: [NDKKind.NostrConnect, 24134 as number],
            ["#p"]: [pubkey],
          })
          .then((sub) => sub.on("event", (req) => this.handleEvent(req)));
        console.log("✅ nsecBunker listening for ", pubkey);
        this.rpc.on("request", (req) => this.handleRequest(req));
        // this.rpc.on("event", (req) => this.handleRequest(req));
      })
      .then(() => console.log("Subbed"))
      .catch((err) => {
        console.log("❌ admin connection failed");
        console.log(err);
      });
  }

  private async handleEvent(event: NDKEvent) {
    console.log("Event", event.rawEvent());
    const targetPubkey = getTag(event.tags, "p", 1) as string;
    const sk = await this.getKey(targetPubkey);
    if (!sk) return;
    await event.decrypt(event.author, new NDKPrivateKeySigner(sk));
    console.log("Event Post", event.rawEvent());
    const request = RequestEventSchema.parse(JSON.parse(event.content));
    console.log("request", request);
    if (request.method === "create_account") return;
    this.handleRequest({ ...request, pubkey: event.pubkey, event });
  }

  private async handleRequest(req: NDKRpcRequest) {
    console.log("handleRequest method", req.method);
    try {
      await this.validateRequest(req);
      switch (req.method) {
        // case 'get_keys': await this.reqGetKeys(req); break;
        // case 'get_key_users': await this.reqGetKeyUsers(req); break;
        // case 'rename_key_user': await renameKeyUser(this, req); break;
        // case 'get_key_tokens': await this.reqGetKeyTokens(req); break;
        // case "revoke_user":
        //   await revokeUser(this.rpc, req);
        //   break;
        // case "create_account":
        //   await createAccount(this, req);
        //   break;
        // case "connect":
        //   await connect(this.rpc, req);
        //   break;
        // case "sign_event":
        //   await signEvent(this, req);
        //   break;
        // case "nip04_decrypt":
        //   await nip04Decrypt(this, req);
        //   break;
        // case "nip04_decrypt":
        //   await nip04Encrypt(this, req);
        //   break;
        case "ping":
          await ping(this.rpc, req);
          break;
        // case 'unlock_key': await unlockKey(this, req); break;
        // case "create_new_token":
        //   await createNewToken(this.rpc, req);
        //   break;
        default:
          console.log(`Unknown method ${req.method}`);
          return this.rpc.sendResponse(
            req.id,
            req.pubkey,
            JSON.stringify(["error", `Unknown method ${req.method}`]),
            NDKKind.NostrConnect,
          );
      }
    } catch (err: any) {
      debug(
        `Error handling request ${req.method}: ${err?.message ?? err}`,
        req.params,
      );
      return this.rpc.sendResponse(
        req.id,
        req.pubkey,
        "error",
        NDKKind.NostrConnect,
        err?.message,
      );
    }
  }

  private async validateRequest(req: NDKRpcRequest): Promise<void> {
    console.log("validateRequest");
    // if this request is of type create_account, allow it
    // TODO: require some POW to prevent spam
    if (req.method === "create_account" && allowNewKeys) {
      console.log(`allowing create_account request`);
      return;
    }
  }

  async startWebAuth() {
    if (!this.config.authPort) return;
    this.fastify.register(FastifyView, {
      engine: {
        handlebars: Handlebars,
      },
    });

    this.fastify.listen({ port: this.config.authPort, host: "0.0.0.0" });
    // this.fastify.get("/requests/:id", authorizeRequestWebHandler);
    // this.fastify.post("/requests/:id", processRequestWebHandler);
    // this.fastify.post("/register/:id", processRegistrationWebHandler);
    // this.fastify.get("/auth", processAuthWebHandler);
    // this.fastify.post("/create-account", processCreateAccountWebHandler);
  }

  async startKeys() {
    const keys = await prisma.authUser.findMany({
      where: {
        encryptedNsec: {
          not: null,
        },
      },
      select: {
        pubkey: true,
      },
    });
    console.log("🔑 Starting keys", keys);

    this.keys = keys.map((k) => k.pubkey);

    return this.keys;
  }

  async getKey(targetPubkey: string) {
    const key = await prisma.authUser.findFirst({
      where: {
        pubkey: targetPubkey,
      },
      select: {
        encryptedNsec: true,
      },
    });
    if (key?.encryptedNsec) {
      const [data, iv] = key.encryptedNsec.split("+");
      return nip19
        .decode(
          decryptData(iv!, data!, process.env.NSEC_ENCRYPTION_KEY as string),
        )
        .data.toString();
    }
    return;
  }

  async start() {
    await this.ndk.connect(5000);
    await this.startWebAuth();
    console.log("✅ nsecBunker ready to serve requests.");
  }
}
