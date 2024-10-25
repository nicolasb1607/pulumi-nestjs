import * as aws from '@pulumi/aws';
import { Vpc } from '@pulumi/aws/ec2';

const vpcStaging = new Vpc('vpc-staging', {
  cidrBlock: '10.0.0.0/16',
})

