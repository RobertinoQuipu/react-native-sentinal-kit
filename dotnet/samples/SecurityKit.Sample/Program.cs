using System.Text.Json;
using SecurityKit.Vendors;
using SecurityKit.Vendors.ThreatMetrix;
using SecurityKit.Vendors.Trusteer;

// Read configuration from environment variables. When the API keys are absent we
// default to sandbox mode, which returns realistic canned responses with no network.
static string? Env(string name) => Environment.GetEnvironmentVariable(name);

var tmxApiKey = Env("TMX_API_KEY");
var tmxOptions = new ThreatMetrixOptions
{
    BaseUrl = Env("TMX_BASE_URL") ?? new ThreatMetrixOptions().BaseUrl,
    OrgId = Env("TMX_ORG_ID") ?? string.Empty,
    ApiKey = tmxApiKey ?? string.Empty,
    Sandbox = string.IsNullOrWhiteSpace(tmxApiKey)
};

var trusteerApiKey = Env("TRUSTEER_API_KEY");
var trusteerOptions = new TrusteerOptions
{
    BaseUrl = Env("TRUSTEER_BASE_URL") ?? new TrusteerOptions().BaseUrl,
    ApiKey = trusteerApiKey ?? string.Empty,
    Sandbox = string.IsNullOrWhiteSpace(trusteerApiKey)
};

var jsonOpts = new JsonSerializerOptions { WriteIndented = true };

using var http = new HttpClient
{
    Timeout = TimeSpan.FromSeconds(15)
};

Console.WriteLine($"ThreatMetrix sandbox={tmxOptions.Sandbox}, Trusteer sandbox={trusteerOptions.Sandbox}");
Console.WriteLine();

using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));

try
{
    var tmxClient = new ThreatMetrixClient(http, tmxOptions);
    var sessionId = Env("TMX_SESSION_ID") ?? "demo-session-12345";
    var tmxResult = await tmxClient.ProfileAsync(sessionId, cts.Token);

    Console.WriteLine("=== ThreatMetrix ===");
    Console.WriteLine(JsonSerializer.Serialize(tmxResult, jsonOpts));
    Console.WriteLine();

    var trusteerClient = new TrusteerClient(http, trusteerOptions);
    var customerId = Env("TRUSTEER_CUSTOMER_ID") ?? "demo-customer-67890";
    var trusteerResult = await trusteerClient.AssessAsync(customerId, cts.Token);

    Console.WriteLine("=== Trusteer ===");
    Console.WriteLine(JsonSerializer.Serialize(trusteerResult, jsonOpts));
}
catch (VendorApiException ex)
{
    Console.Error.WriteLine($"[{ex.Vendor}] vendor error (status={ex.StatusCode?.ToString() ?? "n/a"}): {ex.Message}");
    return 1;
}

return 0;
