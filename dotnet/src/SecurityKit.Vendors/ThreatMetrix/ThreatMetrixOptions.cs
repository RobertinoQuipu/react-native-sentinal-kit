namespace SecurityKit.Vendors.ThreatMetrix;

/// <summary>
/// Configuration for <see cref="ThreatMetrixClient"/>.
///
/// NOTE: Field names below model the documented, public "Session Query" shape of
/// LexisNexis ThreatMetrix. Exact request/response contracts are governed by your
/// tenant/NDA and may differ — adjust to match your customer's contract.
/// </summary>
public sealed class ThreatMetrixOptions
{
    /// <summary>Base URL for the Session Query API endpoint.</summary>
    public string BaseUrl { get; set; } = "https://h-api.online-metrix.net/api/session-query";

    /// <summary>Organization identifier issued by the vendor.</summary>
    public string OrgId { get; set; } = string.Empty;

    /// <summary>API key / shared secret issued by the vendor. Do NOT hardcode; supply via config/env.</summary>
    public string ApiKey { get; set; } = string.Empty;

    /// <summary>
    /// When true (the default), no network calls are made and a canned, realistic
    /// response is returned. Flip to false once real credentials are configured.
    /// </summary>
    public bool Sandbox { get; set; } = true;
}
