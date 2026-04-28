import { generateTaskCode } from '../utils/helper';

describe('generateTaskCode()', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should return task code in correct format', () => {
    const code = generateTaskCode();

    expect(code).toMatch(/^TSK-\d{4}-[A-Z0-9]{3}$/);
  });

  it('should generate 4 digit number between 1000 and 9999', () => {
    const code = generateTaskCode();

    const parts = code.split('-');
    const num = Number(parts[1]);

    expect(num).toBeGreaterThanOrEqual(1000);
    expect(num).toBeLessThanOrEqual(9999);
  });

  it('should generate uppercase 3 character suffix', () => {
    const code = generateTaskCode();

    const parts = code.split('-');
    const suffix = parts[2];

    expect(suffix).toHaveLength(3);
    expect(suffix).toMatch(/^[A-Z0-9]{3}$/);
  });

  it('should return deterministic value when Math.random is mocked', () => {
    jest
      .spyOn(Math, 'random')
      .mockReturnValueOnce(0)       
      .mockReturnValueOnce(0.5);    

    const code = generateTaskCode();

    expect(code.startsWith('TSK-1000-')).toBe(true);
  });

  it('should generate different values on multiple calls', () => {
    const code1 = generateTaskCode();
    const code2 = generateTaskCode();

    expect(code1).not.toBe(code2);
  });
});