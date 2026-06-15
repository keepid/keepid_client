# Communications UI Local Guide

This branch adds:

- A top-nav **Calls** page for hotline call records and reporting.
- A client **Message Board** on worker/admin client profile views.
- Freeform send-now and scheduled-message composer UI.
- Voicemail transcript and call-link timeline items.

## Local Run

Run server-next first:

```bash
cd ../keepid_server_next
docker compose up -d postgres fake-gcs
./mvnw spring-boot:run
```

Run the client against server-next:

```bash
VITE_API_BASE=http://localhost:7001 npm start
```

Open:

```text
http://localhost:3000
```

Seeded worker login in the dev profile:

```text
demo-client / demo-pass
Use an existing seeded worker/admin account from the dev profile with demo-pass.
```

Use the worker/admin view for the communications surfaces.

## Screens To Review

Calls page:

```text
http://localhost:3000/communications/calls
```

Client profile message board:

```text
http://localhost:3000/profile/{clientUsername}
```

Message board visual preview:

```text
http://localhost:3000/communications/message-board-preview
```

The UI shows vision/demo rows when the API is empty so reviewers can inspect the workflow before live Twilio events exist locally.

## Twilio Flow

Twilio webhook setup lives in:

```text
../keepid_server_next/docs/communications-twilio-setup.md
```

The client does not receive Twilio credentials. It only calls authenticated Keep.id APIs.
