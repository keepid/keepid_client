# Communications UI Local Guide

This branch adds:

- A top-nav **Communications** workspace with contacts on the left and a chat-style conversation on the right.
- Contacts are sorted by most recent message, call, voicemail, note, or scheduled message history and can be searched from the left rail.
- A client **Message Board** on worker/admin client profile views.
- Freeform send-now, scheduled-message, call, and note controls in the chat composer.
- Voicemail transcript and call timeline items directly inside the chat thread.

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

Communications workspace:

```text
http://localhost:3000/communications
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
