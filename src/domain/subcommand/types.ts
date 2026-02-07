export interface SubcommandGateway {
  run(args: string[]): Promise<number>;
}
