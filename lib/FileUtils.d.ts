import fs from 'node:fs';
export declare const fsPromisify: (fn: any, ...args: any) => any;
export declare const FileUtils: {
    isExist(p: string): Promise<boolean>;
    isFile(filePath: string): Promise<boolean>;
    isDirectory(dirPath: string): Promise<boolean>;
    chmod(p: fs.PathLike, mode: string | number): Promise<boolean>;
    mkdir(dir: string, mode?: string | number): Promise<boolean>;
    getdirFiles(dir: string, prefix?: string): Promise<string[]>;
    getCharCodeLength(charCode: number): 1 | 2 | 3 | 4;
    getPathNameLength(pathName: string): number;
    truncatePathName(fileName: string, maxLength?: number): string;
    unlink(p: string): Promise<boolean>;
    rmdir(p: string, reserve?: boolean): Promise<boolean>;
    rename(src: string, dest: string, existsPolicy: "replace" | "rename" | "raiseExecption" | "mergeReplace" | "mergeRename" | "mergeRaiseExecption", options?: {
        srcExists: boolean;
        destIsFile: boolean;
    }): Promise<string | undefined>;
    writeFile(p: string, data: any, options?: fs.WriteFileOptions): Promise<void>;
    writeJSONFile(p: string, data: any, jsonSpace?: number, options?: fs.WriteFileOptions): Promise<void>;
    readFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): Promise<any>;
    readTxtFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): Promise<any>;
    readJSONFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): Promise<any>;
};
