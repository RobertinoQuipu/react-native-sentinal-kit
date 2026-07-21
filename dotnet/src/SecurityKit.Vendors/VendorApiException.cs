namespace SecurityKit.Vendors;

/// <summary>
/// Thrown when a vendor API call fails (network error, non-success status code,
/// or a response that cannot be deserialized into the expected shape).
/// </summary>
public sealed class VendorApiException : Exception
{
    /// <summary>The vendor that produced the error (e.g. "ThreatMetrix", "Trusteer").</summary>
    public string Vendor { get; }

    /// <summary>The HTTP status code, if the failure was an HTTP response. Null for transport-level failures.</summary>
    public int? StatusCode { get; }

    public VendorApiException(string vendor, string message, int? statusCode = null, Exception? innerException = null)
        : base(message, innerException)
    {
        Vendor = vendor;
        StatusCode = statusCode;
    }
}
