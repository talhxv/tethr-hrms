import { PasswordService } from './password.service';

describe('PasswordService', () => {
  const service = new PasswordService();

  it('verifies a correct password', async () => {
    const hash = await service.hash('correct horse battery staple');
    await expect(service.verify('correct horse battery staple', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await service.hash('correct horse battery staple');
    await expect(service.verify('wrong password', hash)).resolves.toBe(false);
  });

  it('rejects a malformed stored hash', async () => {
    await expect(service.verify('whatever', 'not-a-valid-format')).resolves.toBe(false);
  });

  it('produces a unique salt per hash', async () => {
    const first = await service.hash('same');
    const second = await service.hash('same');
    expect(first).not.toEqual(second);
  });
});
