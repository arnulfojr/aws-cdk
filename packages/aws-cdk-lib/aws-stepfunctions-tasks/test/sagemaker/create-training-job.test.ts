import { Template } from '../../../assertions';
import * as ec2 from '../../../aws-ec2';
import * as iam from '../../../aws-iam';
import * as kms from '../../../aws-kms';
import * as s3 from '../../../aws-s3';
import * as sfn from '../../../aws-stepfunctions';
import * as cdk from '../../../core';
import * as tasks from '../../lib';
import { SageMakerCreateTrainingJob } from '../../lib/sagemaker/create-training-job';

let stack: cdk.Stack;

beforeEach(() => {
  // GIVEN
  stack = new cdk.Stack();
});

test('create basic training job', () => {
  // WHEN
  const task = new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
    trainingJobName: 'MyTrainJob',
    algorithmSpecification: {
      algorithmName: 'BlazingText',
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3Location: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'InputBucket', 'mybucket'), 'mytrainpath'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
    },
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::sagemaker:createTrainingJob',
        ],
      ],
    },
    End: true,
    Parameters: {
      AlgorithmSpecification: {
        AlgorithmName: 'BlazingText',
        TrainingInputMode: 'File',
      },
      InputDataConfig: [
        {
          ChannelName: 'train',
          DataSource: {
            S3DataSource: {
              S3DataType: 'S3Prefix',
              S3Uri: {
                'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/mytrainpath']],
              },
            },
          },
        },
      ],
      OutputDataConfig: {
        S3OutputPath: {
          'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/myoutputpath']],
        },
      },
      ResourceConfig: {
        InstanceCount: 1,
        InstanceType: 'ml.m4.xlarge',
        VolumeSizeInGB: 10,
      },
      RoleArn: { 'Fn::GetAtt': ['TrainSagemakerSagemakerRole89E8C593', 'Arn'] },
      StoppingCondition: {
        MaxRuntimeInSeconds: 3600,
      },
      TrainingJobName: 'MyTrainJob',
    },
  });
});

test('create basic training job - using JSONata', () => {
  // WHEN
  const task = SageMakerCreateTrainingJob.jsonata(stack, 'TrainSagemaker', {
    trainingJobName: 'MyTrainJob',
    algorithmSpecification: {
      algorithmName: 'BlazingText',
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3Location: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'InputBucket', 'mybucket'), 'mytrainpath'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
    },
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    QueryLanguage: 'JSONata',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::sagemaker:createTrainingJob',
        ],
      ],
    },
    End: true,
    Arguments: {
      AlgorithmSpecification: {
        AlgorithmName: 'BlazingText',
        TrainingInputMode: 'File',
      },
      InputDataConfig: [
        {
          ChannelName: 'train',
          DataSource: {
            S3DataSource: {
              S3DataType: 'S3Prefix',
              S3Uri: {
                'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/mytrainpath']],
              },
            },
          },
        },
      ],
      OutputDataConfig: {
        S3OutputPath: {
          'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/myoutputpath']],
        },
      },
      ResourceConfig: {
        InstanceCount: 1,
        InstanceType: 'ml.m4.xlarge',
        VolumeSizeInGB: 10,
      },
      RoleArn: { 'Fn::GetAtt': ['TrainSagemakerSagemakerRole89E8C593', 'Arn'] },
      StoppingCondition: {
        MaxRuntimeInSeconds: 3600,
      },
      TrainingJobName: 'MyTrainJob',
    },
  });
});

test('create basic training job without inputDataConfig', () => {
  // WHEN
  const task = new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
    trainingJobName: 'MyTrainJob',
    algorithmSpecification: {
      algorithmName: 'BlazingText',
    },
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
    },
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::sagemaker:createTrainingJob',
        ],
      ],
    },
    End: true,
    Parameters: {
      AlgorithmSpecification: {
        AlgorithmName: 'BlazingText',
        TrainingInputMode: 'File',
      },
      OutputDataConfig: {
        S3OutputPath: {
          'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/myoutputpath']],
        },
      },
      ResourceConfig: {
        InstanceCount: 1,
        InstanceType: 'ml.m4.xlarge',
        VolumeSizeInGB: 10,
      },
      RoleArn: { 'Fn::GetAtt': ['TrainSagemakerSagemakerRole89E8C593', 'Arn'] },
      StoppingCondition: {
        MaxRuntimeInSeconds: 3600,
      },
      TrainingJobName: 'MyTrainJob',
    },
  });
});

