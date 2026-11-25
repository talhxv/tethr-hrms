import { Injectable } from '@nestjs/common';

import { DELIVERY_HEADER, SIGNATURE_HEADER, signBody } from './onboarding-automation.contract';

const DELIVERY_TIMEOUT_MS = 15_000;

export type DeliveryResult = {
  // HTTP status the webhook answered with; null when it never answered.
  readonly responseStatus: number | null;
  readonly delivered: boolean;
  readonly error: string | null;
};

// The one outbound HTTP call: POST the payload to the workflow's webhook. The
// body is signed (x-hrms-signature) and the secret also goes as a bearer token,
// so the n8n Webhook node can use plain "Header Auth" without code. Isolated in
// its own provider so tests replace it instead of the network.
@Injectable()
export class OnboardingAutomationDispatcher {
  async deliver(input: {
    readonly webhookUrl: string;
    readonly secret: string;
    readonly runId: string;
    readonly body: string;
  }): Promise<DeliveryResult> {
    try {
      const response = await fetch(input.webhookUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${input.secret}`,
          [SIGNATURE_HEADER]: signBody(input.secret, input.body),
          [DELIVERY_HEADER]: input.runId,
          'user-agent': 'tethr-hrms-onboarding-automation/1',
        },
        body: input.body,
        signal: AbortSignal.timeout(DELIVERY_TIMEOUT_MS),
      });
      // Drain the body so the socket is released; the content is not used.
      await response.text().catch(() => '');
      if (response.ok) {
        return { responseStatus: response.status, delivered: true, error: null };
      }
      return {
        responseStatus: response.status,
        delivered: false,
        error: `The automation answered with HTTP ${response.status}.`,
      };
    } catch (cause) {
      const timedOut = cause instanceof Error && cause.name === 'TimeoutError';
      return {
        responseStatus: null,
        delivered: false,
        error: timedOut
          ? 'The automation did not answer within 15 seconds.'
          : 'The automation could not be reached.',
      };
    }
  }
}
