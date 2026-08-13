/**
 * net-snmp は型定義を同梱していないので、この API で使う分だけを宣言する。
 * 実装は node_modules/net-snmp/index.js を参照。
 */
declare module 'net-snmp' {
  export interface Varbind {
    oid: string;
    type: number;
    value: Buffer | number | bigint | string;
  }

  export interface SessionOptions {
    port?: number;
    retries?: number;
    /** 1 回あたりの待ち時間（ミリ秒） */
    timeout?: number;
    transport?: 'udp4' | 'udp6';
    version?: number;
  }

  export interface Session {
    get(
      oids: string[],
      callback: (error: Error | null, varbinds: Varbind[]) => void,
    ): void;

    subtree(
      oid: string,
      maxRepetitions: number,
      feedCallback: (varbinds: Varbind[]) => boolean | void,
      doneCallback: (error: Error | null) => void,
    ): void;

    close(): void;
    on(event: 'error' | 'close', listener: (error: Error) => void): void;
  }

  export const Version1: number;
  export const Version2c: number;

  export const ObjectType: {
    Integer: number;
    OctetString: number;
    Null: number;
    OID: number;
    IpAddress: number;
    Counter: number;
    Gauge: number;
    TimeTicks: number;
    Counter64: number;
    NoSuchObject: number;
    NoSuchInstance: number;
    EndOfMibView: number;
  };

  export function createSession(
    target: string,
    community: string,
    options?: SessionOptions,
  ): Session;

  /** v2c で noSuchObject / noSuchInstance / endOfMibView が返ったか */
  export function isVarbindError(varbind: Varbind): boolean;

  /** 応答そのものが返らなかった */
  export class RequestTimedOutError extends Error {}

  /** 応答は返ったが errorStatus が立っていた（v1 の noSuchName など） */
  export class RequestFailedError extends Error {
    status: number;
  }
}
