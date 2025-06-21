import { ThoughtExportProvider, SemanticCompressionOptions } from '../../contracts/thoughtExportProvider';
import { StorageAdapter } from '../../contracts/storageAdapter';
export declare class PortabilityService implements ThoughtExportProvider {
    private storage;
    constructor(storage: StorageAdapter);
    /**
     * Export all data from the storage adapter with optional semantic compression
     */
    exportData(options?: any): Promise<any>;
    /**
     * Apply semantic compression based on provided options
     * Stub implementation for CCE integration in future phases
     */
    private applySemanticCompression;
    exportThought(thoughtId: string, options?: SemanticCompressionOptions): Promise<any>;
    exportCluster(clusterId: string, options?: SemanticCompressionOptions): Promise<any>;
    importData(jsonData: any): Promise<void>;
}
//# sourceMappingURL=portabilityService.d.ts.map