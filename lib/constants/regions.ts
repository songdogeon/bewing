export const REGION_OPTIONS = [
  { value: '서울',  label: '서울특별시' },
  { value: '경기',  label: '경기도' },
  { value: '인천',  label: '인천광역시' },
  { value: '부산',  label: '부산광역시' },
  { value: '대구',  label: '대구광역시' },
  { value: '광주',  label: '광주광역시' },
  { value: '대전',  label: '대전광역시' },
  { value: '울산',  label: '울산광역시' },
  { value: '세종',  label: '세종특별자치시' },
  { value: '강원',  label: '강원도' },
  { value: '충북',  label: '충청북도' },
  { value: '충남',  label: '충청남도' },
  { value: '전북',  label: '전라북도' },
  { value: '전남',  label: '전라남도' },
  { value: '경북',  label: '경상북도' },
  { value: '경남',  label: '경상남도' },
  { value: '제주',  label: '제주특별자치도' },
] as const

export const AGE_OPTIONS = Array.from({ length: 33 }, (_, i) => i + 18)

export const GENDER_OPTIONS = [
  { value: 'male',   label: '남성' },
  { value: 'female', label: '여성' },
  { value: 'other',  label: '기타' },
] as const

export type RegionValue = typeof REGION_OPTIONS[number]['value']
