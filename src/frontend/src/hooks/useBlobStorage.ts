import { HttpAgent } from "@icp-sdk/core/agent";
import { useRef } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";
import { useInternetIdentity } from "./useInternetIdentity";

let configCache: {
  storageGatewayUrl: string;
  bucketName: string;
  backendCanisterId: string;
  projectId: string;
} | null = null;

const GATEWAY_VERSION = "v1";

export function getBlobUrl(
  blobId: string,
  storageGatewayUrl: string,
  backendCanisterId: string,
  projectId: string,
): string {
  return `${storageGatewayUrl}/${GATEWAY_VERSION}/blob/?blob_hash=${encodeURIComponent(blobId)}&owner_id=${encodeURIComponent(backendCanisterId)}&project_id=${encodeURIComponent(projectId)}`;
}

export function useBlobStorage() {
  const { identity } = useInternetIdentity();
  const clientRef = useRef<StorageClient | null>(null);

  const getClient = async (): Promise<{
    client: StorageClient;
    storageGatewayUrl: string;
    backendCanisterId: string;
    projectId: string;
  }> => {
    if (!configCache) {
      const config = await loadConfig();
      configCache = {
        storageGatewayUrl:
          config.storage_gateway_url ?? "https://blob.caffeine.ai",
        bucketName: config.bucket_name ?? "default-bucket",
        backendCanisterId: config.backend_canister_id,
        projectId: config.project_id ?? "0000000-0000-0000-0000-00000000000",
      };
    }
    const cfg = configCache;
    if (!clientRef.current) {
      const agent = new HttpAgent({
        identity: identity ?? undefined,
        host: undefined,
      });
      clientRef.current = new StorageClient(
        cfg.bucketName,
        cfg.storageGatewayUrl,
        cfg.backendCanisterId,
        cfg.projectId,
        agent,
      );
    }
    return {
      client: clientRef.current,
      storageGatewayUrl: cfg.storageGatewayUrl,
      backendCanisterId: cfg.backendCanisterId,
      projectId: cfg.projectId,
    };
  };

  const uploadBlob = async (file: File): Promise<string> => {
    const { client } = await getClient();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const { hash } = await client.putFile(bytes, undefined);
    return hash;
  };

  const resolveBlobUrl = async (blobId: string): Promise<string> => {
    const { storageGatewayUrl, backendCanisterId, projectId } =
      await getClient();
    return getBlobUrl(blobId, storageGatewayUrl, backendCanisterId, projectId);
  };

  return { uploadBlob, resolveBlobUrl };
}
