# s3-pgp-transform
PGP encrypts files added to an encryption S3 bucket, and PGP decrypts files added to a decryption bucket.

Based on initial work https://github.com/bmalnad/s3-pgp-encryptor by [Dan Lamb](https://github.com/bmalnad).

Re-written to support streaming (capped memory usage), ES module style, and encryption + decryption.

Curently supports decrypting/encrypting files up to approx. 12GB, limited by max runtime of 15 minutes in a lambda.

## Statistics

gpg ECC-ECC key with NIST-256 ECC
Tests with different source sizes, and different compresion (either default or off) for GPG


| Source Size | GPG size | Lambda Execution Time | Lambda Max Mem Usage 
| ----------- | -------- | --------------------- | -------------------- 
| 95MB        | 35MB     | 9s                    | 303 MB 
| 959MB       | 961MB    | 66s                   | 412 MB 
| 959MB       | 320MB    | 70s                   | 519 MB 
| 9.3GB       | 3.0GB    | 758s                  | 525 MB 

Approx. 12MB/s, with capped memory usage for compressed files.
Approx. 14MB/s for uncompressed files.

This compares with approx 50-400MB/s for a local on-disk gnupg, so there is plenty of opportunity for optimisation.

## Deployment Instructions 

Uses serverless to deploy, alter serverless.yml to specify buckets.

Installation instructions (for mac, replace brew with your package manager):

```
npm install
aws configure
serverless deploy

brew install gnupg
base64 -d pgp-private.key.b64 | gpg --import

(cd test; . enctest.sh)
(cd test; . dectest.sh)
```

### Setup the large/performance test files
This needs approx. 15GB as it creates test files 100MB, 1GB & 10GB raw, 
and then compressed and encrypted versions (see setuptest.sh)
```
(cd test; . setuptest.sh)
```

### Copy into S3 manually, then invoke the function locally 
```
aws s3 cp local/enwik8 s3://mg-s3-pgp-enc-bucket/
```
Check in the cloudwatch dashboard for any errors.


If it fails in AWS, you can test locally via e.g.:
```
 serverless invoke local -f ecrypt -d "{'Records': [{ 's3': { 'bucket': { 'name':'mg-s3-pgp-enc-bucket' }, 'object': { 'key':'enwik8' } } }] }" 
```

The code will check whether an existing output file exists with a later date, and if so, will not overwrite.


## License
&copy; 2019 [Martin Granell](https://github.com/mgranell). This project is available under the terms of the MIT license.