test('Task throws if WAIT_FOR_TASK_TOKEN is supplied as service integration pattern', () => {
  expect(() => {
    new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
      integrationPattern: sfn.IntegrationPattern.WAIT_FOR_TASK_TOKEN,
      trainingJobName: 'MyTrainJob',
      algorithmSpecification: {
        algorithmName: 'BlazingText',
      },
      inputDataConfig: [
        {
          channelName: 'train',
          dataSource: {
            s3DataSource: {
              s3Location: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'InputBucket', 'mybucket'), 'mytrainpath'),
            },
          },
        },
      ],
      outputDataConfig: {
        s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
      },
    });
  }).toThrow(/Unsupported service integration pattern. Supported Patterns: REQUEST_RESPONSE,RUN_JOB. Received: WAIT_FOR_TASK_TOKEN/i);
});

test('create complex training job', () => {
  // WHEN
  const kmsKey = new kms.Key(stack, 'Key');
  const vpc = new ec2.Vpc(stack, 'VPC');
  const securityGroup = new ec2.SecurityGroup(stack, 'SecurityGroup', { vpc, description: 'My SG' });
  securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'allow ssh access from the world');

  const role = new iam.Role(stack, 'Role', {
    assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'),
    ],
  });

  const trainTask = new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
    trainingJobName: 'MyTrainJob',
    integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    role,
    algorithmSpecification: {
      algorithmName: 'BlazingText',
      trainingInputMode: tasks.InputMode.FAST_FILE,
      metricDefinitions: [
        {
          name: 'mymetric', regex: 'regex_pattern',
        },
      ],
    },
    enableNetworkIsolation: true,
    hyperparameters: {
      lr: '0.1',
    },
    inputDataConfig: [
      {
        channelName: 'train',
        contentType: 'image/jpeg',
        compressionType: tasks.CompressionType.NONE,
        recordWrapperType: tasks.RecordWrapperType.RECORD_IO,
        dataSource: {
          s3DataSource: {
            attributeNames: ['source-ref', 'class'],
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'InputBucketA', 'mybucket'), 'mytrainpath'),
          },
        },
      },
      {
        channelName: 'test',
        contentType: 'image/jpeg',
        compressionType: tasks.CompressionType.GZIP,
        recordWrapperType: tasks.RecordWrapperType.RECORD_IO,
        dataSource: {
          s3DataSource: {
            attributeNames: ['source-ref', 'class'],
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'InputBucketB', 'mybucket'), 'mytestpath'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
      encryptionKey: kmsKey,
    },
    resourceConfig: {
      instanceCount: 1,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.P3, ec2.InstanceSize.XLARGE2),
      volumeSize: cdk.Size.gibibytes(50),
      volumeEncryptionKey: kmsKey,
    },
    stoppingCondition: {
      maxRuntime: cdk.Duration.hours(1),
    },
    tags: {
      Project: 'MyProject',
    },
    vpcConfig: {
      vpc,
    },
    environment: {
      SOMEVAR: 'myvalue',
    },
  });
  trainTask.addSecurityGroup(securityGroup);

  // THEN
  expect(stack.resolve(trainTask.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::sagemaker:createTrainingJob.sync',
        ],
      ],
    },
    End: true,
    Parameters: {
      TrainingJobName: 'MyTrainJob',
      RoleArn: { 'Fn::GetAtt': ['Role1ABCC5F0', 'Arn'] },
      AlgorithmSpecification: {
        TrainingInputMode: 'FastFile',
        AlgorithmName: 'BlazingText',
        MetricDefinitions: [
          { Name: 'mymetric', Regex: 'regex_pattern' },
        ],
      },
      EnableNetworkIsolation: true,
      HyperParameters: {
        lr: '0.1',
      },
      InputDataConfig: [
        {
          ChannelName: 'train',
          CompressionType: 'None',
          RecordWrapperType: 'RecordIO',
          ContentType: 'image/jpeg',
          DataSource: {
            S3DataSource: {
              AttributeNames: ['source-ref', 'class'],
              S3DataType: 'S3Prefix',
              S3Uri: {
                'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/mytrainpath']],
              },
            },
          },
        },
        {
          ChannelName: 'test',
          CompressionType: 'Gzip',
          RecordWrapperType: 'RecordIO',
          ContentType: 'image/jpeg',
          DataSource: {
            S3DataSource: {
              AttributeNames: ['source-ref', 'class'],
              S3DataType: 'S3Prefix',
              S3Uri: {
                'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/mytestpath']],
              },
            },
          },
        },
      ],
      OutputDataConfig: {
        S3OutputPath: {
          'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/myoutputpath']],
        },
        KmsKeyId: { 'Fn::GetAtt': ['Key961B73FD', 'Arn'] },
      },
      ResourceConfig: {
        InstanceCount: 1,
        InstanceType: 'ml.p3.2xlarge',
        VolumeSizeInGB: 50,
        VolumeKmsKeyId: { 'Fn::GetAtt': ['Key961B73FD', 'Arn'] },
      },
      StoppingCondition: {
        MaxRuntimeInSeconds: 3600,
      },
      Tags: [
        { Key: 'Project', Value: 'MyProject' },
      ],
      VpcConfig: {
        SecurityGroupIds: [
          { 'Fn::GetAtt': ['TrainSagemakerTrainJobSecurityGroup7C858EB9', 'GroupId'] },
          { 'Fn::GetAtt': ['SecurityGroupDD263621', 'GroupId'] },
        ],
        Subnets: [
          { Ref: 'VPCPrivateSubnet1Subnet8BCA10E0' },
          { Ref: 'VPCPrivateSubnet2SubnetCFCDAA7A' },
        ],
      },
      Environment: {
        SOMEVAR: 'myvalue',
      },
    },
  });
});

