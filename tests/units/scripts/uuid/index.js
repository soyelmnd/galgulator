import uuid from '../../../../src/scripts/uuid/';

describe('uuid', () => {
  it('should be defined', () => {
    expect(uuid).toBeDefined();
  });

  it('should return nice-formatted string', () => {
    const id = uuid();
    expect('string' == typeof id).toBeTruthy();
    expect(/^[a-z0-9]{4}(?:-[a-z0-9]{4}){3}$/i.test(id)).toBeTruthy();
  });

  it('should be kinda unique', () => {
    expect(uuid()).not.toEqual(uuid());
    expect(uuid()).not.toEqual(uuid());
  });
})
