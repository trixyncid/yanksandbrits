# WhatsApp gateway (counsellor alerts)

When leads are assigned in **CMS › Leads**, the counsellor gets one WhatsApp message listing their new leads, each with a tap-to-chat link. The CMS sends it through **GOWA** ([go-whatsapp-web-multidevice](https://github.com/aldinokemal/go-whatsapp-web-multidevice)), a free, open-source (MIT) gateway you run yourself.

> **Unofficial.** GOWA links an ordinary WhatsApp number the way WhatsApp Web does. It is fine for a handful of internal alerts a day to your own team, but WhatsApp can restrict numbers that look like bulk senders. Use a **dedicated number** for the gateway (a cheap prepaid SIM is enough), never a counsellor's personal number, and do not use it to message leads in bulk. If you ever need guaranteed delivery at scale, move to the official WhatsApp Business Platform.

Without the gateway, nothing breaks: assignment still works, the Leads page says alerts are not set up, and each assignment offers a **Send alert from my WhatsApp** link with the message ready.

## 1. Run GOWA

Any small server that stays on works (1 vCPU / 512 MB is plenty). With Docker:

```yaml
# docker-compose.yml
services:
  whatsapp:
    image: aldinokemal2104/go-whatsapp-web-multidevice:latest # pin a version tag once it works
    command: rest
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000" # local only: put HTTPS in front, or keep it on a private network
    environment:
      APP_BASIC_AUTH: "cms:${WA_GATEWAY_PASSWORD}"
      APP_PORT: "3000"
    volumes:
      - whatsapp-data:/app/storages # keeps the linked session across restarts
volumes:
  whatsapp-data:
```

```sh
WA_GATEWAY_PASSWORD="$(openssl rand -base64 24)" docker compose up -d
```

Keep that password; the CMS needs it.

**Security:** the gateway can send messages as your number. Never expose it to the internet without HTTPS and basic auth. Best is a private network between the CMS server and the gateway (same VPC, Tailscale, or a reverse proxy that only the CMS can reach).

## 2. Link the WhatsApp number

1. Open the gateway's web page (e.g. `https://wa-gateway.example.com`) and sign in with `cms` and the password.
2. Choose **Login**, then on the alert phone open WhatsApp › **Linked devices** › **Link a device** and scan the QR code.
3. Send yourself a test message from the gateway page.

The link survives restarts thanks to the volume. If the phone stays offline for about two weeks, WhatsApp unlinks it; the Leads page will then say *"The WhatsApp number is not linked to the gateway"* and you scan again.

## 3. Connect the CMS

Set these on the CMS server and restart it:

```sh
WA_GATEWAY_URL=https://wa-gateway.example.com   # no trailing path
WA_GATEWAY_USERNAME=cms
WA_GATEWAY_PASSWORD=...                          # from step 1
WA_GATEWAY_DEVICE_ID=                            # only if the gateway has more than one linked number
```

Open **CMS › Leads**: the note at the top should read **WhatsApp alerts are on**.

## 4. Add counsellors' numbers

In **CMS › People › Counsellors**, open each counsellor and fill in **Lead alerts › WhatsApp number**. It is private: it is never sent to the public site. A counsellor without a number can still be assigned leads; the CMS just says they were not alerted.

## What gets sent

```
Hi Ayu, 2 new leads have been assigned to you.

1. *Sari Wulandari*
   IELTS · Paid social
   +62 812-3456-7890 · https://wa.me/6281234567890

2. *Rizky Pratama*
   TOEFL, IELTS · Organic search
   +62 812-9999-0012 · https://wa.me/6281299990012

Please contact each of them within one business day.
Assigned by Winsten · Yanks and Brits CMS
```

One message per assignment, however many leads (the first 15 are listed). Reassigning a lead alerts the new counsellor; leads already with that counsellor are not re-sent. Each lead records whether its alert went out, and a failed alert can be retried from the lead's page.

## Troubleshooting

| Leads page says | Fix |
|---|---|
| WhatsApp alerts are not set up | `WA_GATEWAY_URL` is empty on the CMS server. |
| The WhatsApp gateway could not be reached | The gateway is down or the URL is wrong. `docker compose ps`, then check the URL from the CMS server. |
| The WhatsApp gateway rejected the username or password | `WA_GATEWAY_USERNAME` / `WA_GATEWAY_PASSWORD` do not match `APP_BASIC_AUTH`. |
| The WhatsApp number is not linked to the gateway | Scan the QR code again (step 2). |

Code: `src/lib/whatsapp/gateway.ts` (client), `src/lib/leads/alert.ts` (message), `src/lib/leads/assign.ts` (assignment and alerts).
