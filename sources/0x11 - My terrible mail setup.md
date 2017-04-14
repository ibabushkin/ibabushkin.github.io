# My terrible mail setup
Whew, the last post was a long time ago. Quite a lot of things were done with regards to
the topics discussed back then. However, this small writeup focuses on something
different, as the title already suggests. Let's dive straight in.

## What? And why?
We're talking about how I manage my email. So let's describe what exactly I do and why I
decided to pick that path.

All my mails, delivered to a multitude of accounts, get forwarded to my own mail server
running `OpenSMTPD`. Said server drops those mails in a maildir which I then p{u,o}ll
using `rsync` and view using `neomutt`. Tagging is done using `notmuch`. When sending
mail, I connect to the corresponding SMTP server using `msmtp` and let mutt figure out
what mail account to use for that. All credentials are managed using `pass` (and thus
GPG).

All this is geared towards having mail stored locally on my only machine I use for, well,
mail. Since I don't use other devices for this, the setup is quite simple to what other
people do, and by extension differs a bit. So let's document it. The benefits are quite
clear to me:

* simple and low-maintenance, we can use only components from a stock install of `OpenBSD`
  to handle the mail server.
* works well when you are frequently disconnected from the infamous intertubes.
* proper handling of my credentials and multiple accounts (I prefer not to make `mutt` do
  this as I use a centralized setup around `pass` - more on that later).

