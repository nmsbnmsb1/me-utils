export declare const TimeUtils: {
    timeout(time?: number): Promise<unknown>;
    sleep(time: number): Promise<void>;
    datetime(date: Date | string, format: string): string;
    ms(time: any): string | number;
};
