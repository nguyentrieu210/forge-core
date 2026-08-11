import type { ControllerContext } from "../../document-kernel/src/index.js";
import { SalarySlipController } from "./enterprise-controllers.js";
import type { SalarySlipData } from "./enterprise-types.js";
import { buildAlumDoorSalarySlipInputs } from "./alumdoor-payroll.js";
import { buildHrmSalarySlipInputs } from "./hrm-payroll.js";

export class HrmSalarySlipController extends SalarySlipController {
  async normalize(context: ControllerContext<SalarySlipData>): Promise<SalarySlipData> {
    const input = context.command.document;
    const alumdoorProfile = typeof input.alu_pay_profile === "string" ? input.alu_pay_profile.trim() : "";

    // AlumDoor's three-segment attendance projection is authoritative for its payroll.
    // Never fall through to standard Attendance for a slip that carries an AlumDoor profile.
    if (alumdoorProfile) {
      const sourceDocument = { ...input, earnings: [], deductions: [] } as SalarySlipData;
      const sourceContext: ControllerContext<SalarySlipData> = {
        ...context,
        command: { ...context.command, document: sourceDocument },
      };
      const generated = await buildAlumDoorSalarySlipInputs(sourceContext, sourceDocument);
      if (!generated) return super.normalize(context);
      const document = { ...sourceDocument, ...generated } as SalarySlipData;
      return super.normalize({ ...context, command: { ...context.command, document } });
    }

    const assignment = typeof input.salary_structure_assignment === "string"
      ? input.salary_structure_assignment.trim()
      : "";

    // Salary slips linked to an HR salary assignment are always regenerated from
    // authoritative payroll inputs. This prevents a draft/preview from carrying
    // stale earnings into submit after attendance/leave/allowance sources changed.
    if (!assignment) return super.normalize(context);

    const sourceDocument = {
      ...input,
      salary_structure_assignment: assignment,
      earnings: [],
      deductions: [],
    } as SalarySlipData;
    const sourceContext: ControllerContext<SalarySlipData> = {
      ...context,
      command: { ...context.command, document: sourceDocument },
    };
    const generated = await buildHrmSalarySlipInputs(sourceContext, sourceDocument);
    if (!generated) return super.normalize(context);

    const document = { ...sourceDocument, ...generated } as SalarySlipData;
    const nextContext: ControllerContext<SalarySlipData> = {
      ...context,
      command: { ...context.command, document },
    };
    return super.normalize(nextContext);
  }
}
