/**
 * Persistence layer contracts.
 * Mirrors happy-cli's persistence.ts interface for credentials, daemon state, settings.
 */

export interface Credentials {
  token: string;
  encryption: EncryptionConfig;
}

export type EncryptionConfig =
  | { type: "legacy"; secret: Uint8Array }
  | { type: "dataKey"; publicKey: Uint8Array; machineKey: Uint8Array };

export interface DaemonPersistentState {
  pid: number;
  httpPort: number;
  startedWithCliVersion: string;
}

export interface SettingsRepo {
  readCredentials(): Promise<Credentials | null>;
  saveCredentials(credentials: Credentials): Promise<void>;
  clearCredentials(): Promise<void>;
}

export interface CredentialsRepo {
  read(): Promise<Credentials | null>;
  save(credentials: Credentials): Promise<void>;
  clear(): Promise<void>;
}

export interface DaemonStateRepo {
  read(): Promise<DaemonPersistentState | null>;
  save(state: DaemonPersistentState): Promise<void>;
  clear(): Promise<void>;
}
