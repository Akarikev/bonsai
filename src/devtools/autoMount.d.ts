declare global {
    interface Window {
        __bonsaiDevtoolsMounted?: boolean;
    }
}
export declare function mountDevtools(): Promise<void>;
