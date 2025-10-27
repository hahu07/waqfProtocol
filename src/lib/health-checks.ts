import { getDoc, setDoc } from '@junobuild/core';
import { ADMIN_COLLECTION } from './admin-utils';
import { logger } from './logger';

const ACTIVITY_COLLECTION = 'platform_activities';

type HealthStatus = {
  ok: boolean;
  timestamp: number;
  components: {
    juno: {
      connected: boolean;
      latencyMs: number;
    };
    storage: {
      writeable: boolean;
      writeLatencyMs?: number;
    };
    admin: {
      read: boolean;
      activityLog: boolean;
    };
  };
  metrics?: {
    dbSize?: number;
    lastBackup?: number;
  };
};

const HEALTH_CHECK_KEY = '__healthcheck__';

const testStorageWrite = async (): Promise<boolean> => {
  try {
    await setDoc({
      collection: ACTIVITY_COLLECTION,
      doc: {
        key: HEALTH_CHECK_KEY,
        data: { 
          id: HEALTH_CHECK_KEY,
          type: 'system_backup',
          userId: 'system',
          userName: 'System',
          description: 'Health check test',
          timestamp: Date.now()
        }
      }
    });
    return true;
  } catch {
    return false;
  }
};

export const checkAdminHealth = async (): Promise<HealthStatus> => {
  const startTime = Date.now();
  const status: HealthStatus = {
    ok: false,
    timestamp: startTime,
    components: {
      juno: { connected: false, latencyMs: 0 },
      storage: { writeable: false },
      admin: { read: false, activityLog: false }
    }
  };

  try {
    // 1. Juno Connection Check
    const junoStart = Date.now();
    await getDoc({ collection: ADMIN_COLLECTION, key: HEALTH_CHECK_KEY });
    status.components.juno = {
      connected: true,
      latencyMs: Date.now() - junoStart
    };

    // 2. Storage Write Check
    const writeStart = Date.now();
    status.components.storage.writeable = await testStorageWrite();
    status.components.storage.writeLatencyMs = Date.now() - writeStart;

    // 3. Admin Operations Check
    status.components.admin.read = (await getDoc({
      collection: ADMIN_COLLECTION,
      key: 'non_existent_key'
    })) === undefined;

    status.components.admin.activityLog = (await getDoc({
      collection: ACTIVITY_COLLECTION,
      key: HEALTH_CHECK_KEY
    })) !== undefined;

    status.ok = Object.values(status.components).every(
      component => Object.values(component).every(Boolean)
    );
  } catch (error) {
    logger.error('Health check failed', { error });
  }

  return status;
};

// Dashboard endpoint simulation
export const getHealthDashboard = async () => {
  const health = await checkAdminHealth();
  return {
    status: health.ok ? 'healthy' : 'degraded',
    lastChecked: new Date(health.timestamp).toISOString(),
    components: health.components,
    metrics: {
      uptime: process.uptime(),
      ...health.metrics
    }
  };
};

// For periodic monitoring
export const startHealthMonitor = (intervalMs = 30000) => {
  const check = async () => {
    const status = await checkAdminHealth();
    if (!status.ok) {
      // Add your alerting logic here (Sentry, email, etc.)
      logger.error('CRITICAL: Admin health check failed', { status });
    }
  };

  check(); // Run immediately
  return setInterval(check, intervalMs);
};
