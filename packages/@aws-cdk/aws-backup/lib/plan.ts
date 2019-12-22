import { Schedule } from '@aws-cdk/aws-events';
import { Construct, Duration, IResource, Lazy, Resource } from '@aws-cdk/core';
import { CfnBackupPlan } from './backup.generated';
import { BackupSelection, BackupResource } from './selection';
import { IBackupVault } from './vault';

/**
 * Represents the backup plan rule configuration.
 * If a vault is provided, this will be used instead of the one from the backup plan.
 */
export interface PlanRule {
  /**
   * The name of the rule.
   */
  readonly ruleName: string;
  /**
   * Optional backup vault to store the backups from this rule.
   * If specified, this vault will be used instead of the one specified in the plan.
   * @default - BackUpPlan's vault.
   */
  readonly vault?: IBackupVault;
  /**
   * The schedule in which the plan will occur.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/creating-a-backup-plan.html
   */
  readonly schedule: Schedule;
  /**
   * Specifies how long a backup lasts before being deleted.
   * Once a backup is moved into a cold storage class, it has to live 90 days
   * before it can be deleted, therefore this value has to be 90 days greater.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_Lifecycle.html
   * @default - Backups wont be deleted.
   */
  readonly deleteAfter?: Duration;
  /**
   * Specifies how long a backup will stay in warm storage before being moved
   * to a cold storage class.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_Lifecycle.html
   * @default - Backups wont be moved to cold storage.
   */
  readonly moveToColdStorageAfter?: Duration;
  /**
   * The time in which a backup job has to be completed before being cancelled.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_BackupRule.html
   * @default - sets the start at 5AM UTC and lasts 8 hours.
   */
  readonly completionWindow?: Duration;
  /**
   * The amount of time in minutes before beginning a backup.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_BackupRule.html
   * @default - No start window.
   */
  readonly startWindow?: Duration;
}

/**
 * Represents a Backup Plan.
 */
export interface IBackupPlan extends IResource {
  /**
   * The backup vault where the plan will save the backups.
   * @attribute
   */
  readonly vault: IBackupVault;
  /**
   * The backup plan name.
   * @attribute
   */
  readonly backupPlanName: string;
  /**
   * The backup plan's ARN.
   * @attribute
   */
  readonly backupPlanArn: string;
  /**
   * The backup plan's ID.
   * @attribute
   */
  readonly backupPlanId: string;
  /**
   * A string representation of the backup plan's version ID
   * @attribute
   */
  readonly backupPlanVersionId: string;
}

abstract class BackupPlanBase extends Resource implements IBackupPlan {
  public abstract readonly vault: IBackupVault;
  public abstract readonly backupPlanName: string;
  public abstract readonly backupPlanArn: string;
  public abstract readonly backupPlanId: string;
  public abstract readonly backupPlanVersionId: string;
}

/**
 * Backup plan attributes.
 */
export interface BackupPlanAttributes {
  /**
   * A string representation of the backup plan name
   */
  readonly backupPlanName: string;
  /**
   * A string representation of the backup plan ARN.
   */
  readonly backupPlanArn: string;
  /**
   * A string representation of the backup plan version ID.
   */
  readonly backupPlanVersionId: string;
  /**
   * A string representation of the backup plan ID.
   */
  readonly backupPlanId: string;
  /**
   * An object representation of a backup vault.
   */
  readonly vault: IBackupVault;
}

/**
 * Properties of the Backup Plan.
 */
export interface BackupPlanProps {
  /**
   * The name of the backup plan.
   * @default - Assigned by CloudFormation.
   */
  readonly backupPlanName?: string;
  /**
   * A list of plan rules to assign to the plan.
   */
  readonly rules: PlanRule[];
  /**
   * The backup vault where all backup resources will be stored in.
   */
  readonly vault: IBackupVault;
}

/**
 * A Backup Plan specifies where the backup resources will be stored and
 * what rules will the plan will follow.
 */
