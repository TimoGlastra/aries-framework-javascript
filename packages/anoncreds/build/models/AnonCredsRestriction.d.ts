export interface AnonCredsRestrictionOptions {
    schemaId?: string;
    schemaIssuerDid?: string;
    schemaIssuerId?: string;
    schemaName?: string;
    schemaVersion?: string;
    issuerDid?: string;
    issuerId?: string;
    credentialDefinitionId?: string;
    attributeMarkers?: Record<string, true>;
    attributeValues?: Record<string, string>;
}
export declare class AnonCredsRestriction {
    constructor(options: AnonCredsRestrictionOptions);
    schemaId?: string;
    schemaIssuerDid?: string;
    schemaIssuerId?: string;
    schemaName?: string;
    schemaVersion?: string;
    issuerDid?: string;
    issuerId?: string;
    credentialDefinitionId?: string;
    attributeMarkers: Record<string, boolean>;
    attributeValues: Record<string, string>;
}
/**
 * Decorator that transforms attribute values and attribute markers.
 *
 * It will transform between the following JSON structure:
 * ```json
 * {
 *  "attr::test_prop::value": "test_value"
 *  "attr::test_prop::marker": "1
 * }
 * ```
 *
 * And the following AnonCredsRestriction:
 * ```json
 * {
 *  "attributeValues": {
 *    "test_prop": "test_value"
 *  },
 *  "attributeMarkers": {
 *   "test_prop": true
 *  }
 * }
 * ```
 *
 * @example
 * class Example {
 *   AttributeFilterTransformer()
 *   public restrictions!: AnonCredsRestriction[]
 * }
 */
export declare function AnonCredsRestrictionTransformer(): PropertyDecorator;
