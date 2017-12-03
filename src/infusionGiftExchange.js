/*
Copyright 2017 Gregor Moss
Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.
You may obtain a copy of the ECL 2.0 License and BSD License at
TODO ADD URL TO LICENCE
*/

"use strict";

var fluid = require("infusion");
fluid.setLogging(true);

var nodemailer = require("nodemailer");

fluid.defaults("fluid.giftExchange", {
    gradeNames: "fluid.component",
    giftExchangeOptions: {
        hostAddress: null,
        hostPort: 25, //default SMTP port
        hostSecure: false,
        hostAuth: {
            username: null,
            password: null
        },
        mailerDebug: false,
        mailerLogging: false,
        messageSubject: "Gift Exchange!",
        // messageTextTemplate may contain references to %name,
        // %recipient and %interests, though none are required
        messageTextTemplate: "Hey %name! Your gift exhange recipient is %recipient! They are interested in: %interests.\nHappy giving!",
        senderAddress: null // sender's email address, should be accepted by host
    },
    participants: [
        // An array of participants in the gift exhange,
        // each with a name, valid email address and interests.
        // A recipientName will be added and filled in by the program
        /*
        {
            name: "Firstname Lastname",
            emailAddress: "email.address@domain.url",
            interests: "cats, dogs, snow"
        }
        */
    ],
    invokers: {
        selectAndNotifyParticipants: {
            funcName: "fluid.giftExchange.selectAndNotifyParticipants",
            args: ["{that}.options.participants", "{that}.options.giftExchangeOptions"]
        }
    }
});

fluid.giftExchange.selectAndNotifyParticipants = function (participants, giftExchangeOptions) {
    fluid.log(fluid.logLevel.IMPORTANT, "infusionGiftExchange has started!");

    participants = fluid.giftExchange.selectRecipients(participants);

    var emailTransporter = fluid.giftExchange.getEmailTransporter(giftExchangeOptions);
    fluid.each(participants, function (participant) {
        fluid.giftExchange.notifyParticipant(participant, giftExchangeOptions, emailTransporter);
    });

    fluid.log(fluid.logLevel.IMPORTANT, "infusionGiftExchange has finished!");
};

// swaps the positions (indexes) of two elements in a collection
fluid.giftExchange.swapPositions = function (collection, indexOne, indexTwo) {
    var pocket = fluid.copy(collection[indexOne]);
    collection[indexOne] = fluid.copy(collection[indexTwo]);
    collection[indexTwo] = fluid.copy(pocket);

    return collection;
};

// Returns the number of derangements for a collection of size n
// As described in: http://epubs.siam.org/doi/pdf/10.1137/1.9781611972986.7
fluid.giftExchange.numberOfDerangements = function (n) {
    return Math.floor((fluid.giftExchange.factorial(n) + 1) / Math.E);
};

// Returns n factorial. This could get messy...
fluid.giftExchange.factorial = function (n) {
    return n * (n === 1 || n === 0 ? 1 : fluid.giftExchange.factorial(n - 1));
};

// given a list of participants, selects a unique recipient for each one
// participants: a list of participants, each with a name and email value
// returns: the list of participants with the recipient keys added and filled in
fluid.giftExchange.selectRecipients = function (participants) {
    // Try random permutations until we find one that works. Not the most elegant solution.
    var isValidAssignment;
    while (!isValidAssignment) {
        isValidAssignment = true;
        var randomArrangement = fluid.giftExchange.shuffleParticipants(fluid.copy(participants));

        // eslint-disable-next-line no-loop-func
        fluid.each(participants, function (participant, partIndex) {
            participant.recipientName = randomArrangement[partIndex].name;
            fluid.log(fluid.logLevel.INFO, "The participant is " + participant.name + ", recipient is " + participant.recipientName);
            return participant;
        });

        // eslint-disable-next-line no-loop-func
        fluid.each(participants, function (participant) {
            if (participant.name === participant.recipientName) {
                fluid.log(fluid.logLevel.INFO, "Invalid arrangement: " + participant.name + ", recipient is " + participant.recipientName);
                isValidAssignment = false;
            }
        });
    }

    fluid.log(fluid.logLevel.INFO, "Participants list after iteration", participants);

    return participants;
};

// Shuffles participants using a Fisher-Yates method
// From: https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
fluid.giftExchange.shuffleParticipants = function (participants) {
    for (var i = participants.length - 1; i > 0; i--) {
        var randomIndex = fluid.giftExchange.getRandomIndex(participants.length);
        participants = fluid.giftExchange.swapPositions(participants, i, randomIndex);
        fluid.log(fluid.logLevel.INFO, fluid.stringTemplate("Switched participant %i %iName with %r %rName",
            { i: i, iName: participants[i].name, r: randomIndex, rName: participants[randomIndex].name }));
    }

    return participants;
};

fluid.giftExchange.getEmailTransporter = function (giftExchangeOptions) {
    return nodemailer.createTransport({
        host: giftExchangeOptions.hostAddress,
        port: giftExchangeOptions.hostPort,
        secure: giftExchangeOptions.hostSecure, // true for 465, false for other ports
        auth: {
            user: giftExchangeOptions.hostAuth.username, // generated ethereal user
            pass: giftExchangeOptions.hostAuth.password  // generated ethereal password
        },
        logger: giftExchangeOptions.mailerLogging,
        debug: giftExchangeOptions.mailerDebug
    });
};

fluid.giftExchange.notifyParticipant = function (participant, giftExchangeOptions, emailTransporter) {
    var messageText = fluid.stringTemplate(giftExchangeOptions.messageTextTemplate,
        { name: participant.name, recipient: participant.recipientName, interests: participant.interests });
    fluid.log(fluid.logLevel.INFO, messageText);

    var mailOptions = {
        from: giftExchangeOptions.senderAddress,
        to: participant.emailAddress,
        subject: giftExchangeOptions.messageSubject,
        text: messageText
    };

    fluid.giftExchange.sendEmail(mailOptions, emailTransporter);
};

fluid.giftExchange.sendEmail = function (mailOptions, emailTransporter) {
    emailTransporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return fluid.log(fluid.logLevel.FATAL, error);
        }

        fluid.log(fluid.logLevel.IMPORTANT, "Message sent: %s", info.messageId);
        fluid.log(fluid.logLevel.IMPORTANT, nodemailer.getTestMessageUrl(info));
    });
};

// returns true if a participant is the same person as the recipient, false otherwise
// participant: an object containing strings representing name and emailAddress
// recipient: same structure as participant
fluid.giftExchange.participantIsRecipient = function (participant, recipient) {
    //console.log(recipient);
    if (participant && recipient) {
        if (participant.name !== recipient.name && participant.emailAddress !== recipient.emailAddress) {
            return false; // they aren't the same person
        } else {
            fluid.log(fluid.logLevel.INFO, "Problem: recipient is the participant: " + participant.name);
            return true; // they are the same person
        }
    } else {
        return false;
    }
};

// Returns an integer index value between 0 and a maximum value
// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
fluid.giftExchange.getRandomIndex = function (max) {
    return Math.floor(Math.random() * (max));
};
