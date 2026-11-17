import { Injectable } from '@nestjs/common';

import { SlidingWindowRateLimiter } from '../../core/rate-limit/sliding-window-rate-limiter';

// Sliding-window limiter for the public sign-in and sign-up mutations, keyed by
// email and by client address (see AccountResolver). Counts every attempt, so a
// password-guessing run is cut off whether or not individual guesses succeed.
@Injectable()
export class AuthAttemptLimiter extends SlidingWindowRateLimiter {
  protected readonly limitMessage = 'Too many attempts — please wait a few minutes and try again.';
}
