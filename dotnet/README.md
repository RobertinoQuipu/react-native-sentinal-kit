# SecurityKit .NET Vendor Clients

Standalone .NET 8 client library and console sample for calling two commercial
fraud/device-intelligence vendor APIs used alongside the mobile security SDK:

1. **LexisNexis ThreatMetrix** — device/session risk (Session Query API).
2. **IBM Trusteer Pinpoint** — device risk assessment (REST assess).

This code is **independent** of the TypeScript SDK in the parent repo.

## ⚠️ SECURITY NOTE

Embedding these vendor API keys in a **distributed client** (mobile app, desktop
app, SPA) is **insecure** — anyone can extract them and abuse your vendor quota or
impersonate your organization. These APIs should normally be called from a
**trusted backend/service**, with the mobile SDK forwarding only a session/device
token to that backend. This library is intended for that trusted backend role.

Never hardcode secrets. Supply credentials via environment variables or your
secret manager. With no keys present, the clients run in **sandbox mode** and
return realistic canned responses (no network calls).

> The request/response field names are modeled from documented **public** shapes.
> Exact vendor schemas are behind NDA and may need adjustment to your tenant's
> contract — see the inline comments in each `*Options`/`*Result` class.

## Build & Run

```sh
cd dotnet
dotnet build
dotnet run --project samples/SecurityKit.Sample
```

With no environment variables set, both clients run in sandbox mode and print
formatted JSON results.

## Environment variables

The sample defaults to **sandbox** when the corresponding API key is absent.

### ThreatMetrix

| Variable          | Purpose                                   |
| ----------------- | ----------------------------------------- |
| `TMX_API_KEY`     | API key. If unset → sandbox mode.         |
| `TMX_BASE_URL`    | Override the Session Query endpoint.      |
| `TMX_ORG_ID`      | Organization id.                          |
| `TMX_SESSION_ID`  | Session id to profile (has a demo default).|

### Trusteer

| Variable                | Purpose                                  |
| ----------------------- | ---------------------------------------- |
| `TRUSTEER_API_KEY`      | API key / bearer token. If unset → sandbox.|
| `TRUSTEER_BASE_URL`     | Override the assess endpoint.            |
| `TRUSTEER_CUSTOMER_ID`  | Customer id to assess (has a demo default).|

Example (real mode):

```sh
export TMX_API_KEY=... TMX_ORG_ID=... TMX_BASE_URL=https://...
export TRUSTEER_API_KEY=... TRUSTEER_CUSTOMER_ID=...
dotnet run --project samples/SecurityKit.Sample
```

## Library usage

```csharp
using var http = new HttpClient();

var tmx = new ThreatMetrixClient(http, new ThreatMetrixOptions { Sandbox = true });
ThreatMetrixResult r = await tmx.ProfileAsync("session-id");

var trusteer = new TrusteerClient(http, new TrusteerOptions { Sandbox = true });
TrusteerResult t = await trusteer.AssessAsync("customer-id");
```

The `HttpClient` is injected via the constructor so the clients are testable.
Errors surface as `VendorApiException` (with `Vendor` and optional `StatusCode`).

## Project layout

```
dotnet/
├── SecurityKit.sln
├── src/SecurityKit.Vendors/
│   ├── VendorApiException.cs
│   ├── ThreatMetrix/{ThreatMetrixOptions,ThreatMetrixResult,ThreatMetrixClient}.cs
│   └── Trusteer/{TrusteerOptions,TrusteerResult,TrusteerClient}.cs
└── samples/SecurityKit.Sample/Program.cs
```

The library uses only `System.Net.Http.Json` (no external NuGet packages).
