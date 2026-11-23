import { repositoryMigrations } from './repository-migrations';

// Mandatory prebuild check; deliberately never regenerates reviewed metadata.
repositoryMigrations();
console.log('Reviewed runtime migration metadata matches SQL and journal.');
