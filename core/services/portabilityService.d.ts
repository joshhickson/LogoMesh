import { ThoughtExportProvider, SemanticCompressionOptions } from '../../contracts/thoughtExportProvider';
import { StorageAdapter } from '../../contracts/storageAdapter';
export declare class PortabilityService implements ThoughtExportProvider {
    private storage;
    constructor(storage: StorageAdapter);
    exportData(options?: SemanticCompressionOptions): Promise<any>;
    exportThought(thoughtId: string, options?: SemanticCompressionOptions): Promise<any>;
    exportCluster(clusterId: string, options?: SemanticCompressionOptions): Promise<any>;
}
//# sourceMappingURL=portabilityService.d.ts.map