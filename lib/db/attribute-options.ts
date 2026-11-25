import { StorageDiagnostic } from './migration-graph';

function denied(): never { throw new StorageDiagnostic('incompatible-schema'); }
const maxVersion = BigInt('18446744073709551615');

// PostgreSQL's internal pg_attver is physical tuple-version safety metadata,
// not an application schema option or portable migration identity. Normalize
// only the upstream setter's canonical positive uint64 on actual row types.
export function validateAttributeOptions(options: unknown, hasRowType: boolean): void {
  if (typeof hasRowType !== 'boolean') denied();
  if (options === null) return;
  if (!Array.isArray(options) || Object.getPrototypeOf(options) !== Array.prototype || options.length > 1) denied();
  const keys = Reflect.ownKeys(options);
  if (options.length === 0) {
    if (keys.length !== 1 || keys[0] !== 'length') denied();
    return;
  }
  if (!hasRowType || keys.length !== 2 || !keys.includes('0') || !keys.includes('length')) denied();
  const element = Object.getOwnPropertyDescriptor(options,'0');
  if (!element || !('value' in element) || typeof element.value !== 'string') denied();
  const value: string = element.value;
  if (value.length > 30) denied(); // Prefix10 + at most20 digits, before BigInt.
  const match = /^pg_attver=([1-9][0-9]{0,19})$/.exec(value);
  // JS $ also matches before a final line terminator; require the full match.
  if (!match || match[0] !== value || BigInt(match[1]) > maxVersion) denied();
}
