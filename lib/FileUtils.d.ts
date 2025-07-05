import type fs from 'node:fs';
export declare const FileUtils: {
    getFileType(p: string, resolveSymlink?: boolean): Promise<"not-exist" | "symlink" | "symlink-not-exist" | "symlink-file" | "symlink-directory" | "symlink-socket" | "symlink-fifo" | "symlink-character-device" | "symlink-block-device" | "symlink-unknown" | "file" | "directory" | "socket" | "fifo" | "character-device" | "block-device" | "unknown">;
    isSymLink(p: string): Promise<boolean | null>;
    isFile(p: string, resolveSymlink?: boolean): Promise<boolean | null>;
    isDirectory(p: string, resolveSymlink?: boolean): Promise<boolean | null>;
    isExist(p: string, resolveSymlink?: boolean): Promise<boolean>;
    chmod(p: string, mode: string | number): Promise<boolean>;
    mkdir(p: string, mode?: string | number): Promise<boolean>;
    getdirFiles(p: string, prefix?: string, ignores?: any, maxDepth?: number, depth?: number): Promise<string[]>;
    getCharCodeLength(charCode: number): 1 | 2 | 3 | 4;
    getPathNameLength(pathName: string): number;
    truncatePathName(fileName: string, maxLength?: number): string;
    rm(p: string, rmEmptyDirOnly?: boolean): Promise<boolean>;
    rename(src: string, dest: string, existsPolicy: "replace" | "rename" | "raiseExecption" | "mergeReplace" | "mergeRename" | "mergeRaiseExecption", { srcType, destType }?: {
        srcType: any;
        destType: any;
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
    }): Promise<string>;
    readJSONFile(p: string, options?: {
        encoding?: null;
        flag?: string;
    }): Promise<any>;
};