There are obviously some drawbacks (that I don't care about, but you might):

* multidevice support is lacking.
* a bit of a burden to set up as there are *many* components.
* mediocre support for getting mail pushed to you - I download it manually with a
  keybinding in `mutt`.

## How? - server side
Now that we have covered *what* I've set up, and *why* I chose those solutions, let's
elaborate on the concrete details.

![Not that kind of concrete.](https://i.giphy.com/13AePrrmDKCeVG.gif)

First, let's look at the server configuration. We're running `OpenSMTPD` on `OpenBSD`.

Assuming your mail server is running on a machine your MX records point to.

First, let's get some simple aliases into `/etc/mail/aliases`, mostly for local mail.
```
root: yourusername
manager: root
dumper: root
```

Next, make sure you have a Let's Encrypt SSL certificate (`acme-client` landed in base
from release 6.1 onwards). Based on that, here's my `OpenSMTPD` configuration in
`/etc/mail/smtpd.conf`:

```
# pki setup
pki your.domain key "/etc/ssl/acme/private/privkey.pem" # change the paths if necessary
pki your.domain certificate "/etc/ssl/acme/fullchain.pem"

# tables
table aliases file:/etc/mail/aliases

# listening ports
listen on all port 25 hostname your.domain tls pki your.domain
listen on all port 587 hostname your.domain tls-require pki your.domain auth mask-source

# allow all incoming mails for our domain
accept from any for domain "your.domain" alias <aliases> deliver to maildir "~/mail"
# allow all local mail
accept for local alias <aliases> deliver to maildir "~/mail"
accept from local for any relay
```

It's quite simple, but `smtpd.conf(5)` should tell you the rest.  Integrating spam
assassin or similar things hasn't yet been a priority for me, but can easily be done.

Now all your mails get dumped in one big maildir.

## How? - client side
### Sending mail with `msmtp`
Let's start with the easy things: sending mail using SMTP. You can use any SMTP client,
my choice is `msmtp` on Linux. My configuration in `~/.msmtprc` looks roughly like this:
```
defaults
auth on
tls on
tls_certcheck on
tls_trust_file /etc/ssl/certs/ca-certificates.crt

account personal
host mail.your.domain
port 587
from yourusername@your.domain
user yourusername
passwordeval "/path/to/get_pass.sh personal"

# more accounts here

account default : personal
```

Again, the configuration is quite simple, but the manpage - `msmtp(1)` this time - will
provide all the necessary details. The interesting bit is the `get_pass.sh` script:
```sh
#!/bin/sh
case "$1" in
    Enter*)
        pass my/ssh/key
        ;;
    personal)
        (pass my/mail/server || exit 1) | some processing pipeline to get your password
        ;;
    *)
        (pass "mail/$1" || exit 1) | another processing pipeline
        ;;
esac && echo "+" > ~/tmp/gpg_status_fifo
```

Let's break that down. The first case we care about here is rather cryptic. We use that to
call the script as a credential provider to `rsync` (actually `ssh` in that case), but
more on that later. The second case fetches your password for the user account you deliver
mails to - used for SMTP access. Finally, when the call to `pass` succeeds, we echo a
character to a FIFO. I use this to signify that a GPG agent is running in the background,
it's actually a detail specific to my window manager bar setup - you probably want to
remove or replace it.

### Pulling mail from our server
Now we have the groundwork done to send mail from our local machine. We also want to
receive mail there, and this is where our `fetch.sh` script comes in.

```sh
#!/bin/sh
export SSH_ASKPASS="/path/to/get_pass.sh"

# pull our mails from our server's maildir
rsync -hzPa --rsh="setsid ssh" --remove-source-files 'yourusername@yourserver:mail/new' ~/mail/inbox

# index new mail
notmuch new

# do some notmuch tagging here (example entries)
notmuch tag +openbsd -inbox -- from:openbsd.org or to:openbsd.org
notmuch tag +opensmtpd -inbox -- from:opensmtpd.org or to:opensmtpd.org
```

This uses our script to get the credentials from `pass` and `rsync`s your maildir into a
local directory. The relevant part of the maildir, anyway. The `--remove-source-files` is
optional. Then we tag our incoming mail according to user preference, using `notmuch`. To
set it up, run `notmuch setup` (and, again, see the manual).

### Fitting it all together
Now we have a running mail server, and facilities to send and fetch mail. The only missing
bit is viewing and managing mail. We use `mutt` for that.

Configuring `mutt` is a pretty broad topic, so I will only reproduce the most important
bits of my setup here. We point `mutt` at our maildir, and tell it how to send mail:
```mutt
set folder = $HOME/mail
set mbox_type = Maildir
set sendmail = "/usr/bin/msmtp"
set envelope_from = yes

set spoolfile = "+inbox"
set record = "+sent"
set postponed = "+drafts"
```

Now we get virtual mailboxes from `notmuch`
```mutt
# get our virtual mailboxes from notmuch
mailboxes "+drafts" "+inbox" "+sent"
set nm_default_uri = "notmuch:///home/yourusername/mail/"
set virtual_spoolfile = yes
virtual-mailboxes \
    "inbox" "notmuch://?query=tag:inbox and NOT tag:archive"\
    "sent" "notmuch://?query=tag:sent" \
    "work" "notmuch://?query=tag:work" \
    "openbsd" "notmuch://?query=tag:openbsd" \
    "opensmtpd" "notmuch://?query=tag:opensmtpd"
```

Other accounts get their own tags, of course (don't forget to make the fetch script tag
incoming mail accordingly). To set up account switching from the sender side, I use this:
```mutt
# work account
source ~/.mutt/work
folder-hook work "source ~/.mutt/work"
```

And in `~/.mutt/work`:
```mutt
set realname = "My Name Here"
set from = "me@workplace.tld"
```

Now, we use such a snippet for every account we use. Also make sure you add a folder hook
to every virtual mailbox you use, so that switching from any mailbox to any mailbox works
correctly.

This is the basics I use to send mail from mutt (modulo GPG, which is easy to factor in
here).

To fetch mail, I have a simple binding:
```mutt
macro index o "<shell-escape>/path/to/fetch.sh<enter>" "run rsync to fetch all mail"
```

This is the basic situation. My complete `.muttrc` can be found below, it includes some
other configuration as well. However, I don't recommend copying it verbatim. Instead,
write your own while tinkering with the components involved. That way you'll gain a proper
understanding of what is being done and why you want it. In this case, the focus was to
build a setup that gets me my mail when I ask for it and integrates said process with
`pass`. This is especially important to me, since I kill `gpg-agent` on every suspend or
screen locking to reduce the risk of my secrets getting leaked. Have fun experimenting
with this.

`~/.muttrc`:
```mutt
# where to find stuff
set alias_file = ~/.mutt/alias
set certificate_file = ~/.mutt/certs
set mailcap_path = ~/.mutt/mailcap
set tmpdir = ~/.mutt/tmp
set header_cache = ~/.cache/mutt
set folder = $HOME/mail
set mbox_type = Maildir
set sendmail = "/usr/bin/msmtp"

set spoolfile = "+inbox"
set record = "+sent"
set postponed = "+drafts"

# get our virtual mailboxes from notmuch
mailboxes "+drafts" "+inbox" "+sent"
set nm_default_uri = "notmuch:///home/yourusername/mail/"
set virtual_spoolfile = yes
virtual-mailboxes \
    "inbox" "notmuch://?query=tag:inbox and NOT tag:archive"\
    "sent" "notmuch://?query=tag:sent" \
    "work" "notmuch://?query=tag:work" \
    "openbsd" "notmuch://?query=tag:openbsd" \
    "opensmtpd" "notmuch://?query=tag:opensmtpd"

# work account
source ~/.mutt/work
folder-hook work "source ~/.mutt/work"

# personal account
source ~/.mutt/personal
folder-hook inbox "source ~/.mutt/personal"
folder-hook openbsd "source ~/.mutt/personal"
folder-hook opensmtpd "source ~/.mutt/personal"

# basic stuff
set wait_key = no
set delete
set quit
unset confirmappend
unset mark_old
set pipe_decode
set thorough_search

# status bar
set status_chars = " *%A"
set status_format = "───[ %f ]───[%r%m messages%?n? (%n new)?%?d? (%d to delete)?%?t? (%t tagged)? ]───%>─%?p?( %p postponed )?───"

# index options
set date_format = "%Y-%m-%d"
set index_format = "[%Z]  %D %-40.40F  %s"
set sort = threads
set sort_aux = reverse-last-date-received
set uncollapse_jump
set sort_re
set reply_regexp = "^(([Rr][Ee]?(\[[0-9]+\])?: *)?(\[[^]]+\] *)?)*"

# index keybindings
bind index gg first-entry
bind index G last-entry
bind index R group-reply
bind index <space> collapse-thread
bind index <tab> sync-mailbox
macro index o "<shell-escape>/path/to/fetch.sh<enter>" "run rsync to fetch all mail"

# sidebar options
set sidebar_visible = yes
set sidebar_width = 20

# sidebar keybindings
bind index,pager \Cj sidebar-next
bind index,pager \Ck sidebar-prev
bind index,pager \Cl sidebar-open
bind index,pager C change-vfolder

# pager options
set pager_index_lines = 10
set pager_context = 3
set pager_stop
set menu_scroll
set tilde
unset markers
set quote_regexp = "^( {0,4}[>|:#%]| {0,4}[a-z0-9]+[>|]+)+"
auto_view text/html
alternative_order text/plain text/enriched text/html

# pager keybindings
bind pager j next-line
bind pager k previous-line
bind pager gg top
bind pager G bottom
bind pager R group-reply

# search integration
set nm_query_type = threads
set nm_record = yes
set nm_record_tags = sent
bind index,pager N search-opposite
macro index,pager S "<vfolder-from-query>"
bind index,pager t entire-thread
bind index,pager x sidebar-toggle-virtual

# handle attachments
bind attach <return> view-mailcap
bind attach l view-mailcap

# writing mail
set editor = vim
set edit_headers = yes
set envelope_from = yes
set fast_reply
set askcc
set fcc_attach
unset mime_forward
set forward_format = "Fwd: %s"
set forward_decode
set attribution = "On %d, %n wrote:"
set reply_to
set reverse_name
set include
set forward_quote
bind compose p postpone-message
bind index p recall-message
bind compose P pgp-menu

# crypto
set crypt_autosign
set crypt_replyencrypt
set crypt_replysignencrypted
set crypt_use_gpgme
set crypt_opportunistic_encrypt

# colors
# source ~/.mutt/colors
```
