# s3-pgp-transform
PGP encrypts files added to an encryption S3 bucket, and PGP decrypts files added to a decryption bucket.

Based on initial work https://github.com/bmalnad/s3-pgp-encryptor by [Dan Lamb](https://github.com/bmalnad).

Re-written to support streaming (capped memory usage), ES module style, and encryption + decryption.

Curently supports decrypting/encrypting files up to approx. 12GB, limited by max runtime of 15 minutes in a lambda.

## Statistics

gpg ECC-ECC key with NIST-256 ECC
Tests with different source sizes, and different compresion (either default or off) for GPG

Source Size | GPG size | Lambda Execution Time | Lambda Max Mem Usage |
95MB | 35MB | 9s | 303 MB |
959MB | 961MB | 66s | 412 MB |
959MB | 320MB | 70s | 519 MB |
9.3GB | 3.0GB | 758s | 525 MB |

Approx. 12MB/s, with capped memory usage for compressed files.
Appeox. 14MB/s for uncompressed files.

### Deployment Instructions 

Uses serverless to deploy, alter serverless.yml to specify buckets.

TODO: Setup instructions


### License
&copy; 2019 [Martin Granell](https://github.com/mgranell). This project is available under the terms of the MIT license.