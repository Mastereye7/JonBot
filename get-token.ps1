$text = Get-Content .\permissions.txt -Raw
twitch token -u -s $text
pause