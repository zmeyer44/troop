import { NDKRpcRequest, NDKNostrRpc, NDKKind } from "@nostr-dev-kit/ndk";

export default function ping(rpc: NDKNostrRpc, req: NDKRpcRequest) {
  return rpc.sendResponse(req.id, req.pubkey, "pong", NDKKind.NostrConnect);
}
