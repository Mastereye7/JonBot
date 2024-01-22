$text = Get-Content .\scripts\permissions.txt -Raw
twitch token -u -s $text
pause