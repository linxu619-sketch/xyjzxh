// node:sqlite 为 Node 实验性内置模块,@types/node 暂未提供类型声明。
// 此处提供本项目使用到的最小类型,消除 TS2307 并保证生产构建通过。
declare module "node:sqlite" {
  export interface StatementSync {
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
    get(...params: unknown[]): any;
    all(...params: unknown[]): any[];
  }
  export class DatabaseSync {
    constructor(path: string, options?: { readOnly?: boolean; open?: boolean } | undefined);
    prepare(sql: string): StatementSync;
    exec(sql: string): void;
    close(): void;
  }
}
