import { Duration } from "@aws-cdk/core";
import { Schedule } from "./schedule";
import { IBackupVault } from "./vault";

/**
 * Represents the backup plan rule configuration.
 * If a vault is provided, this will be used instead of the one from the backup plan.
 */
export interface PlanRuleProps {
  /**
   * The backup vault to assign the plan to.
   */
  readonly backupVault: IBackupVault;
  /**
   * The schedule in which the plan will occur.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/creating-a-backup-plan.html
   */
  readonly schedule: Schedule;
  /**
   * The name of the rule.
   * @default - Generates a rule name.
   */
  readonly ruleName?: string;
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
 * Defines how often a plan rule
 */
export class PlanRule {
  /**
   * Returns a plan rule that executes a backup every day at 10:00 UTC.
   */
  public static daily(backupVault: IBackupVault): PlanRule {
    return new PlanRule({
      backupVault,
      schedule: Schedule.cron({
        hour: "10",
        minute: "0",
      }),
    });
  }

  /**
   * Returns a plan rule that executes a backup job once a week on SUN at 10:00 UTC.
   */
  public static weekly(backupVault: IBackupVault): PlanRule {
    return new PlanRule({
      backupVault,
      schedule: Schedule.cron({
        hour: "10",
        minute: "0",
        weekDay: "1",
      }),
    });
  }

  /**
   * Returns a plan rule that executes a backup job once a month on the first of the month at 10:00 UTC.
   */
  public static monthly1Year(backupVault: IBackupVault): PlanRule {
    return new PlanRule({
      backupVault,
      schedule: Schedule.cron({
        minute: "0",
        hour: "10",
        day: "1",
      }),
    });
  }

  /**
   * The schedule in which the plan will occur.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/creating-a-backup-plan.html
   */
  public readonly schedule: Schedule;
  /**
   * The backup vault to assign the plan to.
   */
  public readonly backupVault: IBackupVault;

  /**
   * The name of the rule.
   * @default - Generates a rule name.
   */
  public readonly ruleName?: string;
  /**
   * Specifies how long a backup lasts before being deleted.
   * Once a backup is moved into a cold storage class, it has to live 90 days
   * before it can be deleted, therefore this value has to be 90 days greater.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_Lifecycle.html
   * @default - Backups wont be deleted.
   */
  public readonly deleteAfter?: Duration;
  /**
   * Specifies how long a backup will stay in warm storage before being moved
   * to a cold storage class.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_Lifecycle.html
   * @default - Backups wont be moved to cold storage.
   */
  public readonly moveToColdStorageAfter?: Duration;
  /**
   * The time in which a backup job has to be completed before being cancelled.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_BackupRule.html
   * @default - sets the start at 5AM UTC and lasts 8 hours.
   */
  public readonly completionWindow?: Duration;
  /**
   * The amount of time in minutes before beginning a backup.
   * @see https://docs.aws.amazon.com/aws-backup/latest/devguide/API_BackupRule.html
   * @default - No start window.
   */
  public readonly startWindow?: Duration;

  constructor(props: PlanRuleProps) {
    this.ruleName = props.ruleName;
    this.backupVault = props.backupVault;
    this.schedule = props.schedule;
    this.deleteAfter = props.deleteAfter;
    this.moveToColdStorageAfter = props.moveToColdStorageAfter;
    this.completionWindow = props.completionWindow;
    this.startWindow = props.startWindow;
  }
}
