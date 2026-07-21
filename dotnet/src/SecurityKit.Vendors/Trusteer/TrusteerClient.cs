using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace SecurityKit.Vendors.Trusteer;

/// <summary>
/// Client for the IBM Trusteer Pinpoint device risk assessment REST API.
///
/// The <see cref="HttpClient"/> is injected so the client is testable; a sample or
/// service can simply pass <c>new HttpClient()</c> or a pooled instance.
/// </summary>
public sealed class TrusteerClient
{
    private const string VendorName = "Trusteer";

    private readonly HttpClient _http;
    private readonly TrusteerOptions _options;

    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public TrusteerClient(HttpClient http, TrusteerOptions options)
    {
        _http = http ?? throw new ArgumentNullException(nameof(http));
        _options = options ?? throw new ArgumentNullException(nameof(options));
    }

    /// <summary>
    /// Assesses device risk for a customer and returns the risk result.
    /// In sandbox mode returns a canned low-risk result without any network call.
    /// </summary>
    public async Task<TrusteerResult> AssessAsync(string customerId, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(customerId))
            throw new ArgumentException("customerId is required.", nameof(customerId));

        if (_options.Sandbox)
            return CannedResult();

        // The documented assess call takes a customerId. Auth is typically a bearer
        // token / API key header; exact header name is tenant-specific.
        var payload = new { customerId };

        try
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, _options.BaseUrl)
            {
                Content = JsonContent.Create(payload, options: JsonOptions)
            };
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

            using var response = await _http.SendAsync(request, ct).ConfigureAwait(false);

            if (!response.IsSuccessStatusCode)
            {
                var body = await response.Content.ReadAsStringAsync(ct).ConfigureAwait(false);
                throw new VendorApiException(
                    VendorName,
                    $"Assess failed with status {(int)response.StatusCode}: {body}",
                    (int)response.StatusCode);
            }

            var result = await response.Content
                .ReadFromJsonAsync<TrusteerResult>(JsonOptions, ct)
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
            throw new VendorApiException(VendorName, $"Assess request failed: {ex.Message}", innerException: ex);
        }
    }

    private static TrusteerResult CannedResult() => new()
    {
        RiskScore = 120,
        MalwareDetected = false,
        Rat = false,
        Emulator = false,
        Rooted = false,
        OverlayDetected = false,
        AccessibilityRisk = false,
        Vpn = false,
        Recommendations = new[] { "allow" }
    };
}
