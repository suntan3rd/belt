// 점검 항목 정의 (현장모드 폼 + 검증)
// type:
//   'yn'    : 양호/불량 단일
//   'subs'  : 하위 항목들 각각 양호/불량 (rows)
//   'pulley': 풀리(베어링 양호/불량 + 온도) 행들
//   'num'   : 양호/불량 + 수치 입력 필드들

export const INSPECTION_ITEMS = [
  { key: 'spillage', no: 1, title: '낙광 상태', type: 'yn' },
  { key: 'belt', no: 2, title: '벨트 상태 / 마모', type: 'yn' },
  {
    key: 'rsc',
    no: 3,
    title: 'RSC (Roller · Skirt · Cleaner)',
    type: 'subs',
    subs: ['Roller', 'Skirt', 'Cleaner'],
  },
  {
    key: 'pulley',
    no: 4,
    title: '풀리 — 베어링 상태 / 온도',
    type: 'pulley',
    subs: ['헤드', '테일', '구동', '밴드', '스냅', '텐션'],
  },
  {
    key: 'motor',
    no: 5,
    title: '모터',
    type: 'num',
    fields: [
      { key: 'temp', label: '모터온도', unit: '℃' },
      { key: 'vib', label: '진동값', unit: 'mm/s' },
    ],
  },
  {
    key: 'reducer',
    no: 6,
    title: '감속기',
    type: 'num',
    fields: [{ key: 'temp', label: '온도', unit: '℃' }],
  },
  {
    key: 'electric',
    no: 7,
    title: '전기장치',
    type: 'subs',
    subs: ['Chute S/W', 'Speed S/W', 'Skew S/W', 'Pull Cord S/W', 'Tear Detector'],
  },
  {
    key: 'lubrication',
    no: 8,
    title: '급유 / 급지',
    type: 'subs',
    subs: ['급유 (Oil)', '급지 (Grease)'],
  },
  { key: 'safety', no: 9, title: '안전장치 / 기타', type: 'yn' },
];

// 빈 점검 기록 생성 (기본 상태 ok)
export function emptyRecord(beltName, group, date, inspector) {
  const items = {};
  for (const def of INSPECTION_ITEMS) {
    const it = { status: 'ok', memo: '' };
    if (def.type === 'subs') {
      it.subs = {};
      for (const s of def.subs) it.subs[s] = 'ok';
    }
    if (def.type === 'pulley') {
      it.subs = {};
      it.temps = {};
      for (const s of def.subs) {
        it.subs[s] = 'ok';
        it.temps[s] = '';
      }
    }
    if (def.type === 'num') {
      it.values = {};
      for (const f of def.fields) it.values[f.key] = '';
    }
    items[def.key] = it;
  }
  return { belt: beltName, group, date, inspector, items };
}

// 점검 기록 검증: 누락/형식 오류 목록 반환 (빈 배열이면 유효)
export function validateRecord(record) {
  const errors = [];
  if (!record) return ['기록이 없습니다.'];
  if (!record.belt) errors.push('벨트가 지정되지 않았습니다.');
  if (!record.date) errors.push('점검일이 없습니다.');
  if (!record.inspector) errors.push('점검자가 지정되지 않았습니다.');
  for (const def of INSPECTION_ITEMS) {
    const it = record.items && record.items[def.key];
    if (!it) {
      errors.push(`항목 누락: ${def.title}`);
      continue;
    }
    if (def.type === 'num') {
      for (const f of def.fields) {
        const v = it.values && it.values[f.key];
        if (v !== '' && v != null && Number.isNaN(Number(v))) {
          errors.push(`${def.title} ${f.label}: 숫자만 입력 가능`);
        }
      }
    }
    if (def.type === 'pulley') {
      for (const s of def.subs) {
        const t = it.temps && it.temps[s];
        if (t !== '' && t != null && Number.isNaN(Number(t))) {
          errors.push(`풀리 ${s} 온도: 숫자만 입력 가능`);
        }
      }
    }
  }
  return errors;
}
