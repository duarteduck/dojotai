param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

git add .
git commit -m $Message
clasp push
git push github main