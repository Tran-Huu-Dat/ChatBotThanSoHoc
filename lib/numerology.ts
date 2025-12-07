// lib/numerology.ts

export type MasterNumber = 11 | 22 | 33;

export interface ReducedNumber {
  /** Giá trị cuối cùng sau khi rút gọn (1–9, hoặc 11, 22, 33) */
  value: number;
  /** Có phải Master Number không (11, 22, 33) */
  isMaster: boolean;
  /** Tổng ban đầu trước khi rút gọn */
  raw: number;
}

export interface NumerologyProfile {
  raw: {
    fullName: string; // tên gốc người dùng nhập
    normalizedFullName: string; // tên đã bỏ dấu, viết in hoa, bỏ ký tự lạ
    birthDate: string; // chuỗi ngày sinh gốc DD/MM/YYYY
    day: number;
    month: number;
    year: number;
  };
  core: {
    lifePath: ReducedNumber; // Số Đường Đời
    birthdayNumber: ReducedNumber; // Số Ngày Sinh
    destiny?: ReducedNumber; // Số Sứ Mệnh / Biểu Hiện
    soulUrge?: ReducedNumber; // Số Linh Hồn
    personality?: ReducedNumber; // Số Nhân Cách
    maturity?: ReducedNumber; // Số Trưởng Thành
  };
}

/**
 * Map chữ cái -> số theo hệ Pythagore
 */
const LETTER_MAP: Record<string, number> = {
  A: 1,
  J: 1,
  S: 1,
  B: 2,
  K: 2,
  T: 2,
  C: 3,
  L: 3,
  U: 3,
  D: 4,
  M: 4,
  V: 4,
  E: 5,
  N: 5,
  W: 5,
  F: 6,
  O: 6,
  X: 6,
  G: 7,
  P: 7,
  Y: 7, // Y: tuỳ trường phái, ở đây tạm cho =7
  H: 8,
  Q: 8,
  Z: 8,
  I: 9,
  R: 9,
};

const VOWELS = new Set<string>(["A", "E", "I", "O", "U", "Y"]); // xử lý đơn giản: xem Y là nguyên âm

/**
 * Bỏ dấu tiếng Việt + ký tự đặc biệt, chỉ giữ A-Z
 */
export function normalizeName(input: string): string {
  return (
    input
      .normalize("NFD")
      // bỏ dấu
      .replace(/[\u0300-\u036f]/g, "")
      // bỏ ký tự không phải chữ cái
      .toUpperCase()
      .replace(/[^A-Z]/g, "")
  );
}

/**
 * Lấy tất cả chữ cái (A-Z) từ tên, đã normalize
 */
function nameLetters(fullName: string): string[] {
  const cleaned = normalizeName(fullName);
  return cleaned.split("");
}

/**
 * Rút gọn số (ví dụ: 38 -> 11 -> 2), giữ Master Numbers nếu keepMaster=true
 */
export function reduceNumber(n: number, keepMaster = true): ReducedNumber {
  if (n <= 0 || Number.isNaN(n)) {
    return { value: 0, isMaster: false, raw: n };
  }

  let total = n;
  while (total > 9) {
    if (keepMaster && (total === 11 || total === 22 || total === 33)) {
      return { value: total, isMaster: true, raw: n };
    }
    total = total
      .toString()
      .split("")
      .map(Number)
      .reduce((a, b) => a + b, 0);
  }

  const isMaster = keepMaster && (total === 11 || total === 22 || total === 33);
  return { value: total, isMaster, raw: n };
}

/**
 * Sum tất cả chữ số trong chuỗi (chỉ tính 0-9)
 */
function sumDigitsFromString(numStr: string): number {
  return numStr
    .replace(/\D/g, "")
    .split("")
    .filter((ch) => ch !== "")
    .map(Number)
    .reduce((a, b) => a + b, 0);
}

/**
 * Parse ngày sinh dạng "DD/MM/YYYY"
 * (bạn có thể mở rộng cho các format khác nếu cần)
 */
export function parseBirthDate(birthDate: string): {
  day: number;
  month: number;
  year: number;
} {
  const normalized = birthDate.trim().replace(/[-.]/g, "/");
  const parts = normalized.split("/");
  if (parts.length !== 3) {
    throw new Error("Ngày sinh phải ở dạng DD/MM/YYYY");
  }
  const [dStr, mStr, yStr] = parts;
  const day = Number(dStr);
  const month = Number(mStr);
  const year = Number(yStr);

  if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year)
  ) {
    throw new Error("Ngày sinh không hợp lệ");
  }

  if (day < 1 || day > 31 || month < 1 || month > 12) {
    throw new Error("Ngày hoặc tháng sinh không hợp lệ");
  }

  return { day, month, year };
}

