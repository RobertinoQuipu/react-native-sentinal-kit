using System.Text.Json.Serialization;

namespace SecurityKit.Vendors.Trusteer;

/// <summary>
/// Result of an IBM Trusteer Pinpoint device risk assessment.
///
/// NOTE: Property/JSON names model the documented public shape. Your tenant's
/// contract may use different names — adjust the [JsonPropertyName] attributes.
/// </summary>
public sealed class TrusteerResult
{
    /// <summary>Risk score in the range 0-1000 (higher is riskier).</summary>
    [JsonPropertyName("riskScore")]
    public int RiskScore { get; set; }

    [JsonPropertyName("malwareDetected")]
    public bool MalwareDetected { get; set; }

    /// <summary>Remote access tool detected.</summary>
    [JsonPropertyName("rat")]
    public bool Rat { get; set; }

    [JsonPropertyName("emulator")]
    public bool Emulator { get; set; }

    [JsonPropertyName("rooted")]
    public bool Rooted { get; set; }

    [JsonPropertyName("overlayDetected")]
    public bool OverlayDetected { get; set; }

    [JsonPropertyName("accessibilityRisk")]
    public bool AccessibilityRisk { get; set; }

    [JsonPropertyName("vpn")]
    public bool Vpn { get; set; }

    [JsonPropertyName("recommendations")]
    public IReadOnlyList<string> Recommendations { get; set; } = Array.Empty<string>();
}
