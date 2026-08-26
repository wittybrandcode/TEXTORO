$ErrorActionPreference = 'Stop'

Write-Host '[SMOKE] Running UI syntax checks...'
node "$PSScriptRoot/check-ui-syntax.js"
if ($LASTEXITCODE -ne 0) { throw 'UI syntax check failed.' }

Write-Host '[SMOKE] Running UI/Host contract checks...'
node "$PSScriptRoot/check-hostbridge-contract.js"
if ($LASTEXITCODE -ne 0) { throw 'UI/Host contract check failed.' }

Write-Host '[SMOKE] Running host ES5/ES3 compliance checks...'
node "$PSScriptRoot/check-es5-host.js"
if ($LASTEXITCODE -ne 0) { throw 'Host ES5 compliance check failed.' }

Write-Host '[SMOKE] Running JSON polyfill parser checks...'
node "$PSScriptRoot/check-json-polyfill.js"
if ($LASTEXITCODE -ne 0) { throw 'JSON polyfill check failed.' }

Write-Host '[SMOKE] Running version consistency checks...'
node "$PSScriptRoot/check-version-consistency.js"
if ($LASTEXITCODE -ne 0) { throw 'Version consistency check failed.' }

Write-Host '[SMOKE] Running encoding checks (strict since F-04)...'
node "$PSScriptRoot/check-encoding.js"
if ($LASTEXITCODE -ne 0) { throw 'Encoding check failed.' }

Write-Host '[SMOKE] Running preset input boundary checks...'
node "$PSScriptRoot/check-preset-input-boundaries.js"
if ($LASTEXITCODE -ne 0) { throw 'Preset input boundary check failed.' }

Write-Host '[SMOKE] Running preset UI safety checks...'
node "$PSScriptRoot/check-preset-ui-safety.js"
if ($LASTEXITCODE -ne 0) { throw 'Preset UI safety check failed.' }

Write-Host '[SMOKE] Running host global collision checks...'
node "$PSScriptRoot/check-host-global-collisions.js"
if ($LASTEXITCODE -ne 0) { throw 'Host global collision check failed.' }

Write-Host '[SMOKE] ALL CHECKS PASSED'
