import {GenericContainer, StartedTestContainer} from "testcontainers";
import {constants} from "http2";
import {CreateBucketCommand, CreateBucketCommandInput, PutObjectCommand, S3Client} from "@aws-sdk/client-s3";

describe("S3 Tests Localstack", () => {
  jest.setTimeout(180000); //May take a while to DL the container image
  const BUCKET_NAME = "bucket";
  const AWS_REGION = "us-west-2";
  const ACCESS_KEY_ID = "someAccessKey";
  const SECRET_ACCESS_KEY = "someSecretAccessKey";
  const LOCALSTACK_EDGE_PORT = 4566;
  const REAL_LOCALSTACK = "0.13.2";
  const FIX_LOCALSTACK = "latest";
  let localstack: StartedTestContainer;
  let awsS3Client: S3Client;

  test("save a file to S3 with Real Localstack, errors out", async () => {
    localstack = await new GenericContainer(`localstack/localstack:${REAL_LOCALSTACK}`)
      .withEnv("AWS_DEFAULT_REGION", AWS_REGION)
      .withEnv("SERVICES", "s3")
      .withExposedPorts(LOCALSTACK_EDGE_PORT)
      .start();

    const endpoint = `http://localhost:${localstack.getMappedPort(LOCALSTACK_EDGE_PORT)}`;

    const createBucketCommandInput: CreateBucketCommandInput = {
      Bucket: BUCKET_NAME,
    };
    awsS3Client = new S3Client({
      logger: console,
      region: AWS_REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
      endpoint,
    })

    const createBucketCommand = new CreateBucketCommand(createBucketCommandInput);
    const createBucketCommandOutput = await awsS3Client.send(createBucketCommand);
    expect(createBucketCommandOutput.$metadata.httpStatusCode).toBe(constants.HTTP_STATUS_OK);
    const putObjectCommandInput = {
      Key: "/some/key/hello.txt",
      Body: JSON.stringify("Hello World"),
      Bucket: BUCKET_NAME,
    };
    const putObjectCommand = new PutObjectCommand(putObjectCommandInput);

    try {
      const putObjectCommandOutput = await awsS3Client.send(putObjectCommand);
    }catch(err: unknown) {
      if(err instanceof Error){
        expect(err.message).toBe("The specified bucket does not exist");
      }
      else{
        expect(true).toBe(false);
      }
    }finally{
      await localstack.stop();
    }
  });

  test("save a file to S3 with fixed Localstack, succeeds", async () => {
    localstack = await new GenericContainer("localstack/localstack-full:latest")
      .withEnv("AWS_DEFAULT_REGION", AWS_REGION)
      .withEnv("SERVICES", "s3")
      .withExposedPorts(LOCALSTACK_EDGE_PORT)
      .start();

    const endpoint = `http://localhost:${localstack.getMappedPort(LOCALSTACK_EDGE_PORT)}`;

    const createBucketCommandInput: CreateBucketCommandInput = {
      Bucket: BUCKET_NAME,
    };
    awsS3Client = new S3Client({
      logger: console,
      region: AWS_REGION,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
      endpoint,
    })

    const createBucketCommand = new CreateBucketCommand(createBucketCommandInput);
    const createBucketCommandOutput = await awsS3Client.send(createBucketCommand);
    expect(createBucketCommandOutput.$metadata.httpStatusCode).toBe(constants.HTTP_STATUS_OK);
    const putObjectCommandInput = {
      Key: "/some/key/hello.txt",
      Body: JSON.stringify("Hello World"),
      Bucket: BUCKET_NAME,
    };

    try {
      const putObjectCommand = new PutObjectCommand(putObjectCommandInput);
      const putObjectCommandOutput = await awsS3Client.send(putObjectCommand);
      /*
      {
      clientName: 'S3Client',
      commandName: 'PutObjectCommand',
      input: {
        Key: '/some/key/hello.txt',
        Body: '"Hello World"',
        Bucket: 'bucket'
      },
      output: {
        BucketKeyEnabled: undefined,
        ETag: '"5e7c683623bdabaeae97f8157e80f85c"',
        Expiration: undefined,
        RequestCharged: undefined,
        SSECustomerAlgorithm: undefined,
        SSECustomerKeyMD5: undefined,
        SSEKMSEncryptionContext: undefined,
        SSEKMSKeyId: undefined,
        ServerSideEncryption: undefined,
        VersionId: undefined
      },
      metadata: {
        httpStatusCode: 200,
        requestId: 'MRIGDTGEEP99SIIIF9SVZQ1I35YNVYAGKAPVEZQWJY6RC316CYZC',
        extendedRequestId: 'MzRISOwyjmnup46BEA7B0D023AE547/JypPGXLh0OVFGcJaaO3KW/hRAqKOpIEEp',
        cfId: undefined,
        attempts: 1,
        totalRetryDelay: 0
      }
    }
       */
      expect(putObjectCommandOutput.$metadata.httpStatusCode).toBe(200);
    }finally{
      await localstack.stop();
    }
  });
});