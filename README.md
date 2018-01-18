# electrumizer
Proof of concept exploit for Electrum Bitcoin Wallet's [JSON-RPC vulnerability](https://github.com/spesmilo/electrum-docs/blob/master/cve.rst).

## Frequently Asked Questions

#### How do I check if my Electrum Bitcoin Wallet is vulnerable?

Run Electrum, and browse to http://www.electrumizer.com.

Open your browser's console window (F12 on Chrome), and wait for the "done" message. If your 12-words seed is shown, you're vulnerable.

#### How does the test work?

The test finds all running instances of Electrum using some kind of in-browser [port scanning](https://en.wikipedia.org/wiki/Port_scanner).

It then asks each running instance for its 12-words seed.

This is all done in-browser, without installing any software.

#### What should I do if my Electrum Bitcoin Wallet is vulnerable?

Install the latest version of [Electrum Bitcoin Wallet](https://electrum.org/#download).

If you think your old wallet has already been compromised, create a new wallet (new 12-words seed) and transfer your old wallet's entire balance to your new wallet.

#### Are you going to steal my bitcoin?

Probably not, but others may not be so nice.

## Technical Questions

#### Why doesn't [electrumizer.com](http://www.electrumizer.com) use HTTPS?

The test communicates with your local Electrum wallet over unencrypted HTTP, as browsers reject Electrum's self-signed certificate.

Since browsers forbid HTTPS websites from communicating over HTTP, [electrumizer.com](http://www.electrumizer.com) must be served over HTTP as well.

#### Can I run the test locally?

Yes. Download the HTML and JS files, and knock yourself out.
