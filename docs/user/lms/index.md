# LMS integrations

## Available guides

| LMS | BYTEGrader status | Documentation |
| --- | --- | --- |
| Moodle | Supported | [Connect Moodle](moodle.md) |
| Canvas | Adapter present; deployment guide pending validation | Planned |
| ILIAS | Integration support still needs implementation and validation | Planned |

## Shared LTI architecture

JupyterHub's LTI authenticator validates the login launch and creates the user session. BYTEGrader then uses LTI Advantage services for application data:

- **Names and Role Provisioning Services (NRPS)** supplies course membership and roles.
- **Assignment and Grade Services (AGS)** creates gradebook columns and receives scores.

## Prepare the signing key

All supported LMS integrations require BYTEGrader to sign OAuth client assertions. Generate one key pair per deployment:

```bash
openssl genpkey \
  -algorithm RSA \
  -out /etc/bytegrader/private.pem \
  -pkeyopt rsa_keygen_bits:2048
openssl pkey \
  -in /etc/bytegrader/private.pem \
  -pubout \
  -out /etc/bytegrader/public.pem
chmod 600 /etc/bytegrader/private.pem
chmod 644 /etc/bytegrader/public.pem
```