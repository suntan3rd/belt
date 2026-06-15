import { describe, it, expect } from 'vitest';
import {
  INSPECTION_ITEMS,
  emptyRecord,
  validateRecord,
} from './inspectionItems.js';
import { aggregateStatus } from './belts.js';

describe('점검 항목 정의', () => {
  it('9개 항목이 정의된다', () => {
    expect(INSPECTION_ITEMS.length).toBe(9);
  });

  it('RSC는 3개 하위, 풀리는 6개, 전기장치 5개, 급유급지 2개', () => {
    const byKey = Object.fromEntries(INSPECTION_ITEMS.map((d) => [d.key, d]));
    expect(byKey.rsc.subs.length).toBe(3);
    expect(byKey.pulley.subs.length).toBe(6);
    expect(byKey.electric.subs.length).toBe(5);
    expect(byKey.lubrication.subs.length).toBe(2);
  });

  it('모터는 온도/진동 2개 수치 필드', () => {
    const motor = INSPECTION_ITEMS.find((d) => d.key === 'motor');
    expect(motor.fields.map((f) => f.key)).toEqual(['temp', 'vib']);
  });
});

describe('빈 기록 생성', () => {
  const rec = emptyRecord('S-101', 'SILO', '2026-06-15', '김현장');

  it('메타 정보가 채워진다', () => {
    expect(rec.belt).toBe('S-101');
    expect(rec.group).toBe('SILO');
    expect(rec.date).toBe('2026-06-15');
    expect(rec.inspector).toBe('김현장');
  });

  it('모든 항목이 기본 ok', () => {
    expect(aggregateStatus(rec)).toBe('ok');
  });

  it('풀리 항목은 subs와 temps를 가진다', () => {
    expect(Object.keys(rec.items.pulley.subs).length).toBe(6);
    expect(Object.keys(rec.items.pulley.temps).length).toBe(6);
  });
});

describe('기록 검증', () => {
  it('정상 기록은 에러 없음', () => {
    const rec = emptyRecord('S-101', 'SILO', '2026-06-15', '김현장');
    expect(validateRecord(rec)).toEqual([]);
  });

  it('점검자 없으면 에러', () => {
    const rec = emptyRecord('S-101', 'SILO', '2026-06-15', '');
    expect(validateRecord(rec).some((e) => e.includes('점검자'))).toBe(true);
  });

  it('모터 온도에 문자 입력 시 에러', () => {
    const rec = emptyRecord('S-101', 'SILO', '2026-06-15', '김현장');
    rec.items.motor.values.temp = 'abc';
    expect(validateRecord(rec).some((e) => e.includes('숫자'))).toBe(true);
  });

  it('풀리 온도에 문자 입력 시 에러', () => {
    const rec = emptyRecord('S-101', 'SILO', '2026-06-15', '김현장');
    rec.items.pulley.temps['헤드'] = 'xx';
    expect(validateRecord(rec).some((e) => e.includes('온도'))).toBe(true);
  });

  it('숫자 문자열은 통과', () => {
    const rec = emptyRecord('S-101', 'SILO', '2026-06-15', '김현장');
    rec.items.motor.values.temp = '58';
    rec.items.pulley.temps['헤드'] = '42.5';
    expect(validateRecord(rec)).toEqual([]);
  });
});
