import committed from '../../drizzle/postgresql/compatibility.json';
import { validateManifest, type CompatibilityManifest } from './migration-graph';

// Source-controlled trust only: no environment or database-supplied approvals.
export const compatibility = validateManifest(committed as CompatibilityManifest);
