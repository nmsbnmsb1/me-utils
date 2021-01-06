export declare class TimeUtils {
    static timeout(time?: number): Promise<unknown>;
    static sleep(time: number): Promise<void>;
    static datetime(date: Date | string, format: string): string;
    static ms(time: any): string | number;
}
