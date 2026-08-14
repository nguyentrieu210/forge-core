import { DurableObject } from "cloudflare:workers";
import type { JsonObject, MutationCommand, MutationReceipt } from "../../../packages/contracts/src/index.js";
import {
  APP_FACTORY_APPROVAL_PROCESS_DOCTYPE,
  AppFactoryApprovalRuntime,
  registerAppFactoryControllers,
} from "../../../packages/app-registry/src/index.js";
import {
  ControllerRegistry,
  D1RolloutPurchaseAllocationDomainStore,
  DocumentKernel,
  MutationSerialExecutor,
} from "../../../packages/document-kernel/src/index.js";
import { errors } from "../../../packages/core/src/index.js";
import { D1DocumentAccessStore, D1MetadataStore, GenericMetadataController, MetadataPermissionService } from "../../../packages/frappe-model/src/index.js";
import type { TenantEnv } from "./env.js";
import { isInventoryCoordinatedCommand, resolveInventoryCoordinatorKey } from "./inventory-coordinator.js";
import { PurchaseCommandSerialExecutor } from "./purchase-command-retry.js";

/**
 * Bản lõi không có gói `organization-security`, nên uỷ quyền và SoD không có luật nào để tra.
 *
 * Chọn mặc định NGẶT chứ không dễ dãi: `canActThroughDelegation` luôn trả `false`, tức người
 * duyệt phải tự mang vai trò đó chứ không mượn được của ai. `checkSoD` trả `allowed` vì
 * không có luật xung đột nào được nạp — đó là sự thật, không phải bỏ qua kiểm tra.
 *
 * Cắm lại gói kia thì thay đúng chỗ này.
 */
const CORE_APPROVAL_SECURITY = {
  async canActThroughDelegation() {
    return { allowed: false };
  },
  async checkSoD() {
    return { allowed: true };
  },
};

interface AggregateStub extends DurableObjectStub {
  mutate<T extends JsonObject>(command: MutationCommand<T>): Promise<MutationReceipt>;
  mutateInventory<T extends JsonObject>(command: MutationCommand<T>): Promise<MutationReceipt>;
  mutatePurchase<T extends JsonObject>(command: MutationCommand<T>): Promise<MutationReceipt>;
}

const PURCHASE_ALLOCATION_DOCTYPES = new Set(["Purchase Order", "Purchase Receipt"]);
const INVENTORY_EXECUTORS = new WeakMap<object, MutationSerialExecutor>();
const PURCHASE_EXECUTORS = new WeakMap<object, PurchaseCommandSerialExecutor>();
const APP_FACTORY_APPROVAL_EXECUTORS = new WeakMap<object, MutationSerialExecutor>();

/** One Durable Object class serves the keyed business coordinators in the existing AGGREGATES namespace. */
export class AggregateCoordinator extends DurableObject<TenantEnv> {
  constructor(ctx: DurableObjectState, env: TenantEnv) { super(ctx, env); }

  async mutate<T extends JsonObject>(command: MutationCommand<T>): Promise<MutationReceipt> {
    if (command.aggregate.doctype === APP_FACTORY_APPROVAL_PROCESS_DOCTYPE) {
      let executor = APP_FACTORY_APPROVAL_EXECUTORS.get(this);
      if (!executor) { executor = new MutationSerialExecutor(); APP_FACTORY_APPROVAL_EXECUTORS.set(this, executor); }
      return executor.execute(() => this.appFactoryApprovalRuntime().execute(command as MutationCommand<JsonObject>, new Date().toISOString()));
    }
    const { kernel, store } = this.commandServices();
    const inventoryKey = await resolveInventoryCoordinatorKey(command as MutationCommand<JsonObject>, store);
    if (inventoryKey) return (this.env.AGGREGATES.getByName(inventoryKey) as AggregateStub).mutateInventory(command);
    if (!PURCHASE_ALLOCATION_DOCTYPES.has(command.aggregate.doctype) || !["submit", "cancel"].includes(command.action)) return kernel.execute(command);
    let company = textField(command.document, "company");
    let supplier = textField(command.document, "supplier");
    if (!company || !supplier) {
      const existing = await store.getDocument<JsonObject>(command.tenant_id, command.aggregate.doctype, command.aggregate.name);
      company ||= textField(existing?.data, "company"); supplier ||= textField(existing?.data, "supplier");
    }
    if (!company || !supplier) throw errors.validation("Purchase allocation commands require company and supplier");
    return (this.env.AGGREGATES.getByName(`purchase:${command.tenant_id}:${encodeURIComponent(company)}:${encodeURIComponent(supplier)}`) as AggregateStub).mutatePurchase(command);
  }

  async mutateInventory<T extends JsonObject>(command: MutationCommand<T>): Promise<MutationReceipt> {
    if (!isInventoryCoordinatedCommand(command as MutationCommand<JsonObject>)) throw errors.validation("mutateInventory accepts only coordinated inventory commands");
    let executor = INVENTORY_EXECUTORS.get(this);
    if (!executor) { executor = new MutationSerialExecutor(); INVENTORY_EXECUTORS.set(this, executor); }
    return executor.execute(() => this.commandServices().kernel.execute(command));
  }

  async mutatePurchase<T extends JsonObject>(command: MutationCommand<T>): Promise<MutationReceipt> {
    if (!PURCHASE_ALLOCATION_DOCTYPES.has(command.aggregate.doctype) || !["submit", "cancel"].includes(command.action)) throw errors.validation("mutatePurchase accepts only submitted purchase allocation commands");
    let executor = PURCHASE_EXECUTORS.get(this);
    if (!executor) { executor = new PurchaseCommandSerialExecutor(); PURCHASE_EXECUTORS.set(this, executor); }
    return executor.execute(() => this.commandServices().kernel.execute(command));
  }

  private commandServices(): { kernel: DocumentKernel; store: D1RolloutPurchaseAllocationDomainStore } {
    const metadata = new D1MetadataStore(this.env.DB);
    // Bản lõi: không có controller nghiệp vụ nào. Mọi doctype rơi vào GenericMetadataController,
    // tức chạy thuần theo metadata — đúng tinh thần doctype. App muốn hành vi riêng thì tự
    // `register()` controller của mình vào chuỗi này.
    const registry = registerAppFactoryControllers(new ControllerRegistry(), metadata)
      .setFallback(new GenericMetadataController(metadata));
    const store = new D1RolloutPurchaseAllocationDomainStore(this.env.DB);
    return { store, kernel: new DocumentKernel(registry, store, new MetadataPermissionService(metadata, undefined, new D1DocumentAccessStore(this.env.DB))) };
  }

  private appFactoryApprovalRuntime(): AppFactoryApprovalRuntime {
    const metadata = new D1MetadataStore(this.env.DB); const access = new D1DocumentAccessStore(this.env.DB); const reader = new D1RolloutPurchaseAllocationDomainStore(this.env.DB);
    return new AppFactoryApprovalRuntime(this.env.DB, reader, new MetadataPermissionService(metadata, undefined, access), CORE_APPROVAL_SECURITY);
  }
}

function textField(value: JsonObject | undefined, field: string): string { const candidate = value?.[field]; return typeof candidate === "string" ? candidate.trim() : ""; }
