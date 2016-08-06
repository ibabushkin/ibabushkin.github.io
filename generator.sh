#!/bin/sh

# initialize the index
printf "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset="utf-8" />\n<title>/dev/thoughtbin</title>\n<style type="text/css">body{margin:40px auto;max-width:700px;text-align:justify;line-height:1.6;font-size:16px;color:#444;padding:0 10px}h1,h2,h3{line-height:1.2}</style>\n</head>\n" > index.html
echo "<h1>/dev/thoughtbin</h1>" >> index.html
cat banner >> index.html

# process every file
for file in sources/*.md
do
	# useless output
	echo "processing $file..."

	# get basename
	a=`basename "$file" .md`

	# generate article HTML
	pandoc -o "$a.html" --template=template -B header -A footer "$file"

	# add links to index
	echo "<a href=\"$a\">$a</a><br/>" >> index.html
done

# finalize index
printf "</body>\n</html>\n" >> index.html

# add all other files to git
git add *.html