test('pass param to training job', () => {
  // WHEN
  const role = new iam.Role(stack, 'Role', {
    assumedBy: new iam.ServicePrincipal('sagemaker.amazonaws.com'),
    managedPolicies: [
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSageMakerFullAccess'),
    ],
  });

  const task = new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
    trainingJobName: sfn.JsonPath.stringAt('$.JobName'),
    role,
    algorithmSpecification: {
      algorithmName: 'BlazingText',
      trainingInputMode: tasks.InputMode.FILE,
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath'),
    },
    resourceConfig: {
      instanceCount: 1,
      instanceType: new ec2.InstanceType(sfn.JsonPath.stringAt('$.TrainingJob.InstanceType')),
      volumeSize: cdk.Size.gibibytes(50),
    },
    stoppingCondition: {
      maxRuntime: cdk.Duration.hours(1),
    },
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toEqual({
    Type: 'Task',
    Resource: {
      'Fn::Join': [
        '',
        [
          'arn:',
          {
            Ref: 'AWS::Partition',
          },
          ':states:::sagemaker:createTrainingJob',
        ],
      ],
    },
    End: true,
    Parameters: {
      'TrainingJobName.$': '$.JobName',
      'RoleArn': { 'Fn::GetAtt': ['Role1ABCC5F0', 'Arn'] },
      'AlgorithmSpecification': {
        TrainingInputMode: 'File',
        AlgorithmName: 'BlazingText',
      },
      'InputDataConfig': [
        {
          ChannelName: 'train',
          DataSource: {
            S3DataSource: {
              'S3DataType': 'S3Prefix',
              'S3Uri.$': '$.S3Bucket',
            },
          },
        },
      ],
      'OutputDataConfig': {
        S3OutputPath: {
          'Fn::Join': ['', ['https://s3.', { Ref: 'AWS::Region' }, '.', { Ref: 'AWS::URLSuffix' }, '/mybucket/myoutputpath']],
        },
      },
      'ResourceConfig': {
        'InstanceCount': 1,
        'InstanceType.$': '$.TrainingJob.InstanceType',
        'VolumeSizeInGB': 50,
      },
      'StoppingCondition': {
        MaxRuntimeInSeconds: 3600,
      },
    },
  });
});

test('Cannot create a SageMaker train task with both algorithm name and image name missing', () => {
  expect(() => new SageMakerCreateTrainingJob(stack, 'SageMakerTrainingTask', {
    trainingJobName: 'myTrainJob',
    algorithmSpecification: {},
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath/'),
    },
  }))
    .toThrow(/Must define either an algorithm name or training image URI in the algorithm specification/);
});

test('Cannot create a SageMaker train task with both algorithm name and image name defined', () => {
  expect(() => new SageMakerCreateTrainingJob(stack, 'SageMakerTrainingTask', {
    trainingJobName: 'myTrainJob',
    algorithmSpecification: {
      algorithmName: 'BlazingText',
      trainingImage: tasks.DockerImage.fromJsonExpression(sfn.JsonPath.stringAt('$.Training.imageName')),
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath/'),
    },
  }))
    .toThrow(/Cannot define both an algorithm name and training image URI in the algorithm specification/);
});

