import fs from 'fs';
export declare class FileUtils {
    static isExist(dir: string): boolean;
    static isFile(filePath: string): boolean;
    static isDirectory(filePath: string): boolean;
    static chmod(p: fs.PathLike, mode: string | number): boolean;
    static mkdir(dir: string, mode?: string | number): boolean;
    static getdirFiles(dir: string, prefix?: string): any[];
    static rmdir(p: string, reserve?: any): Promise<unknown>;
    static rm(p: string, reserve?: any): Promise<unknown>;
    static writeFile(p: string, data: any, options?: fs.WriteFileOptions): void;
    static writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions): void;
    static readFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): Buffer<ArrayBufferLike>;
    static readTxtFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): string;
    static readJSONFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): any;
}
