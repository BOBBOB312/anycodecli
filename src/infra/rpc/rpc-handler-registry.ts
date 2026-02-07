/**
 * RPC handler registry contract.
 * Mirrors happy-cli's RpcHandlerManager interface.
 */

export type RpcHandler<TReq = unknown, TRes = unknown> = (data: TReq) => TRes | Promise<TRes>;

export interface RpcHandlerConfig {
  scopePrefix: string;
  encryptionKey: Uint8Array;
  encryptionVariant: "legacy" | "dataKey";
  logger?: (message: string, data?: unknown) => void;
}

export interface RpcHandlerRegistry {
  registerHandler<TReq, TRes>(method: string, handler: RpcHandler<TReq, TRes>): void;
  handleRequest(request: { method: string; params: string }): Promise<string>;
  hasHandler(method: string): boolean;
  getHandlerCount(): number;
  clearHandlers(): void;
}
