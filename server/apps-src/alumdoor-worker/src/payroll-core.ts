export type AlumDoorPayMode = "MONTHLY" | "DAILY";

export interface AlumDoorPayrollInput {
  payMode: AlumDoorPayMode;
  baseSalaryVnd: number;
  standardWorkDaysBp: number;
  workFractionBp: number;
  regularMinutes: number;
  overtimeMinutes: number;
  overtimeMultiplierBp: number;
  allowanceVnd?: number;
  advanceVnd?: number;
  manualDeductionVnd?: number;
}

export interface AlumDoorPayrollResult {
  basePayVnd: number;
  overtimePayVnd: number;
  allowanceVnd: number;
  advanceVnd: number;
  manualDeductionVnd: number;
  grossPayVnd: number;
  totalDeductionVnd: number;
  netPayVnd: number;
  dailyRate: { numerator: string; denominator: string };
}

export class AlumDoorPayrollRuleError extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = "AlumDoorPayrollRuleError";
  }
}

function integer(value: unknown, label: string, min = 0, max = Number.MAX_SAFE_INTEGER): number {
  if (!Number.isSafeInteger(value) || Number(value) < min || Number(value) > max) {
    throw new AlumDoorPayrollRuleError("PAYROLL_INPUT_INVALID", `${label} phải là số nguyên hợp lệ.`);
  }
  return Number(value);
}

function roundHalfUpRatio(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n || numerator < 0n) {
    throw new AlumDoorPayrollRuleError("PAYROLL_INPUT_INVALID", "Tỷ lệ tính lương không hợp lệ.");
  }
  return (numerator + denominator / 2n) / denominator;
}

function safeNumber(value: bigint, label: string): number {
  const result = Number(value);
  if (!Number.isSafeInteger(result) || result < 0) {
    throw new AlumDoorPayrollRuleError("PAYROLL_AMOUNT_OVERFLOW", `${label} vượt giới hạn tính toán.`);
  }
  return result;
}

/**
 * AlumDoor payroll MVP calculation.
 *
 * Money stays integer VND and ratios stay basis points. No floating-point value is
 * authoritative. DAILY means baseSalaryVnd is one full-day rate. MONTHLY means it is
 * the monthly salary and standardWorkDaysBp is the period's standard paid days × 10000.
 */
export function calculateAlumDoorPayroll(input: AlumDoorPayrollInput): AlumDoorPayrollResult {
  if (input.payMode !== "MONTHLY" && input.payMode !== "DAILY") {
    throw new AlumDoorPayrollRuleError("PAYROLL_INPUT_INVALID", "Cách trả lương không hợp lệ.");
  }
  const baseSalary = integer(input.baseSalaryVnd, "Lương cơ bản", 0, 999_999_999_999);
  const standardDays = integer(input.standardWorkDaysBp, "Ngày công chuẩn", 1, 310_000);
  const workFraction = integer(input.workFractionBp, "Ngày công thực tế", 0, 310_000);
  integer(input.regularMinutes, "Phút công thường", 0, 60 * 24 * 31);
  const overtimeMinutes = integer(input.overtimeMinutes, "Phút tăng ca", 0, 60 * 24 * 31);
  const overtimeMultiplier = integer(input.overtimeMultiplierBp, "Hệ số tăng ca", 0, 100_000);
  const allowance = integer(input.allowanceVnd ?? 0, "Phụ cấp", 0, 999_999_999_999);
  const advance = integer(input.advanceVnd ?? 0, "Tạm ứng", 0, 999_999_999_999);
  const deduction = integer(input.manualDeductionVnd ?? 0, "Khấu trừ", 0, 999_999_999_999);

  const base = BigInt(baseSalary);
  const work = BigInt(workFraction);
  const standard = BigInt(standardDays);
  const otMinutes = BigInt(overtimeMinutes);
  const otMultiplier = BigInt(overtimeMultiplier);

  const basePay = input.payMode === "DAILY"
    ? roundHalfUpRatio(base * work, 10_000n)
    : roundHalfUpRatio(base * work, standard);

  // hourly = daily / 8; overtime fraction is minutes / 60; multiplier is bp / 10000.
  // DAILY:   base * minutes * multiplier / (480 * 10000)
  // MONTHLY: (base * 10000 / standardDaysBp) * minutes * multiplier / (480 * 10000)
  //          = base * minutes * multiplier / (480 * standardDaysBp)
  const overtimePay = input.payMode === "DAILY"
    ? roundHalfUpRatio(base * otMinutes * otMultiplier, 480n * 10_000n)
    : roundHalfUpRatio(base * otMinutes * otMultiplier, 480n * standard);

  const gross = basePay + overtimePay + BigInt(allowance);
  const totalDeduction = BigInt(advance) + BigInt(deduction);
  if (totalDeduction > gross) {
    throw new AlumDoorPayrollRuleError("PAYROLL_NEGATIVE_NET", "Tổng tạm ứng và khấu trừ vượt thu nhập kỳ lương.");
  }
  const net = gross - totalDeduction;

  return {
    basePayVnd: safeNumber(basePay, "Lương thường"),
    overtimePayVnd: safeNumber(overtimePay, "Tiền tăng ca"),
    allowanceVnd: allowance,
    advanceVnd: advance,
    manualDeductionVnd: deduction,
    grossPayVnd: safeNumber(gross, "Tổng thu nhập"),
    totalDeductionVnd: safeNumber(totalDeduction, "Tổng khấu trừ"),
    netPayVnd: safeNumber(net, "Thực nhận"),
    dailyRate: input.payMode === "DAILY"
      ? { numerator: String(baseSalary), denominator: "1" }
      : { numerator: String(BigInt(baseSalary) * 10_000n), denominator: String(standardDays) },
  };
}
