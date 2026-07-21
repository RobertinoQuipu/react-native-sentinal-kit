using System.Net.Http.Json;
using System.Text.Json;

namespace SecurityKit.Vendors.ThreatMetrix;

/// <summary>
/// Client for the LexisNexis ThreatMetrix Session Query API (device/session risk).
///
/// The <see cref="HttpClient"/> is injected so the client is testable; a sample or
/// service can simply pass <c>new HttpClient()</c> or a pooled instance.
/// </summary>
public sealed class ThreatMetrixClient
{
    private const string VendorName = "ThreatMetrix";

    private readonly HttpClient _http;
    private readonly ThreatMetrixOptions _options;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public ThreatMetrixClient(HttpClient http, ThreatMetrixOptions options)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));
        _options = options ?? throw new ArgumentNullException(nameof(options));
    }

    /// <summary>
    /// Profiles a session and returns its risk assessment.
    /// In sandbox mode returns a canned "trusted" result without any network call.
    /// </summary>
    public async Task<ThreatMetrixResult> ProfileAsync(string sessionId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
            throw new ArgumentException("sessionId is required.", nameof(sessionId));

        if (_options.Sandbox)
            return CannedResult(sessionId);

        // The documented Session Query API accepts org_id + api_key + session_id.
        // Exact parameter names / transport (form vs JSON) are tenant-specific.
        var payload = new Dictionary<string, string>
        {
            ["org_id"] = _options.OrgId,
            ["api_key"] = _options.ApiKey,
            ["session_id"] = sessionId,
            ["output_format"] = "json"
        };

        try
        {
            using var response = await _http.PostAsJsonAsync(_options.BaseUrl, payload, JsonOptions, ct)
                .ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
                throw new VendorApiException(
                    VendorName,
                    $"Session Query failed with status {(int)response.StatusCode}: {body}",
                    (int)response.StatusCode);
            }

            var result = await response.Content
                .ReadFromJsonAsync<ThreatMetrixResult>(JsonOptions, ct)
                .ConfigureAwait(false);

            if (result is null)
                throw new VendorApiException(VendorName, "Empty or unparseable response body.");

            return result;
        }
        catch (VendorApiException)
        {
            throw;
        }
        catch (OperationCanceledException) when (ct.IsCancellationRequested)
        {
            throw;
        }
        catch (Exception ex)
        {
            throw new VendorApiException(VendorName, $"Session Query request failed: {ex.Message}", innerException: ex);
        }
    }

    private static ThreatMetrixResult CannedResult(string sessionId) => new()
    {
        RiskRating = RiskRating.Trusted,
        Reasons = new[] { "known_device", "consistent_geo", "no_anomalies" },
        DeviceId = $"tmx-device-{Math.Abs(sessionId.GetHashCode()):x8}",
        Vpn = false,
        Proxy = false,
        Tor = false,
        Emulator = false
    };
}
