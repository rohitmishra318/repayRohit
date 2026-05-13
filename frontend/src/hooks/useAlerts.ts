// Re-export from index.ts to avoid circular dependencies
// The main implementations are in index.ts which use the consolidated api
export { useAlerts, usePatchAlert as useMarkActioned } from './index';