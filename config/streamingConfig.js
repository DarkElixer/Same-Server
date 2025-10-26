// Streaming optimization configuration
module.exports = {
  // Timeout settings
  timeouts: {
    segment: 30000,      // 30 seconds for segment requests
    manifest: 15000,     // 15 seconds for manifest requests  
    connection: 45000    // 45 seconds for route-level timeout
  },
  
  // Axios configuration for streaming requests
  axiosConfig: {
    maxRedirects: 5,
    timeout: 30000,
    validateStatus: (status) => status < 400,
    headers: {
      'Connection': 'keep-alive',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
  },
  
  // Response headers for streaming
  streamingHeaders: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  
  // Supported video formats for segment detection
  supportedFormats: ['.ts', '.m3u8', '.m4s', '.mp4', '.webm'],
  
  // Buffer size settings (if needed for future enhancements)
  bufferSettings: {
    highWaterMark: 64 * 1024,  // 64KB buffer
    maxBufferSize: 1024 * 1024 // 1MB max buffer
  }
};
