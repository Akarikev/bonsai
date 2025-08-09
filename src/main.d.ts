export declare const appStore: {
    readonly get: (path: string) => any;
    readonly set: (path: string, value: any) => Promise<boolean>;
    readonly subscribe: (path: string, cb: (value: any) => void) => () => void;
    readonly use: <T = any>(path: string) => T;
    readonly addMiddleware: (mw: import(".").Middleware<any> | ((next: (path: string, value: any) => any) => (path: string, value: any, prevValue?: any) => any)) => void;
};
