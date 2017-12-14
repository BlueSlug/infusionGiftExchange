# infusionGiftExchange

## What Is This?

Infusion grade for choosing gift exchange recipients and emailing the participants with their recipient. Attempts were made to use the most efficient algorithms for recipient selection, but latest approach is more or less brute-force. As such, this may not be scalable for very large gift exchanges :)

## Goals

* Based on a list of participants, assign a recipient to each, ideally using an efficient algorithm
* Once the recipients have been assigned, send an email message to each participants
* Being made in Infusion, the various options and settings should be easily overridden and customized

## Notes

Uses [Nodemailer](https://nodemailer.com). This project is not intended to be used as a spambot, its sole purpose is to take in a list of participants and send them some information relating directly to their gift exchange. Don't be a jerk!

## Usage

See [`examples/js/giftExchangeBasic.js`](examples/js/giftExchangeBasic.js) for an example of usage. Basic example does not provide a working configuration for sending email, but the settings are very similar to those in Nodemailer.

If, for example, you would like to send via Gmail, there are many tutorials or discussion threads available online (I won't pick a favourite at this time).

If you'd like to use some nodemailer.transporter keys which are not available in infusionGiftExchange, you can make use of the giftExchangeOptions.customTransportKeys block to substitute your own custom keys. Of course there's always the option to fork and extend the project.
