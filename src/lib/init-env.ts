/**
 * Initialize environment validation
 * This should be imported early in the application
 */

import { validateAndLogEnv } from "./env-validator";

// Run validation on import
validateAndLogEnv();
