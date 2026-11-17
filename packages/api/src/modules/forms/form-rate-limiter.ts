import { Injectable } from '@nestjs/common';

import { SlidingWindowRateLimiter } from '../../core/rate-limit/sliding-window-rate-limiter';

// Sliding-window limiter for the anonymous public form surface (per form + IP).
@Injectable()
export class FormRateLimiter extends SlidingWindowRateLimiter {
  protected readonly limitMessage = 'Too many submissions — please try again later.';
}
