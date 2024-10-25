import { ec2 } from "@pulumi/aws";
import { Instance, InstanceType, InternetGateway, Vpc } from "@pulumi/aws/ec2";
import { RouteTable } from "@pulumi/aws/ec2/routeTable";
import { RouteTableAssociation } from "@pulumi/aws/ec2/routeTableAssociation";
import { SecurityGroup } from "@pulumi/aws/ec2/securityGroup";
import { Subnet } from "@pulumi/aws/ec2/subnet";

//Create VPC
const vpcStaging = new Vpc('vpc-staging', {
  cidrBlock: '10.0.0.0/16',
  tags: {
    Name: 'vpc-staging'
  }
});

//Create an internet Gateway
const igw = new InternetGateway('staging-igw', {
  vpcId: vpcStaging.id,
  tags: {
    Name: 'staging-igw'
  }
});


//Create Subnets
const publicSubnet = new Subnet('public-subnet', {
  vpcId: vpcStaging.id,
  cidrBlock: '10.0.1.0/24',
  mapPublicIpOnLaunch: true,
  tags: {
    Name: 'staging-public-subnet',
    Type: 'Public',
  }
});

const privateSubnet = new Subnet('private-subnet', {
  vpcId: vpcStaging.id,
  cidrBlock: '10.0.10.0/24',
  tags: {
    Name: 'staging-private-subnet',
    Type: 'Private',
  }
});



//Create Route Table for Public subnet
const publicRouteTable = new RouteTable('public-rt', {
  vpcId: vpcStaging.id,
  routes: [
    {
      cidrBlock: '0.0.0.0/0',
      gatewayId: igw.id
    }
  ],
  tags: {
    Name: 'staging-public-rt'
  }
})

//Associate public route table to public subnet
const publicRtAssoc = new RouteTableAssociation('public-rt-association', {
  subnetId: publicSubnet.id,
  routeTableId: publicRouteTable.id
})



//Create a Nat Gateway for private subnet $0.05/hour

//const eip = new Eip('nat-eip', {
//  tags: {
//    Name: 'staging-nat-eip'
//  }
//})
//const ngw = new NatGateway('nat-gateway', 
//  {
//    allocationId: eip.id,
//    subnetId: publicSubnet.id,
//    tags: {
//      Name: 'staging-nat',
//    }
//  }
//)


//const privateRouteTable = new RouteTable('private-rt', {
//  vpcId: vpcStaging.id,
//  routes: [
//    {
//      cidrBlock: '0.0.0.0/0',
//      natGatewayId: ngw.id,
//    },
//  ],
//  tags: {
//    Name: 'staging-private-rt',
//  }
//})


//Create Security Group

const securityGroup = new SecurityGroup('staging-ec2-sg', {
  description: 'Security group for Staging EC2 instances',
  vpcId: vpcStaging.id,
  ingress: [
    {
      protocol: 'tcp',
      fromPort: 22,
      toPort: 22,
      cidrBlocks: ['10.0.0.0/16'],
    },
  ],
  egress: [
    {
      protocol: "-1",
      fromPort: 0,
      toPort: 0,
      cidrBlocks: ["0.0.0.0/0"],
    },
  ],
  tags: {
    Name: 'staging-ec2-sg',
  },
});



//Create EC2 Instance
const instance = new Instance('staging-ec2', {
  instanceType: InstanceType.T2_Micro,
  ami: 'ami-0f209d0bb2c44ea6c',
  subnetId: privateSubnet.id,
  vpcSecurityGroupIds: [securityGroup.id],
  tags: {
    Name: 'staging-ec2',
  }
})

//Create DB


//Create ElastiCache Redis


//Create s3 bucket

//// Create an AWS resource (S3 Bucket)
//const bucket = new aws.s3.Bucket("staging-bucket", {
//  website: {
//    indexDocument: 'index.html',
//  }
//});

//// Export the name of the bucket
//export const bucketName = bucket.id;

//const ownershipControls = new aws.s3.BucketOwnershipControls('ownership-controls', {
//  bucket: bucketName,
//  rule: {
//    objectOwnership: 'ObjectWriter',
//  }
//})

//const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
//  bucket: bucketName,
//  blockPublicAcls: false,
//})

//const bucketObject = new aws.s3.BucketObject('index.html', {
//  bucket: bucketName, 
//  source: new pulumi.asset.FileAsset('./index.html'),
//  contentType: 'text/html',
//  acl: 'public-read',
//}, { dependsOn: [publicAccessBlock, ownershipControls]})

//export const bucketObjectName = bucketObject.id;

//export const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;


//Create SSH Tunnel
