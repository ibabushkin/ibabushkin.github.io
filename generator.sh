#!/bin/sh

# initialize the index
printf "<html>\n<head>\n<title>/dev/thoughtbin</title>\n</head>\n" > index.html
echo "<h1>/dev/thoughtbin</h1>" >> index.html
cat banner >> index.html

# process every file
for file in *.md
do
	echo "processing $file..."
	a=`basename $file .md`
	pandoc -o "$a.html" -B header -A footer $file
	echo "<a href=\"$a.html\">$a</a><br/>" >> index.html
done

printf "</body>\n</html>\n" >> index.html
