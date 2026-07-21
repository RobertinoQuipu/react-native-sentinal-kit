namespace SecurityKit.Vendors.Trusteer;

/// <summary>
/// Configuration for <see cref="TrusteerClient"/>.
///
/// NOTE: Field names below model the documented, public shape of IBM Trusteer
/// Pinpoint. Exact request/response contracts are governed by your tenant/NDA and
/// may differ — adjust to match your customer's contract.
/// </summary>
public sealed class TrusteerOptions
{
    /// <summary>Base URL for the Pinpoint assess endpoint.</summary>
    public string BaseUrl { get; set; } = "https://api.pinpoint.trusteer.com/v1/assess";

    /// <summary>API key / bearer token issued by the vendor. Do NOT hardcode; supply via config/env.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// When true (the default), no network calls are made and a canned, realistic
    /// response is returned. Flip to false once real credentials are configured.
    /// </summary>
    public bool Sandbox { get; set; } = true;
}
