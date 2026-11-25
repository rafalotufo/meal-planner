import { repositorySources } from './repository-migrations';

// Mandatory prebuild check; deliberately never regenerates reviewed metadata.
repositorySources();
console.log('Reviewed runtime migration metadata matches SQL and journal.');