test('create a SageMaker train task with trainingImage', () => {
  const task = new SageMakerCreateTrainingJob(stack, 'SageMakerTrainingTask', {
    trainingJobName: 'myTrainJob',
    algorithmSpecification: {
      trainingImage: tasks.DockerImage.fromJsonExpression(sfn.JsonPath.stringAt('$.Training.imageName')),
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath/'),
    },
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toMatchObject({
    Parameters: {
      AlgorithmSpecification: {
        'TrainingImage.$': '$.Training.imageName',
        'TrainingInputMode': 'File',
      },
    },
  });
});

test('create a SageMaker train task with image URI algorithmName', () => {
  const task = new SageMakerCreateTrainingJob(stack, 'SageMakerTrainingTask', {
    trainingJobName: 'myTrainJob',
    algorithmSpecification: {
      algorithmName: 'arn:aws:sagemaker:us-east-1:123456789012:algorithm/scikit-decision-trees',
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath/'),
    },
  });

  // THEN
  expect(stack.resolve(task.toStateJson())).toMatchObject({
    Parameters: {
      AlgorithmSpecification: {
        AlgorithmName: 'arn:aws:sagemaker:us-east-1:123456789012:algorithm/scikit-decision-trees',
      },
    },
  });
});

test('Cannot create a SageMaker train task when algorithmName length is 171 or more', () => {
  expect(() => new SageMakerCreateTrainingJob(stack, 'SageMakerTrainingTask', {
    trainingJobName: 'myTrainJob',
    algorithmSpecification: {
      algorithmName: 'a'.repeat(171), // maximum length is 170
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath/'),
    },
  }))
    .toThrow(/Algorithm name length must be between 1 and 170, but got 171/);
});

test('Cannot create a SageMaker train task with incorrect algorithmName', () => {
  expect(() => new SageMakerCreateTrainingJob(stack, 'SageMakerTrainingTask', {
    trainingJobName: 'myTrainJob',
    algorithmSpecification: {
      algorithmName: 'Blazing_Text', // underscores are not allowed
    },
    inputDataConfig: [
      {
        channelName: 'train',
        dataSource: {
          s3DataSource: {
            s3DataType: tasks.S3DataType.S3_PREFIX,
            s3Location: tasks.S3Location.fromJsonExpression('$.S3Bucket'),
          },
        },
      },
    ],
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'Bucket', 'mybucket'), 'myoutputpath/'),
    },
  }))
    .toThrow(/Expected algorithm name to match pattern/);
});

test('required permissions are granted to StateMachine role', () => {
  // WHEN
  const definition = new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
    trainingJobName: 'MyTrainJob',
    algorithmSpecification: {
      algorithmName: 'BlazingText',
    },
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
    },
  });

  new sfn.StateMachine(stack, 'MyStateMachine', {
    definition,
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: [
            'sagemaker:CreateTrainingJob',
            'sagemaker:DescribeTrainingJob',
            'sagemaker:StopTrainingJob',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':sagemaker:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':training-job/MyTrainJob*',
              ],
            ],
          },
        },
        {
          Action: 'sagemaker:ListTags',
          Effect: 'Allow',
          Resource: '*',
        },
        {
          Action: 'sagemaker:AddTags',
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':sagemaker:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':training-job/MyTrainJob*',
              ],
            ],
          },
        },
        {
          Action: 'iam:PassRole',
          Condition: {
            StringEquals: {
              'iam:PassedToService': 'sagemaker.amazonaws.com',
            },
          },
        },
      ],
      Version: '2012-10-17',
    },
  });
});

test('required permissions are granted to StateMachine role if RUN_JOB is supplied as service integration pattern', () => {
  // WHEN
  const definition = new SageMakerCreateTrainingJob(stack, 'TrainSagemaker', {
    trainingJobName: 'MyTrainJob',
    integrationPattern: sfn.IntegrationPattern.RUN_JOB,
    algorithmSpecification: {
      algorithmName: 'BlazingText',
    },
    outputDataConfig: {
      s3OutputLocation: tasks.S3Location.fromBucket(s3.Bucket.fromBucketName(stack, 'OutputBucket', 'mybucket'), 'myoutputpath'),
    },
  });

  new sfn.StateMachine(stack, 'MyStateMachine', {
    definition,
  });

  // THEN
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: [
        {
          Action: [
            'sagemaker:CreateTrainingJob',
            'sagemaker:DescribeTrainingJob',
            'sagemaker:StopTrainingJob',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':sagemaker:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':training-job/MyTrainJob*',
              ],
            ],
          },
        },
        {
          Action: 'sagemaker:ListTags',
          Effect: 'Allow',
          Resource: '*',
        },
        {
          Action: 'sagemaker:AddTags',
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':sagemaker:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':training-job/MyTrainJob*',
              ],
            ],
          },
        },
        {
          Action: 'iam:PassRole',
          Condition: {
            StringEquals: {
              'iam:PassedToService': 'sagemaker.amazonaws.com',
            },
          },
        },
        {
          Action: [
            'events:PutTargets',
            'events:PutRule',
            'events:DescribeRule',
          ],
          Effect: 'Allow',
          Resource: {
            'Fn::Join': [
              '',
              [
                'arn:',
                {
                  Ref: 'AWS::Partition',
                },
                ':events:',
                {
                  Ref: 'AWS::Region',
                },
                ':',
                {
                  Ref: 'AWS::AccountId',
                },
                ':rule/StepFunctionsGetEventsForSageMakerTrainingJobsRule',
              ],
            ],
          },
        },
      ],
      Version: '2012-10-17',
    },
  });
});
