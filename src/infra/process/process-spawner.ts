import { spawn } from "node:child_process";

export interface SpawnedProcess {
  kill(signal?: NodeJS.Signals | number): boolean;
  on(event: "error", listener: (error: Error) => void): this;
  on(event: "exit", listener: (code: number | null, signal: NodeJS.Signals | null) => void): this;
}

export interface ProcessSpawner {
  spawn(command: string, args: string[], options: { stdio: "inherit"; env: NodeJS.ProcessEnv }): SpawnedProcess;
}

export class NodeProcessSpawner implements ProcessSpawner {
  spawn(command: string, args: string[], options: { stdio: "inherit"; env: NodeJS.ProcessEnv }): SpawnedProcess {
    return spawn(command, args, options);
  }
}