/**
 * Số Đường Đời – Life Path Number
 * Cách tính phổ biến: cộng tất cả chữ số trong ngày sinh (DDMMYYYY), rồi rút gọn.
 */
export function calcLifePath(birthDate: string): ReducedNumber {
  const digitsSum = sumDigitsFromString(birthDate);
  return reduceNumber(digitsSum, true);
}

/**
 * Số Ngày Sinh – Birthday Number
 * Dựa trên ngày (1–31), rút gọn (giữ Master)
 */
export function calcBirthdayNumber(day: number): ReducedNumber {
  return reduceNumber(day, true);
}

/**
 * Số Sứ Mệnh / Biểu Hiện – Destiny / Expression Number
 * Cộng tất cả chữ cái trong họ tên (đã normalize), rồi rút gọn.
 */
export function calcDestinyName(fullName: string): ReducedNumber {
  const letters = nameLetters(fullName);
  const total = letters
    .map((ch) => LETTER_MAP[ch] ?? 0)
    .reduce((a, b) => a + b, 0);
  return reduceNumber(total, true);
}

/**
 * Số Linh Hồn – Soul Urge Number
 * Cộng các NGUYÊN ÂM (A, E, I, O, U, Y) trong tên.
 */
export function calcSoulUrge(fullName: string): ReducedNumber {
  const letters = nameLetters(fullName);
  const total = letters
    .filter((ch) => VOWELS.has(ch))
    .map((ch) => LETTER_MAP[ch] ?? 0)
    .reduce((a, b) => a + b, 0);
  return reduceNumber(total, true);
}

/**
 * Số Nhân Cách – Personality Number
 * Cộng các PHỤ ÂM trong tên.
 */
export function calcPersonality(fullName: string): ReducedNumber {
  const letters = nameLetters(fullName);
  const total = letters
    .filter((ch) => !VOWELS.has(ch))
    .map((ch) => LETTER_MAP[ch] ?? 0)
    .reduce((a, b) => a + b, 0);
  return reduceNumber(total, true);
}

/**
 * Số Trưởng Thành – Maturity Number
 * Thường = Life Path + Destiny, rồi rút gọn (giữ Master).
 */
export function calcMaturity(
  lifePath: ReducedNumber,
  destiny: ReducedNumber
): ReducedNumber {
  const total = lifePath.value + destiny.value;
  return reduceNumber(total, true);
}

/**
 * Năm cá nhân – Personal Year
 * - Lấy ngày + tháng sinh của bạn
 * - Ghép với NĂM cần xem (ví dụ: 2025)
 * - Cộng tất cả chữ số, rồi rút gọn.
 */
export function calcPersonalYear(
  birthDate: string,
  targetYear: number
): ReducedNumber {
  const { day, month } = parseBirthDate(birthDate);
  const total = sumDigitsFromString(
    `${day.toString().padStart(2, "0")}${month
      .toString()
      .padStart(2, "0")}${targetYear}`
  );
  return reduceNumber(total, true);
}

/**
 * Tháng cá nhân – Personal Month
 * = Personal Year + số thứ tự tháng hiện tại, rồi rút gọn.
 */
export function calcPersonalMonth(
  personalYear: ReducedNumber,
  month: number
): ReducedNumber {
  const total = personalYear.value + month;
  return reduceNumber(total, true);
}

/**
 * Ngày cá nhân – Personal Day
 * = Personal Month + ngày hiện tại, rồi rút gọn.
 */
export function calcPersonalDay(
  personalMonth: ReducedNumber,
  day: number
): ReducedNumber {
  const total = personalMonth.value + day;
  return reduceNumber(total, true);
}

/**
 * Build full profile từ ngày sinh + họ tên
 * Dùng cho AI: bạn gửi object này vào prompt để nó diễn giải.
 */
export function buildNumerologyProfile(
  birthDate: string,
  fullName: string
): NumerologyProfile {
  const { day, month, year } = parseBirthDate(birthDate);

  const lifePath = calcLifePath(birthDate);
  const birthdayNumber = calcBirthdayNumber(day);
  const destiny = calcDestinyName(fullName);
  const soulUrge = calcSoulUrge(fullName);
  const personality = calcPersonality(fullName);
  const maturity = calcMaturity(lifePath, destiny);

  return {
    raw: {
      fullName,
      normalizedFullName: normalizeName(fullName),
      birthDate,
      day,
      month,
      year,
    },
    core: {
      lifePath,
      birthdayNumber,
      destiny,
      soulUrge,
      personality,
      maturity,
    },
  };
}
