#!/bin/sh

# initialize the index
printf "<html>\n<head>\n<title>/dev/thoughtbin</title>\n</head>\n" > index.html
echo "<h1>/dev/thoughtbin</h1>" >> index.html
cat banner >> index.html

# process every file
for file in *.md
do
	# useless output
	echo "processing $file..."

	# get basename
	a=`basename $file .md`

	# generate article HTML
	pandoc -o "$a.html" -B header -A footer $file

	# add links to index
	echo "<a href=\"$a\">$a</a><br/>" >> index.html

	# add plaintext links for markdown fans
	if [ -c $a ]
	then
		ln -s $file $a
	fi

	# add generated symbolic link to git
	git add $a
done

# finalize index
printf "</body>\n</html>\n" >> index.html

# add all other files to git
git add *.html
