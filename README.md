# update-blacklisted-ips

Service to retrieve the list stored in <https://github.com/peterjgrainger/blacklisted-ips> and store in Redis. Part of a full solution to keep blacklisted IP addresses up to date.

The code in this repository is the API called by a webhook configured in <https://github.com/peterjgrainger/blacklisted-ips>

## Environment Variables

GITHUB_TOKEN (required) - The rate limit for unauthorised requests tot he github API is low. App token or personal token.

REDIS_HOST (optional) - For production set to the AWS redis host.

## Where the lists come from

Based on the lists specified in Basic and Essential: <https://github.com/firehol/blocklist-ipsets#which-ones-to-use>

There would be two parts to it.

- Cron job
- Webhook API

Create an EC2 instance AMI with update-ipsets installed <https://github.com/firehol/blocklist-ipsets/wiki/installing-update-ipsets> and enable the following lists:

- feodo
- palevo
- sslbl
- Zeus
- Zeus_badips
- Dshield
- Spamhaus_drop
- Spamhaus_edrop
- Bogons
- Fullbogons
- openbl\*
- blocklist_de\*

IMPORTANT: update-ipsets must be configured to push a ipset file to a remote repo, <https://github.com/firehol/firehol/blob/623fa62185c12b819a34ca6393e66e2d072ff032/sbin/update-ipsets#L58>

Set a cron job to run this every 9 minutes: <https://github.com/firehol/blocklist-ipsets/wiki/downloading-ip-lists#periodic-updates---the-cron-job>

This script will updates the IP lists if they have changed. The updated lists commited to repository: <https://github.com/peterjgrainger/blacklisted-ips>

## Details of this API

Webhook API to update Redis with the new lists.

Logic for this API:

- Triggered by the Github webhook from <https://github.com/peterjgrainger/blacklisted-ips>
- Read all ipsets in the repo
- Expire all the keys
- Set Basic Level IPs to database "1"
- Set Essential Level IPs to database "2"
- Set All IPs to database "3".
- Add context to each key with the list they come from.
