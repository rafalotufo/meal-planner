import 'server-only';
import manifest from '../../.verification/build-manifest.json';
import { verificationTarget, type VerificationManifest } from './target';
export function currentVerificationTarget() {
  return verificationTarget(manifest as VerificationManifest);
}