export class BackupPlan extends BackupPlanBase {
  /**
   * Imports a backup plan from its attributes.
   */
  public static fromBackupPlanAttributes(scope: Construct, id: string, attrs: BackupPlanAttributes): IBackupPlan {
    class Import extends BackupPlanBase {
      public readonly backupPlanArn: string = attrs.backupPlanArn;
      public readonly backupPlanId: string = attrs.backupPlanId;
      public readonly backupPlanVersionId: string = attrs.backupPlanVersionId;
      public readonly backupPlanName: string = attrs.backupPlanName;
      public readonly vault: IBackupVault = attrs.vault;
    }

    return new Import(scope, id);
  }
  /**
   * A string representatino of the backup plan ARN
   */
  public readonly backupPlanArn: string;
  /**
   * The backup plan Id.
   */
  public readonly backupPlanId: string;
  /**
   * The backup version Id.
   */
  public readonly backupPlanVersionId: string;
  /**
   * The backup vault to use for all backups.
   */
  public readonly vault: IBackupVault;
  /**
   * The backup plan name.
   */
  public readonly backupPlanName: string;
  /**
   * A list of rules that specify the rules of the plan.
   */
  private rules: PlanRule[];

  constructor(scope: Construct, id: string, props: BackupPlanProps) {
    super(scope, id, {
      physicalName: props.backupPlanName,
    });

    const resource = new CfnBackupPlan(this, 'Resource', {
      backupPlan: {
        backupPlanName: this.physicalName,
        backupPlanRule: Lazy.anyValue({ produce: () => this.renderPlanRules(this.rules) }),
      },
    });

    this.backupPlanName = props.backupPlanName;
    this.backupPlanArn = this.getResourceArnAttribute(resource.attrBackupPlanArn, {
      service: 'backup',
      resource: 'backup-plan',
      resourceName: resource.ref,
    });
    this.backupPlanId = this.getResourceNameAttribute(resource.ref);
    this.backupPlanVersionId = resource.attrVersionId;

    this.vault = props.vault;
    this.rules = props.rules;
  }

  /**
   * Adds the given plan rules.
   */
  public addPlanRule(...rules: PlanRule[]): void {
    this.rules = [...this.rules, ...rules];
  }

  /**
   * Adds the selected resources to the backup plan.
   */
  public addSelection(name: string, ...resources: BackupResource[]) {
    new BackupSelection(this, name, {
      backupPlan: this,
      backupSelectionName: name,
      resources,
    });
  }

  private renderPlanRules(rules: PlanRule[]): undefined | CfnBackupPlan.BackupRuleResourceTypeProperty[] {
    if (!rules) {
      return undefined;
    }

    const backupRuleResourceTypes: CfnBackupPlan.BackupRuleResourceTypeProperty[] = rules.map(rule => {
      return {
        ruleName: rule.ruleName,
        targetBackupVault: rule.vault ? rule.vault.backupVaultName : this.vault.backupVaultName,
        completionWindowMinutes: rule.completionWindow ? rule.completionWindow.toMinutes() : undefined,
        startWindowMinutes: rule.startWindow ? rule.startWindow.toMinutes() : undefined,
        lifecycle: this.parseRuleLifecycle(rule),
        scheduleExpression: rule.schedule.expressionString
      };
    });

    return backupRuleResourceTypes;
  }

  private parseRuleLifecycle(planRule: PlanRule) {
    if (!planRule.deleteAfter && !planRule.moveToColdStorageAfter) {
      return undefined;
    }

    const deleteAfterDays = planRule.deleteAfter ? planRule.deleteAfter.toDays() : undefined;
    const moveToColdStorageAfterDays = planRule.moveToColdStorageAfter ? planRule.moveToColdStorageAfter.toDays() : undefined;

    if (deleteAfterDays && moveToColdStorageAfterDays) {
      if ((deleteAfterDays - moveToColdStorageAfterDays) < 90) {
        throw new Error('Deleting a backup has to be 90 days after being moved to cold storage.');
      }
    }

    return {
      deleteAfterDays,
      moveToColdStorageAfterDays,
    };
  }
}
