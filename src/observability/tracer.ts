import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { createLogger } from './logger';

const logger = createLogger('tracer');

let sdk: NodeSDK | null = null;

interface TracingConfig {
  enabled: boolean;
  exporter: string;
  endpoint?: string;
  sample_rate: number;
}

export async function initTracer(config: TracingConfig): Promise<void> {
  if (!config.enabled) return;

  const exporter = new OTLPTraceExporter({
    url: config.endpoint ?? process.env.OTEL_EXPORTER_ENDPOINT ?? 'http://localhost:4318/v1/traces',
  });

  sdk = new NodeSDK({
    traceExporter: exporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
    serviceName: 'launchterminal',
  });

  await sdk.start();
  logger.info({ endpoint: config.endpoint, sampleRate: config.sample_rate }, 'OpenTelemetry tracer started');

  process.on('SIGTERM', async () => {
    if (sdk) {
      await sdk.shutdown();
      logger.info('OpenTelemetry tracer shut down');
    }
  });
}

export async function shutdownTracer(): Promise<void> {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
}
