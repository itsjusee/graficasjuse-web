$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$address = [Net.IPAddress]::Parse('192.168.1.136')
$listener = [Net.Sockets.TcpListener]::new($address, 8080)
$files = @{
    '/' = @('index.html', 'text/html; charset=utf-8')
    '/index.html' = @('index.html', 'text/html; charset=utf-8')
    '/styles.css' = @('styles.css', 'text/css; charset=utf-8')
    '/app.js' = @('app.js', 'application/javascript; charset=utf-8')
}
$listener.Start()
Write-Host 'Vista local: http://192.168.1.136:8080 (Ctrl+C para detener)'
try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        try {
            $client.ReceiveTimeout = 3000
            $stream = $client.GetStream()
            $reader = [IO.StreamReader]::new($stream)
            $request = $reader.ReadLine()
            if (!$request) { continue }
            $parts = $request.Split(' ')
            $path = $parts[1].Split('?')[0]
            $line = $reader.ReadLine()
            while ($line) { $line = $reader.ReadLine() }
            $status = '404 Not Found'
            $type = 'text/plain; charset=utf-8'
            $body = [Text.Encoding]::UTF8.GetBytes('No encontrado')
            if ($parts[0] -eq 'GET' -and $files.ContainsKey($path)) {
                $entry = $files[$path]
                $body = [IO.File]::ReadAllBytes((Join-Path $root $entry[0]))
                $type = $entry[1]
                $status = '200 OK'
            }
            $header = [Text.Encoding]::ASCII.GetBytes("HTTP/1.1 $status`r`nContent-Type: $type`r`nContent-Length: $($body.Length)`r`nCache-Control: no-store`r`nConnection: close`r`n`r`n")
            $stream.Write($header, 0, $header.Length)
            $stream.Write($body, 0, $body.Length)
        } catch {
            Write-Verbose $_
        } finally { $client.Dispose() }
    }
} finally { $listener.Stop() }
