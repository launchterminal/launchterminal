import type { Plugin, PluginContext, UnifiedMessage } from '@/core/types';
import type { Logger } from 'pino';

interface I18nConfig {
  default_locale: string;
  fallback_locale: string;
  detect_language: boolean;
}

const LANGUAGE_PATTERNS: Record<string, RegExp[]> = {
  en: [/\b(the|is|are|was|were|have|has|had|will|would|could|should)\b/i],
  es: [/\b(el|la|los|las|es|son|fue|ser|estar|tiene|hay)\b/i],
  fr: [/\b(le|la|les|est|sont|une|des|pour|avec|dans)\b/i],
  de: [/\b(der|die|das|ist|sind|ein|eine|und|oder|nicht)\b/i],
  ja: [/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/],
};

export default class I18nPlugin implements Plugin {
  name = 'i18n';
  version = '0.9.0';
  priority = 20;

  private config!: I18nConfig;
  private logger!: Logger;

  async onInit(ctx: PluginContext): Promise<void> {
    this.config = ctx.config as unknown as I18nConfig;
    this.logger = ctx.logger;
    this.logger.info({ defaultLocale: this.config.default_locale }, 'I18n plugin initialized');
  }

  async onMessage(message: UnifiedMessage): Promise<UnifiedMessage> {
    let locale = this.config.default_locale;

    if (this.config.detect_language) {
      const detected = this.detectLanguage(message.content);
      if (detected) {
        locale = detected;
      }
    }

    message.metadata.set('locale', locale);
    message.metadata.set('language_detected', locale !== this.config.default_locale);

    this.logger.debug({ locale }, 'Language set');
    return message;
  }

  private detectLanguage(text: string): string | null {
    let bestMatch: string | null = null;
    let bestScore = 0;

    for (const [lang, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
      let score = 0;
      for (const pattern of patterns) {
        const matches = text.match(new RegExp(pattern, 'gi'));
        if (matches) score += matches.length;
      }
      if (score > bestScore) {
        bestScore = score;
        bestMatch = lang;
      }
    }

    return bestScore > 0 ? bestMatch : null;
  }

  async onDestroy(): Promise<void> {
    this.logger.info('I18n plugin destroyed');
  }
}
