using System.Text.Json.Serialization;

namespace SecurityKit.Vendors.ThreatMetrix;

/// <summary>Risk rating returned by ThreatMetrix for a session.</summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RiskRating
{
    Trusted,
    Neutral,
    Medium,
    High
}

/// <summary>
/// Result of a ThreatMetrix session profile.
///
/// NOTE: Property/JSON names model the documented public shape. Your tenant's
/// contract may use different names — adjust the [JsonPropertyName] attributes.
/// </summary>
public sealed class ThreatMetrixResult
{
    [JsonPropertyName("risk_rating")]
    public RiskRating RiskRating { get; set; }

    [JsonPropertyName("reasons")]
    public IReadOnlyList<string> Reasons { get; set; } = Array.Empty<string>();

    [JsonPropertyName("device_id")]
    public string? DeviceId { get; set; }

    [JsonPropertyName("vpn")]
    public bool Vpn { get; set; }

    [JsonPropertyName("proxy")]
    public bool Proxy { get; set; }

    [JsonPropertyName("tor")]
    public bool Tor { get; set; }

    [JsonPropertyName("emulator")]
    public bool Emulator { get; set; }
}
