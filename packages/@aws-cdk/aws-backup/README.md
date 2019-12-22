## AWS Backup Construct Library
<!--BEGIN STABILITY BANNER-->

---

![Stability: Experimental](https://img.shields.io/badge/stability-Experimental-important.svg?style=for-the-badge)

> **This is a _developer preview_ (public beta) module.**
>
> All classes with the `Cfn` prefix in this module ([CFN Resources](https://docs.aws.amazon.com/cdk/latest/guide/constructs.html#constructs_lib))
> are auto-generated from CloudFormation. They are stable and safe to use.
>
> However, all other classes, i.e., higher level constructs, are under active development and subject to non-backward
> compatible changes or removal in any future version. These are not subject to the [Semantic Versioning](https://semver.org/) model.
> This means that while you may use them, you may need to update your source code when upgrading to a newer version of this package.

---
<!--END STABILITY BANNER-->

This module is part of the [AWS Cloud Development Kit](https://github.com/aws/aws-cdk) project.

```ts
import backup = require('@aws-cdk/aws-backup');
```

### Backup vaults

In AWS Backup, a backup vault is a container that you organize your backups in.

```ts
new backup.BackupVault(this, 'MyVault', {
  backupVaultName: 'MyVault',
});
```

You can use backup vaults to set the AWS Key Management Service (AWS KMS) encryption key that is
used to encrypt backups in the backup vault and to control access to the backups in the backup vault.
If you require different encryption keys or access policies for different groups of backups,
you can optionally create multiple backup vaults.

```ts
new backup.BackupVault(this, 'MyVault', {
  backupVaultName: 'MyVault',
  encryptionKey: new iam.Key(this, 'MyKey', {
    enabled: true,
  }),
});
```

See [Backup Vaults](https://docs.aws.amazon.com/aws-backup/latest/devguide/vaults.html)
in the Amazon Developer Guide.

### Backup Plan

In AWS Backup, a backup plan is a policy expression that defines when and how
you want to back up your AWS resources, such as Amazon DynamoDB tables or
Amazon Elastic File System (Amazon EFS) file systems.
You can assign resources to backup plans, and AWS Backup automatically backs up and
retains backups for those resources according to the backup plan.
You can create multiple backup plans if you have workloads with different backup requirements. 

```ts
new backup.BackupPlan(this, 'MyBackupPlan', {
  backupPlanName: 'MyBackupPlan',
  vault: backupVault,
  rules: [
    {
      ruleName: 'HourlyBackups',
      schedule: Schedule.cron({
        hour: '0'
      }),
      lifecycle: {
        deleteAfter: Duration.days(270),
        moveToColdStorageAfter: Duration.days(90),
      },
    },
  ],
});
```

See [Backup Plans](https://docs.aws.amazon.com/aws-backup/latest/devguide/about-backup-plans.html)
in the Amazon Developer Guide.

### Backup selections

When you assign a selection of resources to a backup plan, that resource is backed up automatically according to the backup plan.
The backups for that resource are managed according to the backup plan.

```ts
new backup.BackupSelection(this, 'MySelections', {
  backupPlan: backupPlan,
  resources: dynamoTables.map(table => table.tableArn),
});
```

See [Assigning Resources to a Backup Plan](https://docs.aws.amazon.com/aws-backup/latest/devguide/assigning-resources.html)
in the Amazon Developer Guide.

### Wiring it all up together

Since all backups require a BackupVault, we will of course need to create one first.

```ts
const backupVault = new BackupVault(this, 'MyBackupVault', {
  backupVaultName: 'WhereMyBackupsLive',
});

const backupPlan = new BackupPlan(this, 'BackupPlan', {
  backupPlanName: 'MyPlannedBackup',
  vault: backupVault,
});

backupPlan.addPlanRule({
  ruleName: 'HourlyBackups',
  schedule: Schedule.cron({hour: '1'}),
  completionWindow: Duration.hours(1),
  startWindowAfter: Duration.hours(1),
  lifecycle: {
    deleteAfter: Duration.days(270),
    moveToColdStorageAfter: Duration(90),
  },
});

new BackupSelection(this, 'DynamoDBSelections', {
  backupPlan: backupPlan,
  resources: dynamoTables.map(table => table.tableArn),
});
```
