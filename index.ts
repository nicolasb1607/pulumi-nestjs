import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";

// Create an AWS resource (S3 Bucket)
const bucket = new aws.s3.Bucket("staging-bucket", {
  website: {
    indexDocument: 'index.html',
  }
});

// Export the name of the bucket
export const bucketName = bucket.id;

const ownershipControls = new aws.s3.BucketOwnershipControls('ownership-controls', {
  bucket: bucketName,
  rule: {
    objectOwnership: 'ObjectWriter',
  }
})

const publicAccessBlock = new aws.s3.BucketPublicAccessBlock("public-access-block", {
  bucket: bucketName,
  blockPublicAcls: false,
})

const bucketObject = new aws.s3.BucketObject('index.html', {
  bucket: bucketName, 
  source: new pulumi.asset.FileAsset('./index.html'),
  contentType: 'text/html',
  acl: 'public-read',
}, { dependsOn: [publicAccessBlock, ownershipControls]})

export const bucketObjectName = bucketObject.id;

export const bucketEndpoint = pulumi.interpolate`http://${bucket.websiteEndpoint}`;
